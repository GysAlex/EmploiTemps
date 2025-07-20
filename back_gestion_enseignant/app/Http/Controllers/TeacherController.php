<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;

class TeacherController extends Controller
{
    public function index()
    {
        $teacher_role = Role::where('name', 'enseignant')->first();
        $teachers = User::whereAttachedTo($teacher_role)->with('courses')->get();

        return response()->json($teachers);
    }
}
