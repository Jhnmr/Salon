<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waiting_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('stylist_id')->nullable()->constrained('stylists')->onDelete('set null');
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');

            $table->date('preferred_date');
            $table->time('preferred_time')->nullable();
            $table->enum('status', ['active', 'notified', 'converted', 'cancelled', 'expired'])->default('active');
            $table->integer('priority')->default(0);
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('client_id');
            $table->index('stylist_id');
            $table->index('service_id');
            $table->index('branch_id');
            $table->index('status');
            $table->index('preferred_date');
            $table->index(['status', 'priority', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waiting_lists');
    }
};
