<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\User;
use Illuminate\Validation\Rule;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate; // Pour l'autorisation

class UserController extends Controller
{
    public function updateProfileImage(Request $request)
    {
        $request->validate([
            'profile_image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ],
        [
            'profile_image.required' => 'Veillez fournir une image',
            'profile_image.image' => 'Veillez fournir une image valide',
            'profile_image.mimes' => 'format d\'image non pris en charge',
            'profile_image.max' => 'L\'image est trop lourder'
        ]
    );

        $user = $request->user(); // L'utilisateur authentifié par Sanctum

        if ($request->hasFile('profile_image')) {
            // Supprime l'ancienne image si elle existe (optionnel)
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            // Stocke la nouvelle image
            $path = $request->file('profile_image')->store('profile_images', 'public');
            $user->profile_image = $path; // Enregistre le chemin relatif
            $user->save();

            // Retourne la nouvelle URL complète de l'image
            return response()->json([
                'message' => 'Photo de profil mise à jour avec succès.',
                'profile_image_url' => Storage::disk('public')->url($path),
            ]);
        }

        return response()->json(['message' => 'Aucun fichier image fourni.'], 400);
    }

    public function update(Request $request, User $user)
    {

        Gate::authorize('update', $user);


        // 2. Validation des données
        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:2'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                // S'assurer que l'email est unique SAUF pour l'utilisateur actuel
                Rule::unique('users')->ignore($user->id),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'roles' => ['sometimes', 'array'], // 'sometimes' signifie valide seulement si le champ est présent
            // Chaque rôle doit être l'un des rôles valides présents en base de données.
            // Assurez-vous que les noms des rôles dans votre DB (ex: 'teacher') sont maintenant utilisés par le frontend.
            'roles.*' => ['string', Rule::in(['super_admin', 'admin', 'enseignant'])],
        ], [
            // Messages de validation personnalisés en français
            'name.required' => 'Le nom est obligatoire.',
            'name.string' => 'Le nom doit être une chaîne de caractères.',
            'name.max' => 'Le nom ne peut pas dépasser :max caractères.',
            'name.min' => 'Le nom doit contenir au moins :min caractères.',

            'email.required' => 'L\'adresse email est obligatoire.',
            'email.string' => 'L\'adresse email doit être une chaîne de caractères.',
            'email.email' => 'L\'adresse email doit être une adresse email valide.',
            'email.max' => 'L\'adresse email ne peut pas dépasser :max caractères.',
            'email.unique' => 'Cette adresse email est déjà utilisée par un autre utilisateur.',

            'phone.string' => 'Le numéro de téléphone doit être une chaîne de caractères.',
            'phone.max' => 'Le numéro de téléphone ne peut pas dépasser :max caractères.',

            'roles.array' => 'Les rôles doivent être un tableau.',
            'roles.*.string' => 'Chaque rôle doit être une chaîne de caractères.',
            'roles.*.in' => 'Un ou plusieurs rôles fournis ne sont pas valides.',
        ]);

        // Utiliser une transaction pour s'assurer que toutes les opérations réussissent ou échouent ensemble.
        DB::beginTransaction();

        try {
            // 3. Mise à jour des informations de base
            $user->name = $validatedData['name'];
            $user->email = $validatedData['email'];
            $user->phone = $validatedData['phone'] ?? null;
            $user->save();

            // 4. Gestion de la mise à jour des rôles
            // Vérifier si des rôles ont été envoyés ET si l'utilisateur connecté est un 'super_admin'
            $authUserRoles = $request->user()->roles->pluck('name')->toArray(); // Assurez-vous que les rôles de l'utilisateur connecté sont chargés
            
            if (isset($validatedData['roles']) && in_array('super_admin', $authUserRoles)) {
                $rolesToSyncNames = $validatedData['roles']; // Pas besoin de conversion ici !

                // Récupérer les IDs des rôles basés sur leurs noms
                $roleIds = Role::whereIn('name', $rolesToSyncNames)->pluck('id')->toArray();

                // Synchroniser les rôles via la relation Many-to-Many
                $user->roles()->sync($roleIds);
            }

            DB::commit(); // Valide la transaction
            
           return $request->user()->load('roles');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack(); // Annule la transaction en cas d'erreur de validation
            return response()->json(['errors' => $e->errors()], 422); // Retourne les erreurs de validation
        } catch (\Exception $e) {
            DB::rollBack(); // Annule la transaction en cas d'erreur inattendue
            \Log::error('Erreur lors de la mise à jour du profil utilisateur: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Une erreur est survenue lors de la mise à jour du profil.'], 500);
        }
    }
}
