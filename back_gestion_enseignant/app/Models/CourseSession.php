<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseSession extends Model
{

    protected $fillable = [
        'timetable_id',
        'course_id',
        'teacher_id',
        'room_id', // Nom de la FK vers classrooms
        'time_slot_id',
        'duration_minutes',
        'session_type',
        'notes',
    ];

    /**
     * Une session de cours appartient à un emploi du temps spécifique.
     */
    public function timetable()
    {
        return $this->belongsTo(Timetable::class);
    }

    /**
     * Une session de cours est associée à un cours (matière).
     */
    public function course()
    {
        return $this->belongsTo(Course::class); // Assurez-vous que le modèle Course existe
    }

    /**
     * Une session de cours est enseignée par un utilisateur (enseignant).
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id'); // 'User::class' car l'enseignant est un utilisateur
    }

    /**
     * Une session de cours a lieu dans une salle de classe.
     */
    public function classroom()
    {
        return $this->belongsTo(Classroom::class, 'room_id'); // Assurez-vous du nom de la FK si ce n'est pas 'classroom_id'
    }

    /**
     * Une session de cours est planifiée sur un créneau horaire spécifique.
     */
    public function timeSlot()
    {
        return $this->belongsTo(TimeSlots::class);
    }
}
