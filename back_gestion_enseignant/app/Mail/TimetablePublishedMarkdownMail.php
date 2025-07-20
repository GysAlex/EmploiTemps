<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;
use Carbon\Carbon;
use App\Models\Promotion;
use App\Models\Timetable;

class TimetablePublishedMarkdownMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(public Promotion $promotion, public Timetable $timetable, public string $pdfContent)
    {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME', 'Time Sync')),
            subject: 'Emploi du temps hebdomadaire de la promotion ' . $this->promotion->name . ' - Semaine ' . $this->timetable->week->week_id,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.timetables.published',
            with: [
                'promotionName' => $this->promotion->name,
                'delegateName' => $this->$promotion->students()->where('is_delegate', true)->first()->full_name,
                'weekId' => $this->timetable->week->week_id,
                'startDate' => Carbon::parse($this->timetable->week->start_date)->format('d/m/Y'),
                'endDate' => Carbon::parse($this->timetable->week->end_date)->format('d/m/Y'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        // Nom du fichier PDF
        $fileName = 'emploi_du_temps_' . $this->promotion->name . '_semaine_' . $this->timetable->week->week_id . '.pdf';

        return [
            Attachment::fromData(fn () => $this->pdfContent, $fileName)
                ->withMime('application/pdf'),
        ];
    }
}
