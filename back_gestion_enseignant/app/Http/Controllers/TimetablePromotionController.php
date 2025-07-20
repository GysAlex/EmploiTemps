<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\Week;
use App\Models\Timetable;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail; // Import the Mail facade
use App\Mail\TimetablePublishedMail; // Import your Mailable class
use App\Models\Student; // Import the Student model to find the delegate
use Illuminate\Support\Facades\Log; // For logs

class TimetablePromotionController extends Controller
{

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

    public function checkOrCreate(Request $request)
    {
        try {
            // 1. Valider les données entrantes
            $validatedData = $request->validate([
                'promotion_id' => ['required', 'integer', 'exists:promotions,id'],
                'week_id' => ['required', 'integer', 'exists:weeks,id'],
            ],
            [
                'promotion_id.required' => 'Le champ promotion_id est requis.',
                'week_id.required' => 'Le champ week_id est requis.',
                'promotion_id.exists' => 'La promotion sélectionnée n\'existe pas.',
                'week_id.exists' => 'La semaine sélectionnée n\'existe pas.',
            ]
        );

            $promotionId = $validatedData['promotion_id'];
            $weekId = $validatedData['week_id'];

            // 2. Tenter de trouver un emploi du temps existant
            $timetable = Timetable::where('promotion_id', $promotionId)
                                  ->where('week_id', $weekId)
                                  ->first();

            // 3. Si l'emploi du temps n'existe pas, le créer
            if (!$timetable) {
                $timetable = Timetable::create([
                    'promotion_id' => $promotionId,
                    'week_id' => $weekId,
                    // Ajoutez d'autres champs par défaut si nécessaire
                ]);
                $message = 'Emploi du temps créé avec succès.';
                $statusCode = 201; // Created
            } else {
                $message = 'Emploi du temps existant récupéré.';
                $statusCode = 200; // OK
            }

            // 4. Retourner l'emploi du temps (existant ou nouveau)
            return response()->json([
                'message' => $message,
                'timetable' => $timetable,
            ], $statusCode);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur est survenue lors de la vérification/création de l\'emploi du temps.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


        public function publish(Timetable $timetable)
    {
        try {
            // Load necessary relationships for PDF generation and email sending
            $timetable->load(['promotion', 'week', 'courseSessions.course', 'courseSessions.teacher', 'courseSessions.classroom', 'courseSessions.timeSlot']);

            $promotion = $timetable->promotion;

            if (!$promotion) {
                return response()->json(['message' => 'Promotion associated with the timetable not found.'], 404);
            }

            // Find the promotion delegate
            $delegate = $promotion->students()->where('delegate', true)->first();

            if ($delegate && $delegate->email) {
                // Generate the PDF
                // Make sure the 'pdfs.timetable' view exists and is well-formatted.
                $pdf = \PDF::loadView('pdfs.timetable', compact('timetable', 'promotion'));
                $pdfContent = $pdf->output(); // Get the binary content of the PDF

                // Send the email with the PDF as an attachment
                // It is recommended to queue mail deliveries for better performance
                Mail::to($delegate->email)->send(new TimetablePublishedMail($promotion, $timetable, $pdfContent));
                Log::info("Timetable email sent to delegate {$delegate->email} for promotion {$promotion->name}.");

                return response()->json([
                    'message' => 'Timetable published and email sent to delegate successfully.',
                ], 200);

            } else {
                Log::warning("No delegate found or missing email address for promotion {$promotion->name}. Email not sent.");
                return response()->json([
                    'message' => 'Timetable published, but no email sent (delegate not found or missing email).',
                ], 200); // Status 200 because publication succeeded, only mail sending failed.
            }

        } catch (\Exception $e) {
            Log::error('Error publishing timetable and sending email: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while publishing the timetable.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function downloadPdf(Timetable $timetable)
    {
        try {
            // Load necessary relationships for the PDF view
            $timetable->load(['courseSessions.course', 'courseSessions.teacher', 'courseSessions.classroom', 'courseSessions.timeSlot', 'week', 'promotion']);
            $promotion = $timetable->promotion; // Get the associated promotion

            // Check if promotion and week are loaded
            if (!$promotion || !$timetable->week) {
                return response()->json(['message' => 'Incomplete timetable data for PDF generation.'], 404);
            }

            // Generate the PDF from the Blade view
            // Make sure the 'pdfs.timetable' view exists and is correctly formatted.
            $pdf = \PDF::loadView('pdfs.timetable', compact('timetable', 'promotion'));

            // PDF file name
            $fileName = 'timetable_' . $promotion->slug . '_week_' . $timetable->week->week_id . '.pdf';

            // Return the PDF for download
            return $pdf->download($fileName);

        } catch (\Exception $e) {
            \Log::error('Error generating timetable PDF: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while generating the timetable PDF.', 'error' => $e->getMessage()], 500);
        }
    }


    public function previewPdfHtml(Timetable $timetable)
    {
        // Charger les relations nécessaires pour le template Blade
        $timetable->load(['promotion', 'week', 'courseSessions.course', 'courseSessions.teacher', 'courseSessions.classroom', 'courseSessions.timeSlot']);

        // Extraire la promotion pour la passer directement à la vue
        $promotion = $timetable->promotion;

        // Retourner la vue Blade directement, en passant à la fois l'emploi du temps et la promotion
        return view('pdfs.timetable', compact('timetable', 'promotion'));
    }
}
