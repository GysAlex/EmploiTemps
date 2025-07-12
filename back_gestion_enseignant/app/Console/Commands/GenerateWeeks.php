<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Week; // N'oubliez pas d'importer le modèle Week
use Carbon\Carbon;    // Pour manipuler les dates plus facilement


class GenerateWeeks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'weeks:generate
                            {--year= : The academic year to generate weeks for (e.g., 2024). Defaults to current year.}
                            {--start-date= : The specific start date for the first week of the academic year (YYYY-MM-DD). Defaults to Sept 1st of the specified year.}
                            {--update-current : Update the "is_current" status for weeks (optional flag).}';




    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generates academic weeks for a given year and can update the current week status.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $year = $this->option('year') ?: Carbon::now()->year;
        $inputStartDate = $this->option('start-date');
        $updateCurrent = $this->option('update-current');

        if ($updateCurrent) {
            $this->updateCurrentWeekStatus();
        } else {
            $this->generateWeeks($year, $inputStartDate);
        }

        return Command::SUCCESS;
    }


   /**
     * Generates weeks for a specific academic year.
     *
     * @param int $year
     * @param string|null $inputStartDate
     */
    protected function generateWeeks(int $year, ?string $inputStartDate): void
    {
        $this->info("Starting week generation for academic year {$year}...");

        // Déterminer la date de début de l'année académique
        // Par défaut, le 1er Septembre de l'année spécifiée
        $startDate = $inputStartDate ?
            Carbon::parse($inputStartDate) :
            Carbon::create($year, 9, 1, 0, 0, 0); // 1er septembre

        // Si le 1er septembre tombe un week-end, ajuster au premier lundi suivant.
        if ($startDate->isWeekend()) {
            $startDate->next(Carbon::MONDAY);
        }

        // Assurez-vous de commencer un Lundi
        $startDate = $startDate->startOfWeek(Carbon::MONDAY);

        $endYear = $year + 1; // L'année académique se termine l'année suivante
        $endDateLimit = Carbon::create($endYear, 8, 31, 23, 59, 59); // Fin de l'année académique (31 août de l'année suivante)

        $weekCounter = 1;
        $currentDate = clone $startDate;

        // Effacer les semaines existantes pour cette année avant de les regénérer
        // ATTENTION : À n'utiliser que si vous voulez écraser toutes les semaines existantes pour l'année.
        // Si vous voulez éviter la duplication, vous pouvez ajouter une vérification d'existence.
        Week::where('year', $year)->delete();
        $this->warn("Existing weeks for year {$year} deleted (if any).");


        while ($currentDate->lessThanOrEqualTo($endDateLimit)) {
            $endOfWeek = (clone $currentDate)->endOfWeek(Carbon::SUNDAY);

            // Si la fin de la semaine dépasse la limite de l'année académique, ajuster
            if ($endOfWeek->greaterThan($endDateLimit)) {
                $endOfWeek = clone $endDateLimit;
            }

            Week::create([
                'week_id' => $weekCounter,
                'start_date' => $currentDate->toDateString(),
                'end_date' => $endOfWeek->toDateString(),
                'year' => $year,
                'is_current' => false, // Initialement toutes à false, mise à jour par une autre logique/appel
            ]);

            $this->info("Generated Week {$weekCounter}: {$currentDate->toDateString()} to {$endOfWeek->toDateString()}");

            $currentDate->addWeek(); // Passer à la semaine suivante
            $weekCounter++;
        }

        $this->info("Week generation completed for academic year {$year}. Total weeks: " . ($weekCounter - 1));
        $this->comment('Remember to run "php artisan weeks:generate --update-current" to set the current week.');
    }

    /**
     * Updates the 'is_current' status for the weeks.
     */
    protected function updateCurrentWeekStatus(): void
    {
        $this->info('Updating current week status...');

        // Mettre toutes les semaines à non-actuelles
        Week::query()->update(['is_current' => false]);

        // Trouver la semaine actuelle
        $today = Carbon::now();
        $currentWeek = Week::where('start_date', '<=', $today->toDateString())
                           ->where('end_date', '>=', $today->toDateString())
                           ->first();

        if ($currentWeek) {
            $currentWeek->update(['is_current' => true]);
            $this->info("Week {$currentWeek->week_id} ({$currentWeek->start_date} to {$currentWeek->end_date}) is now marked as current for year {$currentWeek->year}.");
        } else {
            $this->warn('No current week found. Ensure weeks are generated for the current period.');
        }

        $this->info('Current week status update completed.');
    }
}
