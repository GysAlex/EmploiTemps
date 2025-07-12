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
        Schema::create('timetables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_id')->constrained('promotions')->onDelete('cascade');
            $table->foreignId('week_id')->constrained('weeks')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['promotion_id', 'week_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::table('timetables', function (Blueprint $table) {
            $table->dropUnique(['promotion_id', 'week_id']);
            $table->dropForeign(['promotion_id']);
            $table->dropForeign(['week_id']);
        });
        Schema::dropIfExists('timetables');
    }
};
