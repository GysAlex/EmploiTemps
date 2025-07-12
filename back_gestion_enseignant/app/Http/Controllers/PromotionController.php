<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PromotionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => Promotion::latest()->get(),
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
                'students.required' => 'Le nombre d\'étudiants est obligatoire.',
                'students.integer' => 'Le nombre d\'étudiants doit être un nombre entier.',
                'students.min' => 'Le nombre d\'étudiants doit être au moins :min.',
                'published.boolean' => 'Le statut de publication doit être vrai ou faux.'
            ];

            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255', 'unique:promotions'],
                'level' => ['required', 'string', Rule::in(['Niveau 1', 'Niveau 2', 'Niveau 3'])],
                'students' => ['required', 'integer', 'min:1'],
                'published' => ['boolean'],
            ], $messages); // <-- Ajout des messages ici

            $promotion = Promotion::create($validatedData);

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

    public function show(string $id)
    {
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json(['message' => 'Promotion non trouvée.'], 404);
        }

        return response()->json([
            'data' => $promotion,
            'message' => 'Promotion récupérée avec succès.'
        ], 200);
    }


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
                'name.unique' => 'Une autre promotion avec ce nom existe déjà. Veuillez en choisir un autre.', // Message légèrement différent
                'level.required' => 'Le niveau de la promotion est obligatoire.',
                'level.string' => 'Le niveau de la promotion doit être une chaîne de caractères.',
                'level.in' => 'Le niveau de la promotion sélectionné est invalide.',
                'students.required' => 'Le nombre d\'étudiants est obligatoire.',
                'students.integer' => 'Le nombre d\'étudiants doit être un nombre entier.',
                'students.min' => 'Le nombre d\'étudiants doit être au moins :min.',
                'published.boolean' => 'Le statut de publication doit être vrai ou faux.'
            ];

            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255', Rule::unique('promotions')->ignore($promotion->id)],
                'level' => ['required', 'string', Rule::in(['Niveau 1', 'Niveau 2', 'Niveau 3'])],
                'students' => ['required', 'integer', 'min:1'],
                'published' => ['boolean'],
            ], $messages); // <-- Ajout des messages ici

            $promotion->update($validatedData);

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