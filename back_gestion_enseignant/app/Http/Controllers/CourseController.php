<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{

    public function index()
    {
        $courses = Course::with('user')->get();

        return response()->json([
            'message' => 'Liste des cours récupérée avec succès.',
            'data' => $courses
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'level' => ['required', 'string', Rule::in(['Niveau 1', 'Niveau 2', 'Niveau 3'])],
            'user_id' => [ 
                'nullable',
                'exists:users,id'],
        ], [
            'name.required' => 'Le nom du cours est obligatoire.',
            'level.required' => 'Le niveau du cours est obligatoire.',
            'level.in' => 'Le niveau du cours sélectionné est invalide.',
            'user_id.exists' => 'L\'utilisateur sélectionné est invalide.',
            'user_id.in' => 'L\'utilisateur sélectionné doit être un enseignant.', // Message plus spécifique
        ]);

        $course = Course::create($validatedData);

        // Recharge la relation 'assignedTeacher' pour la réponse
        $course->load('user');

        return response()->json([
            'message' => 'Cours créé avec succès.',
            'data' => $course
        ], 201); // 201 Created
    }


    public function show(Course $course)
    {
        // Charge la relation 'assignedTeacher' avant de retourner le cours
        $course->load('user');

        return response()->json([
            'message' => 'Cours récupéré avec succès.',
            'data' => $course
        ]);
    }


    public function update(Request $request, Course $course)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'level' => ['required', 'string', Rule::in(['Niveau 1', 'Niveau 2', 'Niveau 3'])],
            'user_id' => [ 
                'nullable',
                'exists:users,id'
            ],
        ], [
            'name.required' => 'Le nom du cours est obligatoire.',
            'level.required' => 'Le niveau du cours est obligatoire.',
            'level.in' => 'Le niveau du cours sélectionné est invalide.',
            'user_id.exists' => 'L\'utilisateur sélectionné est invalide.',
            'user_id.in' => 'L\'utilisateur sélectionné doit être un enseignant.',
        ]);

        $course->update($validatedData);

        // Recharge la relation 'assignedTeacher' pour la réponse
        $course->load('user');

        return response()->json([
            'message' => 'Cours mis à jour avec succès.',
            'data' => $course
        ]);
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return response()->json([
            'message' => 'Cours supprimé avec succès.'
        ], 200);
    }
}
