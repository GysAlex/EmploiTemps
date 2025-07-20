<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\CourseSession; // Importez le modèle CourseSession
use App\Models\TimeSlot;      // Importez le modèle TimeSlot
use App\Models\Timetable;     // Importez le modèle Timetable
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon; // Pour manipuler les dates et heures

class ClassroomController extends Controller
{

    public function index()
    {
        try {
            $classrooms = Classroom::all();

            // Obtenez l'heure et le jour actuels
            $now = Carbon::now();
            $currentTime = $now->format('H:i:s'); // Format HH:MM:SS
            $currentDayOfWeek = $now->isoFormat('dddd'); // Nom du jour de la semaine en français (ex: "lundi")

            // Mappage des jours de la semaine français vers l'anglais (si vos time_slots utilisent l'anglais)
            // Assurez-vous que cela correspond à la casse et au format dans votre table time_slots
            $frenchToEnglishDays = [
                'lundi' => 'monday',
                'mardi' => 'tuesday',
                'mercredi' => 'wednesday',
                'jeudi' => 'thursday',
                'vendredi' => 'friday',
                'samedi' => 'saturday',
                'dimanche' => 'sunday',
            ];
            $dbDayOfWeek = $frenchToEnglishDays[strtolower($currentDayOfWeek)] ?? null;


            $classrooms->transform(function ($classroom) use ($currentTime, $dbDayOfWeek) {
                $isAvailable = true; // Par défaut, la salle est disponible

                if ($dbDayOfWeek) {
                    // Trouver tous les créneaux horaires qui sont actifs maintenant pour ce jour
                    $activeTimeSlots = TimeSlot::where('day_of_week', $dbDayOfWeek)
                                               ->where('start_time', '<=', $currentTime)
                                               ->where('end_time', '>', $currentTime)
                                               ->pluck('id')
                                               ->toArray();

                    if (!empty($activeTimeSlots)) {
                        // Vérifier si la salle est occupée par une session de cours à l'heure actuelle
                        $occupied = CourseSession::where('room_id', $classroom->id)
                                                 ->whereIn('time_slot_id', $activeTimeSlots)
                                                 // Optionnel: Vous pouvez ajouter une vérification de la semaine actuelle
                                                 // ->whereHas('timetable', function ($query) {
                                                 //     $query->where('week_id', Week::where('is_current', true)->first()->id ?? null);
                                                 // })
                                                 ->exists();
                        if ($occupied) {
                            $isAvailable = false;
                        }
                    }
                }
                $classroom->available = $isAvailable;
                return $classroom;
            });

            return response()->json($classrooms);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des salles de classe : ' . $e->getMessage());
            return response()->json(['message' => 'Erreur interne du serveur lors du chargement des salles de classe.'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $messages = [
                'name.required' => 'Le nom de la salle est obligatoire.',
                'name.string' => 'Le nom de la salle doit être une chaîne de caractères.',
                'name.max' => 'Le nom de la salle ne doit pas dépasser 255 caractères.',
                'name.unique' => 'Une salle avec ce nom existe déjà.',

                'capacity.required' => 'La capacité de la salle est obligatoire.',
                'capacity.integer' => 'La capacité doit être un nombre entier.',
                'capacity.min' => 'La capacité doit être d\'au moins 1.',

                'type.required' => 'Le type de salle est obligatoire.',
                'type.string' => 'Le type de salle doit être une chaîne de caractères.',
                'type.in' => 'Le type de salle sélectionné n\'est pas valide.',
            ];

            $validatedData = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:classrooms,name'
                ],
                'capacity' => [
                    'required',
                    'integer',
                    'min:1'
                ],
                'type' => [
                    'required',
                    'string',
                    Rule::in(Classroom::getValidTypes())
                ],
                // 'available' est retiré de la validation de store car il est calculé dynamiquement
            ], $messages);

            // Le champ 'available' est défini à false par défaut lors de la création
            // et sera calculé dynamiquement lors de la récupération.
            $validatedData['available'] = false; // Ou true, selon votre préférence initiale

            $classroom = Classroom::create($validatedData);

            return response()->json([
                'message' => 'Salle de classe créée avec succès !',
                'data' => $classroom
            ], 201);

        } catch (ValidationException $e) {
            Log::warning('Erreur de validation lors de la création d\'une salle de classe : ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Les données fournies ne sont pas valides.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la création de la salle de classe : ' . $e->getMessage());
            return response()->json(['message' => 'Erreur interne du serveur lors de la création de la salle de classe.'], 500);
        }
    }

    public function show(Classroom $classroom)
    {
        // Obtenez l'heure et le jour actuels
        $now = Carbon::now();
        $currentTime = $now->format('H:i:s');
        $currentDayOfWeek = $now->isoFormat('dddd');

        $frenchToEnglishDays = [
            'lundi' => 'monday',
            'mardi' => 'tuesday',
            'mercredi' => 'wednesday',
            'jeudi' => 'thursday',
            'vendredi' => 'friday',
            'samedi' => 'saturday',
            'dimanche' => 'sunday',
        ];
        $dbDayOfWeek = $frenchToEnglishDays[strtolower($currentDayOfWeek)] ?? null;

        $isAvailable = true;
        if ($dbDayOfWeek) {
            $activeTimeSlots = TimeSlot::where('day_of_week', $dbDayOfWeek)
                                       ->where('start_time', '<=', $currentTime)
                                       ->where('end_time', '>', $currentTime)
                                       ->pluck('id')
                                       ->toArray();

            if (!empty($activeTimeSlots)) {
                $occupied = CourseSession::where('room_id', $classroom->id)
                                         ->whereIn('time_slot_id', $activeTimeSlots)
                                         ->exists();
                if ($occupied) {
                    $isAvailable = false;
                }
            }
        }
        $classroom->available = $isAvailable;

        return response()->json(['data' => $classroom]);
    }

    public function update(Request $request, Classroom $classroom)
    {
        try {
            $messages = [
                'name.required' => 'Le nom de la salle est obligatoire.',
                'name.string' => 'Le nom de la salle doit être une chaîne de caractères.',
                'name.max' => 'Le nom de la salle ne doit pas dépasser 255 caractères.',
                'name.unique' => 'Une autre salle avec ce nom existe déjà.',

                'capacity.required' => 'La capacité de la salle est obligatoire.',
                'capacity.integer' => 'La capacité doit être un nombre entier.',
                'capacity.min' => 'La capacité doit être d\'au moins 1.',

                'type.required' => 'Le type de salle est obligatoire.',
                'type.string' => 'Le type de salle doit être une chaîne de caractères.',
                'type.in' => 'Le type de salle sélectionné n\'est pas valide.',
            ];

            $validatedData = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('classrooms', 'name')->ignore($classroom->id)
                ],
                'capacity' => [
                    'required',
                    'integer',
                    'min:1'
                ],
                'type' => [
                    'required',
                    'string',
                    Rule::in(Classroom::getValidTypes())
                ],
                // 'available' est retiré de la validation de update car il est calculé dynamiquement
            ], $messages);

            $classroom->update($validatedData);

            // Recalculer et ajouter le statut 'available' après la mise à jour
            // pour s'assurer que la réponse est cohérente.
            $now = Carbon::now();
            $currentTime = $now->format('H:i:s');
            $currentDayOfWeek = $now->isoFormat('dddd');

            $frenchToEnglishDays = [
                'lundi' => 'monday',
                'mardi' => 'tuesday',
                'mercredi' => 'wednesday',
                'jeudi' => 'thursday',
                'vendredi' => 'friday',
                'samedi' => 'saturday',
                'dimanche' => 'sunday',
            ];
            $dbDayOfWeek = $frenchToEnglishDays[strtolower($currentDayOfWeek)] ?? null;

            $isAvailable = true;
            if ($dbDayOfWeek) {
                $activeTimeSlots = TimeSlot::where('day_of_week', $dbDayOfWeek)
                                           ->where('start_time', '<=', $currentTime)
                                           ->where('end_time', '>', $currentTime)
                                           ->pluck('id')
                                           ->toArray();

                if (!empty($activeTimeSlots)) {
                    $occupied = CourseSession::where('room_id', $classroom->id)
                                             ->whereIn('time_slot_id', $activeTimeSlots)
                                             ->exists();
                    if ($occupied) {
                        $isAvailable = false;
                    }
                }
            }
            $classroom->available = $isAvailable;


            return response()->json([
                'message' => 'Salle de classe mise à jour avec succès !',
                'data' => $classroom
            ]);

        } catch (ValidationException $e) {
            Log::warning('Erreur de validation lors de la mise à jour de la salle de classe ' . $classroom->id . ' : ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Les données fournies ne sont pas valides.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de la salle de classe ' . $classroom->id . ' : ' . $e->getMessage());
            return response()->json(['message' => 'Erreur interne du serveur lors de la mise à jour de la salle de classe.'], 500);
        }
    }

    public function destroy(Classroom $classroom)
    {
        try {
            $classroom->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression de la salle de classe ' . $classroom->id . ' : ' . $e->getMessage());
            return response()->json(['message' => 'Erreur interne du serveur lors de la suppression de la salle de classe.'], 500);
        }
    }
}
