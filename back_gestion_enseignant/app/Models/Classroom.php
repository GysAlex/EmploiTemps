<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    protected $fillable = [
        'name',
        'capacity',
        'type',
        'available',
    ];

        /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'available' => 'boolean', // Cast 'available' en booléen
    ];

    /**
     * Define the valid types for classrooms.
     * This method helps centralize valid types for both model and validation.
     *
     * @return array
     */
    public static function getValidTypes(): array
    {
        return ['Amphithéâtre', 'Salle de Cours', 'Salle TP'];
    }


    public function courseSessions()
    {
        return $this->hasMany(CourseSession::class, 'room_id'); // Utilisez 'room_id' si c'est le nom de la FK dans course_sessions
    }
}
