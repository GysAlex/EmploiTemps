<?php

namespace App\Http\Controllers;

use App\Models\CourseSession;
use App\Models\User; // Assurez-vous que c'est votre modèle d'utilisateur
use App\Models\Week; // Importez le modèle Week
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TeacherScheduleController extends Controller
{
    /**
     * Récupère le planning et les statistiques pour l'enseignant authentifié.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTeacherSchedule(Request $request)
    {
        try {
            // Vérifie si l'utilisateur est authentifié
            if (!Auth::check()) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }

            $teacher = Auth::user();

            // Charge la relation des rôles pour l'utilisateur authentifié
            $teacher->load('roles');

            // Vérifie si l'utilisateur authentifié a le rôle 'enseignant'
            if (!$teacher->roles->contains('name', 'enseignant')) {
                 return response()->json(['message' => 'Accès refusé. Seuls les enseignants peuvent voir leur planning.'], 403);
            }

            // Obtient la date et l'heure actuelles pour les calculs de statistiques
            $now = Carbon::now();
            $startOfDay = $now->copy()->startOfDay();
            $endOfDay = $now->copy()->endOfDay();

            // --- Nouvelle logique pour déterminer la semaine actuelle ---
            $currentWeek = Week::where('is_current', true)->first();
            $startOfCurrentWeek = null;
            $endOfCurrentWeek = null;

            if ($currentWeek) {
                $startOfCurrentWeek = Carbon::parse($currentWeek->start_date);
                $endOfCurrentWeek = Carbon::parse($currentWeek->end_date);
            }
            // --- Fin de la nouvelle logique ---

            // Récupère toutes les sessions de cours pour cet enseignant, avec les relations nécessaires
            $allTeacherSessions = CourseSession::where('teacher_id', $teacher->id)
                ->with(['course', 'classroom', 'timeSlot', 'timetable.week', 'timetable.promotion'])
                ->get();

            // Mappage des jours de la semaine en français vers les index numériques (1 pour Lundi, 7 pour Dimanche)
            $frenchDayToIsoWeekday = [
                'lundi' => 1,
                'mardi' => 2,
                'mercredi' => 3,
                'jeudi' => 4,
                'vendredi' => 5,
                'samedi' => 6,
                'dimanche' => 7,
            ];

            // Prépare les sessions pour le calendrier (format compatible avec react-big-calendar)
            $calendarEvents = $allTeacherSessions->map(function ($session) use ($frenchDayToIsoWeekday) {
                // S'assure que les données essentielles sont chargées
                if (!$session->timeSlot || !$session->timetable || !$session->timetable->week) {
                    return null; // Ignore si des données vitales sont manquantes
                }

                $weekStartDate = Carbon::parse($session->timetable->week->start_date);
                // Accède au day_of_week via timeSlot et le convertit en minuscules pour le mappage
                $dayOfWeekFrench = strtolower($session->timeSlot->day_of_week);

                // Récupère l'index numérique du jour de la semaine
                $dayOfWeekIndex = $frenchDayToIsoWeekday[$dayOfWeekFrench] ?? null;

                if ($dayOfWeekIndex === null) {
                    Log::warning("Jour de la semaine inconnu trouvé: " . $session->timeSlot->day_of_week);
                    return null; // Ignore si le jour de la semaine n'est pas reconnu
                }

                // Calcule la date spécifique de la session dans sa semaine
                // Carbon::addDays est 0-indexé, donc Lundi (1) est 0 jour après le début de la semaine
                $sessionDate = $weekStartDate->copy()->addDays($dayOfWeekIndex - 1);

                // Combine la date de la session avec les heures de début et de fin du créneau horaire
                $startDateTime = Carbon::parse($sessionDate->toDateString() . ' ' . $session->timeSlot->start_time);
                $endDateTime = Carbon::parse($sessionDate->toDateString() . ' ' . $session->timeSlot->end_time);

                return [
                    'id' => $session->id,
                    'title' => $session->course->name . ' - ' . $session->type,
                    'start' => $startDateTime->toDateTimeString(),
                    'end' => $endDateTime->toDateTimeString(),
                    'allDay' => false, // Les sessions ont des heures spécifiques
                    'resource' => [ // Informations supplémentaires pour l'événement
                        'courseName' => $session->course->name,
                        'teacherName' => $session->teacher->name,
                        'classroomName' => $session->classroom->name,
                        'type' => $session->session_type,
                        'notes' => $session->notes,
                        'promotionName' => $session->timetable->promotion->name ?? 'N/A',
                        'weekId' => $session->timetable->week->week_id,
                    ],
                ];
            })->filter()->values(); // Supprime les éléments nuls et réindexe le tableau

            // Calcule les statistiques
            $totalSessionsOverall = $allTeacherSessions->count();

            // Sessions de la semaine actuelle (basé sur la semaine is_current)
            $currentWeekSessions = collect(); // Initialise une collection vide
            if ($startOfCurrentWeek && $endOfCurrentWeek) {
                $currentWeekSessions = $allTeacherSessions->filter(function ($session) use ($startOfCurrentWeek, $endOfCurrentWeek) {
                    if (!$session->timetable || !$session->timetable->week) return false;
                    $sessionWeekStart = Carbon::parse($session->timetable->week->start_date);
                    $sessionWeekEnd = Carbon::parse($session->timetable->week->end_date);
                    // Vérifie si la semaine de la session est la semaine actuelle
                    return $sessionWeekStart->equalTo($startOfCurrentWeek) && $sessionWeekEnd->equalTo($endOfCurrentWeek);
                });
            }


            // Sessions du jour actuel (toujours basé sur le jour réel)
            $todaySessions = $currentWeekSessions->filter(function ($session) use ($now, $frenchDayToIsoWeekday) {
                if (!$session->timeSlot || !$session->timetable || !$session->timetable->week) return false;
                $weekStartDate = Carbon::parse($session->timetable->week->start_date);
                $dayOfWeekFrench = strtolower($session->timeSlot->day_of_week);
                $dayOfWeekIndex = $frenchDayToIsoWeekday[$dayOfWeekFrench] ?? null;

                if ($dayOfWeekIndex === null) {
                    return false;
                }

                $sessionDate = $weekStartDate->copy()->addDays($dayOfWeekIndex - 1);
                return $sessionDate->isSameDay($now);
            });

            // Sessions complétées de la semaine (celles dont l'heure de fin est passée)
            $weeklyCompletedSessions = $currentWeekSessions->filter(function ($session) use ($now, $frenchDayToIsoWeekday) {
                if (!$session->timeSlot || !$session->timetable || !$session->timetable->week) return false;
                $weekStartDate = Carbon::parse($session->timetable->week->start_date);
                $dayOfWeekFrench = strtolower($session->timeSlot->day_of_week);
                $dayOfWeekIndex = $frenchDayToIsoWeekday[$dayOfWeekFrench] ?? null;

                if ($dayOfWeekIndex === null) {
                    return false;
                }

                $sessionDate = $weekStartDate->copy()->addDays($dayOfWeekIndex - 1);
                $endDateTime = Carbon::parse($sessionDate->toDateString() . ' ' . $session->timeSlot->end_time);
                return $endDateTime->lessThan($now);
            });

            $totalWeeklyScheduled = $currentWeekSessions->count();
            $weeklyCompletionPercentage = 0;
            if ($totalWeeklyScheduled > 0) {
                $weeklyCompletionPercentage = ($weeklyCompletedSessions->count() / $totalWeeklyScheduled) * 100;
            }

            return response()->json([
                'stats' => [
                    'totalSessionsOverall' => $totalSessionsOverall,
                    'currentWeekSessionsCount' => $currentWeekSessions->count(),
                    'todaySessionsCount' => $todaySessions->count(),
                    'weeklyCompletionPercentage' => round($weeklyCompletionPercentage, 2), // Arrondi à 2 décimales
                ],
                'events' => $calendarEvents,
                'message' => 'Planning de l\'enseignant récupéré avec succès.',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération du planning de l\'enseignant : ' . $e->getMessage());
            return response()->json(['message' => 'Une erreur est survenue lors de la récupération du planning.', 'error' => $e->getMessage()], 500);
        }
    }
}
