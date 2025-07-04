<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;




Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user()->load('roles');
});

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->post('/logout', [AuthController::class, 'logout']);

Route::controller(UserController::class)->group(function () {
    Route::post('/user/profile-image', 'updateProfileImage');
    Route::put('/user/{user}', 'update');
})->middleware(['auth:sanctum']);