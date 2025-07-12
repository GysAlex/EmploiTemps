<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\TimetablePromotionController;
use App\Http\Controllers\WeekController;




Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user()->load('roles');
});

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->post('/logout', [AuthController::class, 'logout']);

Route::controller(UserController::class)->group(function () {
    Route::post('/user/profile-image', 'updateProfileImage');
    Route::put('/user/{user}', 'update');
    Route::put('/user/{user}/password', 'updatePassword');
})->middleware(['auth:sanctum']);

Route::controller(UserManagementController::class)->group(function () {
    Route::get('/users', 'index');
    Route::delete('/users/{user}/delete', 'destroy');
    Route::post('/users/create', 'store');
    Route::put('/users/{user}/update', 'update');
})->middleware(['auth:sanctum']);


Route::controller(ClassroomController::class)->group(function () {
    Route::get('/classrooms', 'index');
    Route::delete('/classrooms/{classroom}', 'destroy');
    Route::post('/classrooms', 'store');
    Route::put('/classrooms/{classroom}', 'update');
})->middleware(['auth:sanctum']);

Route::controller(CourseController::class)->group(function () {
    Route::get('/courses', 'index');
    Route::delete('/courses/{course}', 'destroy');
    Route::post('/courses', 'store');
    Route::put('/courses/{course}', 'update');
})->middleware(['auth:sanctum']);

Route::controller(PromotionController::class)->group(function () {
    Route::get('/promotions', 'index');
    Route::delete('/promotions/{promotion}', 'destroy');
    Route::post('/promotions', 'store');
    Route::put('/promotions/{promotion}', 'update');
})->middleware(['auth:sanctum']);


Route::controller(TimetablePromotionController::class)->group(function () {
    Route::get('/timetables/promotions', 'index');

})->middleware(['auth:sanctum']);

Route::middleware(['auth:sanctum'])->group(function () {
     Route::get('/weeks', [WeekController::class, 'index']);
});
