<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Week extends Model
{
    protected $fillable = [
        'week_id',
        'start_date',
        'end_date',
        'is_current',
        'year',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'start_date' => 'date', // Cast en objet Carbon/Date
        'end_date' => 'date',   // Cast en objet Carbon/Date
    ];

    public function timetables()
    {
        return $this->hasMany(Timetable::class);
    }
}
