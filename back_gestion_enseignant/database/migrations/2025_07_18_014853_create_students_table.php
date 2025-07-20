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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('full_name'); // Nom complet de l'étudiant
            $table->string('email')->unique(); // Email, doit être unique
            $table->string('matricule')->unique(); // Numéro de matricule, doit être unique
            $table->boolean('is_delegate')->default(false); // Statut de délégué, par défaut à false
            $table->foreignId('promotion_id')->constrained('promotions')->onDelete('cascade'); // Clé étrangère vers la table promotions
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
