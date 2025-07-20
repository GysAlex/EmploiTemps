<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role; // Importez le modèle Role
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class UserManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     * Récupérer et afficher une liste de tous les utilisateurs avec leurs rôles.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Charge la relation 'roles' pour chaque utilisateur
        $users = User::with('roles')->get();

        return response()->json([
            'message' => 'Users retrieved successfully',
            // Les rôles seront inclus comme un tableau d'objets (Role) pour chaque utilisateur
            'data' => $users,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     * Créer un nouvel utilisateur et lui assigner des rôles.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8'], // 'confirmed' est important ici
                'phone' => ['nullable', 'string', 'max:20'],
                // 'roles' est un tableau de NOMS de rôles (ex: ['admin', 'enseignant'])
                // Rule::exists('roles', 'name') vérifie que chaque nom de rôle existe dans la table 'roles'
                'roles' => ['required', 'array', Rule::exists('roles', 'name')],
            ], [
                'name.required' => 'Le nom est obligatoire.',
                'name.string' => 'Le nom doit être une chaîne de caractères.',
                'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',

                'email.required' => 'L\'adresse e-mail est obligatoire.',
                'email.string' => 'L\'adresse e-mail doit être une chaîne de caractères.',
                'email.email' => 'L\'adresse e-mail doit être une adresse valide.',
                'email.max' => 'L\'adresse e-mail ne doit pas dépasser 255 caractères.',
                'email.unique' => 'Cet e-mail est déjà utilisé.',

                'password.required' => 'Le mot de passe est obligatoire.',
                'password.string' => 'Le mot de passe doit être une chaîne de caractères.',
                'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
                'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',

                'phone.string' => 'Le numéro de téléphone doit être une chaîne de caractères.',
                'phone.max' => 'Le numéro de téléphone ne doit pas dépasser 20 caractères.',

                'roles.required' => 'Les rôles sont obligatoires.',
                'roles.array' => 'Les rôles doivent être un tableau.',
                'roles.exists' => 'Un ou plusieurs rôles spécifiés n\'existent pas.', // Message pour Rule::exists
            ]);

            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'phone' => $validatedData['phone'] ?? null,
                // Pas de 'roles' ici, car c'est une relation Many-to-Many
            ]);

            // Récupérer les modèles de rôles basés sur les noms reçus
            $roleModels = Role::whereIn('name', $validatedData['roles'])->get();
            // Attacher les rôles à l'utilisateur via la relation many-to-many
            $user->roles()->attach($roleModels->pluck('id'));

            DB::commit();

            // Charger les rôles pour la réponse JSON
            return response()->json([
                'message' => 'Utilisateur créé avec succès !',
                'data' => $user->load('roles'), // Recharger l'utilisateur avec ses rôles attachés
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error("Validation error during user creation: " . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error creating user: " . $e->getMessage());
            return response()->json([
                'message' => 'Échec de la création de l\'utilisateur. Veuillez réessayer.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * Afficher les détails d'un utilisateur spécifique avec ses rôles.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(User $user)
    {
        // Charge la relation 'roles' pour l'utilisateur spécifique
        return response()->json([
            'message' => 'User details retrieved successfully',
            'data' => $user->load('roles'), // Assure que les rôles sont inclus
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     * Mettre à jour un utilisateur existant et ses rôles.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, User $user)
    {
        try {
            DB::beginTransaction();

            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'phone' => ['nullable', 'string', 'max:20'],
                'password' => ['nullable', 'string', 'min:8', 'confirmed'], // Rendre le mot de passe optionnel
                'roles' => ['required', 'array', Rule::exists('roles', 'name')], // Les rôles sont toujours requis
            ], [
                'name.required' => 'Le nom est obligatoire.',
                'name.string' => 'Le nom doit être une chaîne de caractères.',
                'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',

                'email.required' => 'L\'adresse e-mail est obligatoire.',
                'email.string' => 'L\'adresse e-mail doit être une chaîne de caractères.',
                'email.email' => 'L\'adresse e-mail doit être une adresse valide.',
                'email.max' => 'L\'adresse e-mail ne doit pas dépasser 255 caractères.',
                'email.unique' => 'Cet e-mail est déjà utilisé par un autre utilisateur.',

                'password.string' => 'Le mot de passe doit être une chaîne de caractères.',
                'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',

                'phone.string' => 'Le numéro de téléphone doit être une chaîne de caractères.',
                'phone.max' => 'Le numéro de téléphone ne doit pas dépasser 20 caractères.',

                'roles.required' => 'Les rôles sont obligatoires.',
                'roles.array' => 'Les rôles doivent être un tableau.',
                'roles.exists' => 'Un ou plusieurs rôles spécifiés n\'existent pas.',
            ]);

            $user->name = $validatedData['name'];
            $user->email = $validatedData['email'];
            $user->phone = $validatedData['phone'] ?? null;

            // Si un nouveau mot de passe est fourni, le hasher
            if (!empty($validatedData['password'])) {
                $user->password = Hash::make($validatedData['password']);
            }

            $user->save(); // Sauvegarde les champs de l'utilisateur

            // Synchroniser les rôles : cela va détacher les rôles actuels
            // et attacher uniquement ceux qui sont passés dans $validatedData['roles'].
            // C'est la méthode préférée pour remplacer l'ensemble des rôles.
            $roleModels = Role::whereIn('name', $validatedData['roles'])->get();
            $user->roles()->sync($roleModels->pluck('id'));

            DB::commit();

            // Charger les rôles pour la réponse JSON
            return response()->json([
                'message' => 'Utilisateur mis à jour avec succès !',
                'data' => $user->load('roles'), // Recharger l'utilisateur avec ses rôles attachés
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error("Validation error during user update for ID: {$user->id} - " . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating user ID: {$user->id} - " . $e->getMessage());
            return response()->json([
                'message' => 'Échec de la mise à jour de l\'utilisateur. Veuillez réessayer.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * Supprimer un utilisateur.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(User $user)
    {
        try {
            DB::beginTransaction();
            // La suppression de l'utilisateur supprimera automatiquement les entrées
            // dans la table pivot si la contrainte de clé étrangère est configurée avec ON DELETE CASCADE.
            // Sinon, vous pourriez avoir besoin de $user->roles()->detach(); avant $user->delete();
            $user->delete();
            DB::commit();

            return response()->json([
                'message' => 'Utilisateur supprimé avec succès !',
            ], 204); // 204 No Content
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting user ID: {$user->id} - " . $e->getMessage());
            return response()->json([
                'message' => 'Échec de la suppression de l\'utilisateur. Veuillez réessayer.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
