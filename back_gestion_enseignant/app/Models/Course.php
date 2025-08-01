<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'level',
        'user_id',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function courseSessions()
    {
        return $this->hasMany(CourseSession::class);
    }
}
