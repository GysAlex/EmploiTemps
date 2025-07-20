<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\Week;      // Importez le modèle Week
use App\Models\Timetable; // Importez le modèle Timetable
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon; // Pour la manipulation des dates si nécessaire, déjà utilisé dans TimetablePromotionController

class PromotionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request) // Ajoutez Request pour potentiellement récupérer la semaine
    {
        $query = Promotion::latest(); // Commencez par la requête de base

        // Récupérer la semaine actuelle
        $currentWeek = Week::where('is_current', true)->first();

        // Si aucune semaine actuelle n'est trouvée, cela sera géré en définissant published à false
        // pour toutes les promotions, car il n'y a pas de référence de semaine pour un EDT publié.

        $promotions = $query->with('students')->get(); // Récupérez toutes les promotions

        // Transformez la collection pour ajouter le statut 'published'
        $promotions->transform(function ($promotion) use ($currentWeek) {
            $isPublished = false;
            if ($currentWeek) {
                // Vérifier si un emploi du temps existe pour cette promotion et la semaine actuelle
                // ET si cet emploi du temps a des sessions de cours associées.
                $timetable = Timetable::where('promotion_id', $promotion->id)
                                      ->where('week_id', $currentWeek->id)
                                      ->first();

                if ($timetable && $timetable->courseSessions()->count() > 0) {
                    $isPublished = true;
                }
            }
            $promotion->published = $isPublished;
            return $promotion;
        });


        return response()->json([
            'data' => $promotions,
            'message' => 'Promotions récupérées avec succès.'
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Messages de validation personnalisés en français
            $messages = [
                'name.required' => 'Le nom de la promotion est obligatoire.',
                'name.string' => 'Le nom de la promotion doit être une chaîne de caractères.',
                'name.max' => 'Le nom de la promotion ne doit pas dépasser :max caractères.',
                'name.unique' => 'Une promotion avec ce nom existe déjà. Veuillez en choisir un autre.',
                'level.required' => 'Le niveau de la promotion est obligatoire.',
                'level.string' => 'Le niveau de la promotion doit être une chaîne de caractères.',
                'level.in' => 'Le niveau de la promotion sélectionné est invalide.',
                // 'students.required' est retiré
                // 'students.integer' est retiré
                // 'students.min' est retiré
            ];

            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255', 'unique:promotions'],
                'level' => ['required', 'string', Rule::in(['Niveau 1', 'Niveau 2', 'Niveau 3'])], // Correction des niveaux si nécessaire
                // 'students' est retiré des règles de validation
            ], $messages);

            // Le champ 'published' ne doit pas être défini ici, car il est dérivé.
            // Si votre modèle a un attribut 'published' par défaut à false, c'est bien.
            $promotion = Promotion::create($validatedData);

            // NOUVEAU : Ajouter le nombre d'étudiants à la réponse après la création
            $promotion->students_count = 0; // Nouvelle promotion, donc 0 étudiants initialement

            return response()->json([
                'data' => $promotion,
                'message' => 'Promotion créée avec succès.'
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreurs de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de la promotion.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Promotion $promotion)
    {
        if (!$promotion) {
            return response()->json(['message' => 'Promotion non trouvée.'], 404);
        }

        // Récupérer la semaine actuelle
        $currentWeek = Week::where('is_current', true)->first();

        $isPublished = false;
        if ($currentWeek) {
            // Vérifier si un emploi du temps existe pour cette promotion et la semaine actuelle
            // ET si cet emploi du temps a des sessions de cours associées.
            $timetable = Timetable::where('promotion_id', $promotion->id)
                                  ->where('week_id', $currentWeek->id)
                                  ->first();

            if ($timetable && $timetable->courseSessions()->count() > 0) {
                $isPublished = true;
            }
        }
        $promotion->published = $isPublished; // Définir dynamiquement la propriété 'published'
        // NOUVEAU : Calculer le nombre d'étudiants via la relation
        $promotion->students_count = $promotion->students()->count();

        return response()->json([
            'data' => $promotion,
            'message' => 'Promotion récupérée avec succès.'
        ], 200);
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $promotion = Promotion::find($id);

            if (!$promotion) {
                return response()->json(['message' => 'Promotion non trouvée.'], 404);
            }

            // Messages de validation personnalisés en français pour la mise à jour
            $messages = [
                'name.required' => 'Le nom de la promotion est obligatoire.',
                'name.string' => 'Le nom de la promotion doit être une chaîne de caractères.',
                'name.max' => 'Le nom de la promotion ne doit pas dépasser :max caractères.',
                'name.unique' => 'Une autre promotion avec ce nom existe déjà. Veuillez en choisir un autre.',
                'level.required' => 'Le niveau de la promotion est obligatoire.',
                'level.string' => 'Le niveau de la promotion doit être une chaîne de caractères.',
                'level.in' => 'Le niveau de la promotion sélectionné est invalide.',
                // 'students.required' est retiré
                // 'students.integer' est retiré
                // 'students.min' est retiré
            ];

            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255', Rule::unique('promotions')->ignore($promotion->id)],
                'level' => ['required', 'string', Rule::in(['Niveau 1', 'Niveau 2', 'Niveau 3'])], // Correction des niveaux si nécessaire
                // 'students' est retiré des règles de validation
            ], $messages);

            $promotion->update($validatedData);

            // NOUVEAU : Ajouter le nombre d'étudiants à la réponse après la mise à jour
            $promotion->students_count = $promotion->students()->count();

            return response()->json([
                'data' => $promotion,
                'message' => 'Promotion mise à jour avec succès.'
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreurs de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la promotion.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json(['message' => 'Promotion non trouvée.'], 404);
        }

        try {
            $promotion->delete();
            return response()->json(['message' => 'Promotion supprimée avec succès.'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression de la promotion.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
