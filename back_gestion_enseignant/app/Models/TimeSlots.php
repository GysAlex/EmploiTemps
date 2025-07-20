<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeSlots extends Model
{
    use HasFactory;

    protected $fillable = [
        'start_time',
        'end_time',
        'day_of_week',
        'duration_minutes',
    ];

    // Note: Laravel gère 'time' comme 'string' par défaut.
    // Vous pouvez le caster en 'datetime' si vous souhaitez le manipuler comme un objet Carbon/Date.
    // Cependant, pour 'time' pur sans date, 'string' est souvent suffisant.
    protected $casts = [
        'start_time' => 'string', // 'H:i:s'
        'end_time' => 'string',   // 'H:i:s'
    ];


    /**
     * Un créneau horaire peut être associé à plusieurs sessions de cours.
     */
    public function courseSessions()
    {
        return $this->hasMany(CourseSession::class);
    }
}
