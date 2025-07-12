<?php

namespace App\Http\Controllers;

use App\Models\Classroom; 
use Illuminate\Http\Request;
use Illuminate\Validation\Rule; 
use Illuminate\Validation\ValidationException; 
use Illuminate\Support\Facades\Log; 

class ClassroomController extends Controller
{

    public function index()
    {
        try {
            // Récupère toutes les salles de classe de la base de données
            $classrooms = Classroom::all();
            return response()->json(['data' => $classrooms]);
        } catch (\Exception $e) {
            // Enregistre l'erreur pour le débogage
            Log::error('Erreur lors de la récupération des salles de classe : ' . $e->getMessage());
            // Retourne une réponse d'erreur 500
            return response()->json(['message' => 'Erreur interne du serveur lors du chargement des salles de classe.'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Valide les données de la requête entrante
            $validatedData = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:classrooms,name' // Le nom doit être unique dans la table 'classrooms'
                ],
                'capacity' => [
                    'required',
                    'integer',
                    'min:1' // La capacité doit être un entier et au moins 1
                ],
                'type' => [
                    'required',
                    'string',
                    Rule::in(Classroom::getValidTypes()) // Le type doit être l'un des types valides définis dans le modèle
                ],
                'available' => [
                    'boolean',
                    'sometimes' // 'available' est optionnel, mais si présent, doit être un booléen
                ],
            ], [
                // Messages de validation personnalisés en français
                'name.required' => 'Le nom de la salle est obligatoire.',
                'name.string' => 'Le nom de la salle doit être une chaîne de caractères.',
                'name.max' => 'Le nom de la salle ne doit pas dépasser 255 caractères.',
                'name.unique' => 'Une salle avec ce nom existe déjà.',

                'capacity.required' => 'La capacité de la salle est obligatoire.',
                'capacity.integer' => 'La capacité doit être un nombre entier.',
                'capacity.min' => 'La capacité doit être d\'au moins 1.',

                'type.required' => 'Le type de salle est obligatoire.',
                'type.string' => 'Le type de salle doit être une chaîne de caractères.',
                'type.in' => 'Le type de salle sélectionné n\'est pas valide.',

                'available.boolean' => 'Le statut de disponibilité doit être vrai ou faux.',
            ]);

            // Crée une nouvelle salle de classe avec les données validées
            $classroom = Classroom::create($validatedData);

            // Retourne une réponse JSON avec la salle de classe créée et un code 201 (Created)
            return response()->json([
                'message' => 'Salle de classe créée avec succès !',
                'data' => $classroom
            ], 201);

        } catch (ValidationException $e) {
            // Capture spécifiquement les exceptions de validation
            Log::warning('Erreur de validation lors de la création d\'une salle de classe : ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Les données fournies ne sont pas valides.',
                'errors' => $e->errors() // Retourne les erreurs de validation détaillées
            ], 422); // 422 Unprocessable Entity
        } catch (\Exception $e) {
            // Capture toute autre erreur inattendue
            Log::error('Erreur lors de la création de la salle de classe : ' . $e->getMessage());
            return response()->json(['message' => 'Erreur interne du serveur lors de la création de la salle de classe.'], 500);
        }
    }

    public function show(Classroom $classroom) // Utilise le Route Model Binding
    {

        return response()->json(['data' => $classroom]);
    }

    public function update(Request $request, Classroom $classroom) // Utilise le Route Model Binding
    {
        try {
            // Valide les données de la requête entrante
            $validatedData = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    // La règle 'unique' ignore l'ID de la salle de classe actuelle pour la mise à jour
                    Rule::unique('classrooms', 'name')->ignore($classroom->id)
                ],
                'capacity' => [
                    'required',
                    'integer',
                    'min:1'
                ],
                'type' => [
                    'required',
                    'string',
                    Rule::in(Classroom::getValidTypes())
                ],
                'available' => [
                    'boolean',
                    'sometimes'
                ],
            ], [
                // Messages de validation personnalisés en français pour la mise à jour
                'name.required' => 'Le nom de la salle est obligatoire.',
                'name.string' => 'Le nom de la salle doit être une chaîne de caractères.',
                'name.max' => 'Le nom de la salle ne doit pas dépasser 255 caractères.',
                'name.unique' => 'Une autre salle avec ce nom existe déjà.',

                'capacity.required' => 'La capacité de la salle est obligatoire.',
                'capacity.integer' => 'La capacité doit être un nombre entier.',
                'capacity.min' => 'La capacité doit être d\'au moins 1.',

                'type.required' => 'Le type de salle est obligatoire.',
                'type.string' => 'Le type de salle doit être une chaîne de caractères.',
                'type.in' => 'Le type de salle sélectionné n\'est pas valide.',

                'available.boolean' => 'Le statut de disponibilité doit être vrai ou faux.',
            ]);

            // Met à jour la salle de classe avec les données validées
            $classroom->update($validatedData);

            // Retourne une réponse JSON avec la salle de classe mise à jour
            return response()->json([
                'message' => 'Salle de classe mise à jour avec succès !',
                'data' => $classroom
            ]);

        } catch (ValidationException $e) {
            // Capture spécifiquement les exceptions de validation
            Log::warning('Erreur de validation lors de la mise à jour de la salle de classe ' . $classroom->id . ' : ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Les données fournies ne sont pas valides.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Capture toute autre erreur inattendue
            Log::error('Erreur lors de la mise à jour de la salle de classe ' . $classroom->id . ' : ' . $e->getMessage());
            return response()->json(['message' => 'Erreur interne du serveur lors de la mise à jour de la salle de classe.'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * Supprimer une salle de classe.
     * DELETE /api/classrooms/{id}
     */
    public function destroy(Classroom $classroom) // Utilise le Route Model Binding
    {
        try {
            // Supprime la salle de classe
            $classroom->delete();

            // Retourne une réponse 204 No Content pour une suppression réussie
            return response()->json(null, 204);

        } catch (\Exception $e) {
            // Capture toute erreur lors de la suppression
            Log::error('Erreur lors de la suppression de la salle de classe ' . $classroom->id . ' : ' . $e->getMessage());
            return response()->json(['message' => 'Erreur interne du serveur lors de la suppression de la salle de classe.'], 500);
        }
    }
}