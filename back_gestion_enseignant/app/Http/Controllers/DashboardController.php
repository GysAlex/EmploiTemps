<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use App\Models\Timetable;
use App\Models\Classroom;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{

    public function index(Request $request)
    {
        try {
            // Nombre total d'étudiants
            $totalStudents = Student::count();

            // Nombre total d'enseignants (utilisateurs ayant le rôle 'enseignant' via la relation many-to-many)
            $totalTeachers = User::whereHas('roles', function ($query) {
                $query->where('name', 'enseignant');
            })->count();

            // Nombre total d'emplois du temps définis (basé sur les promotions ayant au moins un emploi du temps)
            $totalTimetables = Timetable::distinct('promotion_id')->count();

            // Nombre total d'administrateurs (utilisateurs ayant le rôle 'admin' ou 'super_admin' via la relation many-to-many)
            $totalAdmins = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin')
                      ->orWhere('name', 'super_admin');
            })->count();

            // Nombre total de salles de classe
            $totalClassrooms = Classroom::count();

            // Pour les salles "occupées" et "disponibles", nous les laissons fictives pour l'instant
            // car cela nécessiterait une logique plus complexe basée sur les sessions de cours actuelles.
            // Le client a demandé de garder certaines données fictives.
            $occupiedClassrooms = 28; // Donnée fictive
            $availableClassrooms = $totalClassrooms - $occupiedClassrooms; // Calcul basé sur le total et le fictif

            // Statistiques d'emploi du temps (actifs/publiés et planifiés)
            // Ces données nécessiteraient une logique métier spécifique pour être réelles.
            // Pour l'instant, nous les laissons fictives.
            $activeTimetables = 28; // Donnée fictive
            $plannedTimetables = 14; // Donnée fictive


            return response()->json([
                'stats' => [
                    'students' => $totalStudents,
                    'teachers' => $totalTeachers,
                    'timetables' => $totalTimetables,
                    'administrators' => $totalAdmins,
                ],
                'classrooms' => [
                    'total' => $totalClassrooms,
                    'occupied' => $occupiedClassrooms,
                    'available' => $availableClassrooms,
                ],
                'timetable_progress' => [
                    'active_published' => $activeTimetables,
                    'planned' => $plannedTimetables,
                    'total_for_progress' => 100, // Une base pour le pourcentage fictif
                ],
                // Les données d'absence restent fictives
                'absence_chart_data' => [
                    'justified' => 65,
                    'unjustified' => 35,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des données du tableau de bord : ' . $e->getMessage());
            return response()->json(['message' => 'Erreur interne du serveur lors du chargement des données du tableau de bord.'], 500);
        }
    }
}
