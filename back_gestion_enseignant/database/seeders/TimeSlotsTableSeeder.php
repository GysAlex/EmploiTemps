<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TimeSlots;

class TimeSlotsTableSeeder extends Seeder
{

    public function run(): void
    {
        // ATTENTION : À utiliser avec prudence en production si des TimeSlots sont déjà en usage.
        TimeSlots::truncate();

        // Définir tous les jours de la semaine, y compris le week-end
        $daysOfWeek = [
            'Lundi',
            'Mardi',
            'Mercredi',
            'Jeudi',
            'Vendredi',
            'Samedi',
            'Dimanche',
        ];

        // Définir des créneaux horaires types, incluant des plages tardives
        $commonTimeSlots = [
            // Créneaux en semaine (journée classique)
            ['start_time' => '08:00:00', 'end_time' => '10:00:00'], // 2 heures
            ['start_time' => '10:15:00', 'end_time' => '12:15:00'], // 2 heures
            ['start_time' => '13:30:00', 'end_time' => '15:30:00'], // 2 heures
            ['start_time' => '15:45:00', 'end_time' => '17:45:00'], // 2 heures

            // Créneaux tardifs / Soirée
            ['start_time' => '18:00:00', 'end_time' => '19:30:00'], // 1.5 heures
            ['start_time' => '19:45:00', 'end_time' => '21:15:00'], // 1.5 heures
            ['start_time' => '20:00:00', 'end_time' => '22:00:00'], // 2 heures (très tardif)

            // Créneaux potentiellement utilisés le week-end ou pour des sessions spécifiques
            ['start_time' => '09:00:00', 'end_time' => '11:00:00'], // 2 heures
            ['start_time' => '11:15:00', 'end_time' => '13:15:00'], // 2 heures
            ['start_time' => '14:00:00', 'end_time' => '16:00:00'], // 2 heures
        ];

        // Création des TimeSlots pour chaque jour de la semaine
        foreach ($daysOfWeek as $day) {
            foreach ($commonTimeSlots as $slot) {
                // Calculer la durée en minutes
                $startTime = strtotime($slot['start_time']);
                $endTime = strtotime($slot['end_time']);
                $durationMinutes = round(abs($endTime - $startTime) / 60);

                // Utilisation du modèle Eloquent pour créer l'entrée
                TimeSlot::create([
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                    'day_of_week' => $day,
                    'duration_minutes' => $durationMinutes,
                ]);
            }
        }

        $this->command->info('TimeSlots seeded successfully with extended hours and weekends!');
    }
}
