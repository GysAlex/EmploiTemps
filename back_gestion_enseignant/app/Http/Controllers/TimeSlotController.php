<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TimeSlots;

class TimeSlotController extends Controller
{
    public function index()
    {
        // Récupérer tous les créneaux horaires
        $timeSlots = TimeSlots::all();
        return response()->json($timeSlots);
    }
}
