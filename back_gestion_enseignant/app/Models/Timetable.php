<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Timetable extends Model
{

    protected $fillable = [
        'week_id',
        'promotion_id',
    ];

    /**
     * Un emploi du temps appartient à une semaine spécifique.
     */
    public function week()
    {
        return $this->belongsTo(Week::class);
    }

    /**
     * Un emploi du temps appartient à une promotion spécifique.
     */
    public function promotion()
    {
        return $this->belongsTo(Promotion::class); // Assurez-vous que le modèle Promotion existe
    }

    /**
     * Un emploi du temps contient plusieurs sessions de cours.
     */
    public function courseSessions()
    {
        return $this->hasMany(CourseSession::class);
    }
}
