<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Promotion extends Model
{
    protected $fillable = [
        'name',
        'level',
        'students',
        'published'
    ];


    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function timetables()
    {
        return $this->hasMany(Timetable::class);
    }
}
