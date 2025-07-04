<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuthRegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $fields = $request->validated();
        $user = User::where('email', $fields['email'])->first();



        if(!$user || !Hash::check($fields['password'], $user->password))
        {
            return response()->json([
                'message' => 'Identifiants incorrects.',
                'errors' => [
                    'email' => ['Les identifiants fournis sont incorrects.'],
                    // Pas de 'password' ici, pour ne pas donner d'indice sur quel champ est faux
                ]
            ], 401);
        }

        Auth::login($user);

        return response()->json([
            'user' => $user,
            // 'access_token' => $token, // À inclure SEULEMENT si tu utilises aussi des tokens API
            // 'token_type' => 'Bearer', // À inclure SEULEMENT si tu utilises aussi des tokens API
        ], 200);
    }

    public function logout()
    {
        Auth::guard('web')->logout(); //It work's i don't even know why
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
