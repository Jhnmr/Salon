<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('stylist_id')->constrained('stylists')->onDelete('cascade');

            $table->enum('note_type', ['allergy', 'preference', 'history', 'medical', 'general'])->default('general');
            $table->string('title');
            $table->text('content');
            $table->boolean('is_important')->default(false);
            $table->boolean('is_private')->default(true);
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('client_id');
            $table->index('stylist_id');
            $table->index('note_type');
            $table->index('is_important');
            $table->index(['client_id', 'note_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_notes');
    }
};
