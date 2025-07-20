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
use App\Http\Controllers\CourseSessionController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TimeSlotController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TeacherScheduleController;




Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user()->load('roles');
});


Route::controller(TeacherScheduleController::class)->group(function () {
    Route::get('/teacher-schedule', 'getTeacherSchedule');
})->middleware(['auth:sanctum']);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->post('/logout', [AuthController::class, 'logout']);

Route::controller(UserController::class)->group(function () {
    Route::post('/user/profile-image', 'updateProfileImage');
    Route::put('/user/{user}', 'update');
    Route::put('/user/{user}/password', 'updatePassword');
})->middleware(['auth:sanctum']);



Route::controller(TimetablePromotionController::class)->group(function () {
    Route::get('/timetables/promotions', 'index');
    Route::get('/timetables/promotions/{promotion}', 'show');
    Route::post('/timetables/check-or-create',  'checkOrCreate');
    Route::get('/timetables/{timetable}/download-pdf',  'downloadPdf');
})->middleware(['auth:sanctum']);

// Nouvelles routes pour StudentController
Route::prefix('promotions/{promotionId}/students')->group(function () {
    Route::get('download-pdf', [StudentController::class, 'downloadPdf']);
    Route::get('/', [StudentController::class, 'index']); // Liste des étudiants d'une promotion
    Route::post('/', [StudentController::class, 'store']); // Ajouter un étudiant à une promotion
    Route::get('{student}', [StudentController::class, 'show']); // Afficher un étudiant spécifique
    Route::put('{student}', [StudentController::class, 'update']); // Mettre à jour un étudiant
    Route::post('import', [StudentController::class, 'importStudents']);
    Route::delete('{student}', [StudentController::class, 'destroy']); // Supprimer un étudiant
    Route::patch('{student}/set-delegate', [StudentController::class, 'setDelegateStatus']); // Définir le statut de délégué
    Route::get('download-pdf', [StudentController::class, 'downloadPdf']);
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
    Route::get('/promotions/{promotion}', 'show');
    Route::post('/promotions', 'store');
    Route::put('/promotions/{promotion}', 'update');
})->middleware(['auth:sanctum']);



Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/weeks', [WeekController::class, 'index']);
    Route::get('/weeks/{week}', [WeekController::class, 'show']);
})->middleware(['auth:sanctum']);


Route::controller(CourseSessionController::class)->group(function () {
    Route::post('/timetables/{timetable}/sessions/sync', 'syncSessions');
    Route::get('/timetables/{timetable}/sessions', 'indexForTimetable');
})->middleware(['auth:sanctum']);


Route::controller(TeacherController::class)->group(function(){
    Route::get('/teachers', 'index');
});

Route::controller(TimeSlotController::class)->group(function () {
    Route::get('/time-slots', 'index');
})->middleware(['auth:sanctum']);


Route::controller(DashboardController::class)->group(function(){
    Route::get('/dashboard-stats', 'index');
})->middleware(['auth:sanctum']);


