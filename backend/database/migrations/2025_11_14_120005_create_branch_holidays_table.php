<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_holidays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');

            $table->string('name');
            $table->date('date');
            $table->boolean('is_recurring')->default(false);
            $table->enum('closure_type', ['full_day', 'partial', 'emergency'])->default('full_day');
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('branch_id');
            $table->index('date');
            $table->index('is_recurring');
            $table->index(['branch_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_holidays');
    }
};
