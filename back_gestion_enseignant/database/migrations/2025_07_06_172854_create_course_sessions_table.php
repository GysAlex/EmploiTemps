<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('course_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('timetable_id')->constrained('timetables')->onDelete('cascade'); // Lien vers l'emploi du temps global
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade'); // Lien vers la matière
            $table->foreignId('teacher_id')->constrained('users')->onDelete('restrict'); // Lien vers l'enseignant (utilisateur)
            $table->foreignId('room_id')->constrained('classrooms')->onDelete('restrict'); // Lien vers la salle de classe
            $table->foreignId('time_slot_id')->constrained('time_slots')->onDelete('restrict'); // Lien vers le créneau horaire

            $table->integer('duration_minutes'); // Durée spécifique de cette session (si différente du time_slot ou pour info)
            $table->string('session_type')->nullable(); // Ex: 'CM', 'TD', 'TP'
            $table->text('notes')->nullable(); // Notes additionnelles

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_sessions');
    }
};
