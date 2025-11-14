<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');

            $table->string('name');
            $table->text('description')->nullable();
            $table->string('sku')->unique();
            $table->string('category');
            $table->string('brand')->nullable();

            $table->decimal('cost_price', 10, 2);
            $table->decimal('selling_price', 10, 2);
            $table->integer('stock_quantity')->default(0);
            $table->integer('low_stock_threshold')->default(10);
            $table->string('unit')->default('piece');

            $table->string('barcode')->nullable()->unique();
            $table->string('supplier')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_for_sale')->default(false);
            $table->string('image_url')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('branch_id');
            $table->index('category');
            $table->index('is_active');
            $table->index('is_for_sale');
            $table->index(['branch_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
