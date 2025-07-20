<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Role;
use App\Http\Controllers\TimetablePromotionController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';


Route::get('/timetables/{timetable}', [TimetablePromotionController::class, 'previewPdfHtml'])->name('timetables.previewPdfHtml');
