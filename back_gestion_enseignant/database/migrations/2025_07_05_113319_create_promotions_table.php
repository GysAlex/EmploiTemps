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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id(); // Clé primaire auto-incrémentée
            $table->string('name')->unique(); 
            $table->string('level'); 
            $table->integer('students')->unsigned(); // Nombre d'étudiants dans cette promotion, doit être un entier positif
            $table->boolean('published')->default(false); // Indique si l'emploi de temps à été publié
            $table->timestamps(); // 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
