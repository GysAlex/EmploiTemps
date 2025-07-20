<?php

namespace App\Listeners;

use App\Events\TimetablePublished;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;
use App\Mail\TimetablePublishedMarkdownMail; // Importez votre nouveau Mailable Markdown
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class SendTimetableEmailListener implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(TimetablePublished $event): void
    {
        $timetable = $event->timetable;

        try {
            // Charger les relations nécessaires pour la génération du PDF et l'envoi de l'e-mail
            $timetable->load(['promotion', 'week', 'courseSessions.course', 'courseSessions.teacher', 'courseSessions.classroom', 'courseSessions.timeSlot']);

            $promotion = $timetable->promotion;

            if (!$promotion) {
                Log::error('Listener: Promotion associée à l\'emploi du temps introuvable pour l\'envoi d\'e-mail. Timetable ID: ' . $timetable->id);
                return;
            }

            // Trouver le délégué de la promotion
            $delegate = $promotion->students()->where('is_delegate', true)->first();

            if ($delegate && $delegate->email) {
                // Générer le PDF
                $pdf = Pdf::loadView('pdfs.timetable', compact('timetable', 'promotion'));
                $pdfContent = $pdf->output(); // Obtenir le contenu binaire du PDF

                // Envoyer l'e-mail avec le nouveau Mailable Markdown
                Mail::to($delegate->email)->send(new TimetablePublishedMarkdownMail($promotion, $timetable, $pdfContent));
                Log::info("Listener: E-mail de l'emploi du temps (Markdown) envoyé au délégué {$delegate->email} pour la promotion {$promotion->name}.");

            } else {
                Log::warning("Listener: Aucun délégué trouvé ou adresse e-mail manquante pour la promotion {$promotion->name}. E-mail non envoyé. Timetable ID: " . $timetable->id);
            }

        } catch (\Exception $e) {
            Log::error('Listener: Erreur lors de l\'envoi de l\'e-mail de l\'emploi du temps (Markdown) : ' . $e->getMessage() . ' Timetable ID: ' . $timetable->id);
        }
    }
}
