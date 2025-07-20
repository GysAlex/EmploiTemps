<?php

namespace App\Http\Controllers;

use App\Models\Timetable;
use App\Models\CourseSession;
use Illuminate\Http\Request;
use App\Models\TimeSlots;
use App\Models\User;
use App\Models\Classroom;
use App\Events\TimetablePublished;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB; // Pour les transactions de base de données

class CourseSessionController extends Controller
{
    /**
     * Synchronise les sessions de cours pour un emploi du temps donné.
     * Cette méthode gère la création, la mise à jour et la suppression des sessions en lot.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Timetable  $timetable  L'emploi du temps concerné (via Route Model Binding)
     * @return \Illuminate\Http\JsonResponse
     */
    public function syncSessions(Request $request, Timetable $timetable)
    {
        try {
            // 1. Valider les données entrantes
            // Les 'sessions' doivent être un tableau, chaque élément étant un objet avec les propriétés requises.
            $validatedData = $request->validate([
                'sessions' => ['nullable', 'array'], // Le tableau peut être vide si toutes les sessions sont supprimées
                'sessions.*.id' => ['nullable', 'integer', 'exists:course_sessions,id'], // ID optionnel pour les mises à jour
                'sessions.*.course_id' => ['required', 'integer', 'exists:courses,id'],
                'sessions.*.teacher_id' => ['required', 'integer', 'exists:users,id'], // Supposons que les enseignants sont des utilisateurs
                'sessions.*.room_id' => ['required', 'integer', 'exists:classrooms,id'],
                'sessions.*.time_slot_id' => ['required', 'integer', 'exists:time_slots,id'],
                'sessions.*.duration_minutes' => ['required', 'integer', 'min:1'],
                'sessions.*.session_type' => ['required', 'string', 'in:Cours Magistral,Travaux Dirigés,Travaux Pratiques,Examen'], // Types prédéfinis
                'sessions.*.notes' => ['nullable', 'string', 'max:500'],
            ]);

            $incomingSessionsData = $validatedData['sessions'] ?? []; // Sessions envoyées par le frontend

            // Récupérer l'ID de la semaine associée à l'emploi du temps actuel
            $currentWeekId = $timetable->week_id;

            // Utiliser une transaction pour garantir l'atomicité de l'opération
            DB::beginTransaction();

            // Récupérer les IDs des sessions existantes pour cet emploi du temps
            $existingSessionIds = $timetable->courseSessions()->pluck('id')->toArray();
            $incomingSessionIds = collect($incomingSessionsData)->pluck('id')->filter()->toArray(); // IDs des sessions qui ont un ID (pour les mises à jour)

            // Sessions à supprimer (celles qui existent mais ne sont pas dans les données entrantes)
            $sessionsToDelete = array_diff($existingSessionIds, $incomingSessionIds);
            if (!empty($sessionsToDelete)) {
                CourseSession::whereIn('id', $sessionsToDelete)->delete();
            }

            $syncedSessions = [];

            foreach ($incomingSessionsData as $sessionData) {
                // Associer la session à l'emploi du temps courant
                $sessionData['timetable_id'] = $timetable->id;

                // --- Validation des conflits de disponibilité ---
                // Vérifier si l'enseignant ou la salle est déjà réservé pour ce créneau horaire
                $conflictingSessionQuery = CourseSession::where('time_slot_id', $sessionData['time_slot_id'])
                    ->whereHas('timetable', function ($query) use ($currentWeekId) {
                        $query->where('week_id', $currentWeekId);
                    })
                    ->where(function ($query) use ($sessionData) {
                        $query->where('teacher_id', $sessionData['teacher_id'])
                              ->orWhere('room_id', $sessionData['room_id']);
                    });

                // Si c'est une mise à jour, exclure la session elle-même de la vérification de conflit
                if (isset($sessionData['id'])) {
                    $conflictingSessionQuery->where('id', '!=', $sessionData['id']);
                }

                $conflictingSession = $conflictingSessionQuery->first();

                if ($conflictingSession) {
                    DB::rollBack(); // Annuler la transaction
                    // Construire un message d'erreur plus spécifique
                    $errorMessage = 'Conflit de disponibilité détecté : ';
                    if ($conflictingSession->teacher_id === $sessionData['teacher_id']) {
                        $teacherName = User::find($sessionData['teacher_id'])->name ?? 'Enseignant inconnu';
                        $errorMessage .= "L'enseignant {$teacherName} est déjà affecté à un autre cours ";
                    }
                    if ($conflictingSession->room_id === $sessionData['room_id']) {
                        $roomName = Classroom::find($sessionData['room_id'])->name ?? 'Salle inconnue';
                        if ($conflictingSession->teacher_id === $sessionData['teacher_id']) {
                            $errorMessage .= "et ";
                        }
                        $errorMessage .= "la salle {$roomName} est déjà occupée ";
                    }
                    $timeSlot = TimeSlots::find($sessionData['time_slot_id']);
                    if ($timeSlot) {
                        $errorMessage .= "pour le créneau " . $timeSlot->day_of_week . " " . substr($timeSlot->start_time, 0, 5) . "-" . substr($timeSlot->end_time, 0, 5) . ".";
                    } else {
                        $errorMessage .= "pour ce créneau horaire.";
                    }

                    return response()->json([
                        'message' => $errorMessage,
                        'errors' => ['availability' => $errorMessage],
                    ], 409); // 409 Conflict
                }
                // --- Fin Validation des conflits de disponibilité ---


                if (isset($sessionData['id']) && in_array($sessionData['id'], $existingSessionIds)) {
                    // Mettre à jour une session existante
                    $session = CourseSession::find($sessionData['id']);
                    if ($session && $session->timetable_id === $timetable->id) { // S'assurer que la session appartient bien à cet emploi du temps
                        $session->update($sessionData);
                        $syncedSessions[] = $session;
                    }
                } else {
                    // Créer une nouvelle session
                    $session = CourseSession::create($sessionData);
                    $syncedSessions[] = $session;
                }
            }

            DB::commit(); // Confirmer la transaction

            // --- NOUVEAU : Déclenchez l'événement après une synchronisation réussie ---
            // Chargez la promotion et la semaine si elles ne le sont pas déjà, pour s'assurer que l'objet timetable
            // passé à l'événement est complet pour le listener.
            $timetable->loadMissing('promotion', 'week');
            TimetablePublished::dispatch($timetable);

            // Retourner les sessions synchronisées (optionnel, mais utile pour le frontend)
            return response()->json([
                'message' => 'Sessions de cours synchronisées avec succès.',
                'sessions' => $syncedSessions,
            ], 200);

        } catch (ValidationException $e) {
            DB::rollBack(); // Annuler la transaction en cas d'erreur de validation
            return response()->json([
                'message' => 'Erreur de validation des sessions de cours.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack(); // Annuler la transaction en cas d'erreur inattendue
            return response()->json([
                'message' => 'Une erreur est survenue lors de la synchronisation des sessions de cours.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function indexForTimetable(Timetable $timetable)
    {
        try {
            // 1. Récupérer toutes les sessions de cours associées à cet emploi du temps
            // Utilisez with() pour charger les relations nécessaires (course, teacher, classroom, timeSlot)
            // afin que le frontend ait toutes les données pour l'affichage.
            $courseSessions = CourseSession::where('timetable_id', $timetable->id)
                                           ->with(['course', 'teacher', 'classroom', 'timeSlot'])
                                           ->get();

            // 2. Retourner les sessions de cours
            return response()->json($courseSessions, 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur est survenue lors de la récupération des sessions de cours.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function downloadTimetablePdf(Timetable $timetable)
    {
        try {
            // Charger les relations nécessaires pour la vue PDF
            $timetable->load(['courseSessions.course', 'courseSessions.teacher', 'courseSessions.classroom', 'courseSessions.timeSlot', 'week', 'promotion']);
            $promotion = $timetable->promotion; // Récupérer la promotion associée

            // Vérifier si la promotion et la semaine sont chargées
            if (!$promotion || !$timetable->week) {
                return response()->json(['message' => 'Données d\'emploi du temps incomplètes pour la génération du PDF.'], 404);
            }

            // Générer le PDF à partir de la vue Blade
            // Assurez-vous que la vue 'pdfs.timetable' existe et est correctement formatée.
            $pdf = \PDF::loadView('pdfs.timetable', compact('timetable', 'promotion'));

            // Nom du fichier PDF
            $fileName = 'emploi_du_temps_' . $promotion->slug . '_semaine_' . $timetable->week->week_id . '.pdf';

            // Retourner le PDF en téléchargement
            return $pdf->download($fileName);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la génération du PDF de l\'emploi du temps : ' . $e->getMessage());
            return response()->json(['message' => 'Une erreur est survenue lors de la génération du PDF de l\'emploi du temps.', 'error' => $e->getMessage()], 500);
        }
    }
}
