<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'full_name',
        'email',
        'matricule',
        'is_delegate',
        'promotion_id', // N'oubliez pas d'ajouter promotion_id ici
    ];

    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }
}
