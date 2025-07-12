<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\Week;
use App\Models\Timetable; // Assurez-vous d'importer le modèle Timetable
use Illuminate\Http\Request;
use Carbon\Carbon;

class TimetablePromotionController extends Controller
{
   /**
     * Display a listing of the promotions with their timetable status for a given week.
     * Level filtering is expected to be handled on the frontend.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // --- 1. Déterminer la semaine à analyser ---
        $weekId = $request->query('week_id');
        $selectedWeek = null;

        if ($weekId) {
            $selectedWeek = Week::find($weekId);
        } else {
            // Si aucune semaine n'est spécifiée, utilisez la semaine actuelle
            $selectedWeek = Week::where('is_current', true)->first();
        }

        if (!$selectedWeek) {
            return response()->json([
                'promotions' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => 0,
                ],
                'current_week_info' => null, // Ou une info de la semaine par défaut si vous en avez une
                'stats' => [
                    'totalEmplois' => 0,
                    'emploisDefinis' => 0,
                    'promotionsSansEDT' => Promotion::count(), // Toutes les promotions sont sans EDT si pas de semaine
                ],
                'message' => 'Aucune semaine spécifiée ou semaine actuelle trouvée pour récupérer les emplois du temps.'
            ], 200);
        }

        $query = Promotion::query();

        // --- RETIREMENT DU FILTRAGE PAR NIVEAU ICI (à faire côté frontend) ---
        // La ligne suivante est commentée/supprimée car le filtrage par niveau sera géré par le frontend
        // $level = $request->query('level');
        // if ($level && $level !== 'Tous les niveaux') {
        //     $query->where('level', $level);
        // }

        // --- 2. Recherche par Nom de Promotion (reste côté backend) ---
        $searchTerm = $request->query('search');
        if ($searchTerm) {
            $query->where('name', 'like', '%' . $searchTerm . '%');
        }

        // --- 3. Pagination ---
        $perPage = $request->query('per_page', 10);
        $promotions = $query->paginate($perPage);

        // --- 4. Ajout du statut de l'emploi du temps pour chaque promotion ---
        $promotions->getCollection()->transform(function ($promotion) use ($selectedWeek) {
            // Trouver l'emploi du temps pour cette promotion et la semaine sélectionnée
            $timetable = $promotion->timetables()
                                    ->where('week_id', $selectedWeek->id)
                                    ->first();

            $status = 'En attente';
            $timetableId = null;

            if ($timetable) {
                $timetableId = $timetable->id;
                $sessionCount = $timetable->courseSessions()->count();
                if ($sessionCount > 0) {
                    $status = 'Publié';
                }
            }

            $promotion->timetable_status = $status;
            $promotion->timetable_id = $timetableId;
            $promotion->week_name = 'Semaine ' . $selectedWeek->week_id;
            $promotion->week_start_date = $selectedWeek->start_date;
            $promotion->week_end_date = $selectedWeek->end_date;

            return $promotion;
        });

        // --- 5. Informations supplémentaires pour les cartes de statistiques ---
        $currentWeekInfo = null;
        $actualCurrentWeek = Week::where('is_current', true)->first();
        if ($actualCurrentWeek) {
            $currentWeekInfo = [
                'week_id' => $actualCurrentWeek->week_id,
                'start_date' => $actualCurrentWeek->start_date,
                'end_date' => $actualCurrentWeek->end_date,
                'year' => $actualCurrentWeek->year,
                'name' => 'Semaine ' . $actualCurrentWeek->week_id,
                'full_date_range' => Carbon::parse($actualCurrentWeek->start_date)->isoFormat('Do MMMM YYYY') . ' au ' . Carbon::parse($actualCurrentWeek->end_date)->isoFormat('Do MMMM YYYY')
            ];
        }

        $totalTimetablesDefinedForSelectedWeek = Timetable::where('week_id', $selectedWeek->id)
                                                    ->whereHas('courseSessions')
                                                    ->count();
        $promotionsWithTimetablesForSelectedWeek = Timetable::where('week_id', $selectedWeek->id)->count();
        $totalPromotions = Promotion::count();
        $promotionsSansEDT = $totalPromotions - $promotionsWithTimetablesForSelectedWeek;

        // Note: 'totalEmplois' du mock (42) semble être un total général, pas par semaine.
        // Ici, je le calcule comme le total de tous les timetables créés, peu importe la semaine.
        $totalEmplois = Timetable::count();
        $emploisDefinisPercentage = $totalPromotions > 0 ? round(($totalTimetablesDefinedForSelectedWeek / $totalPromotions) * 100) : 0;


        return response()->json([
            'promotions' => $promotions,
            'current_week_info' => $currentWeekInfo,
            'stats' => [
                'totalEmplois' => $totalEmplois,
                'emploisDefinis' => $emploisDefinisPercentage,
                'promotionsSansEDT' => $promotionsSansEDT,
            ]
        ]);
    }
}
