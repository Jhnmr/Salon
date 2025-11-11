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
        Schema::table('users', function (Blueprint $table) {
            // Basic information
            $table->string('phone', 20)->nullable()->after('email');
            $table->string('apellidos', 255)->nullable()->after('name');

            // Preferences
            $table->string('theme', 20)->default('light')->after('password')->comment('light, dark, auto');
            $table->string('color_palette', 50)->nullable()->after('theme');
            $table->string('language_preference', 5)->default('es')->after('color_palette');

            // Location and timezone
            $table->string('country', 2)->default('CR')->after('language_preference')->comment('ISO 3166-1 alpha-2');
            $table->string('timezone', 50)->default('America/Costa_Rica')->after('country');
            $table->string('currency', 3)->default('CRC')->after('timezone')->comment('ISO 4217');

            // Email verification
            $table->timestamp('email_verified_at')->nullable()->after('email');
            $table->string('email_verification_token', 100)->nullable()->after('email_verified_at');

            // Security
            $table->unsignedTinyInteger('failed_login_attempts')->default(0)->after('password');
            $table->timestamp('locked_until')->nullable()->after('failed_login_attempts');

            // OAuth
            $table->string('provider', 50)->nullable()->after('password')->comment('google, facebook, apple');
            $table->string('provider_id', 255)->nullable()->after('provider');

            // Two-factor authentication
            $table->boolean('two_factor_enabled')->default(false)->after('password');
            $table->text('two_factor_secret')->nullable()->after('two_factor_enabled');

            // Soft delete
            $table->softDeletes()->after('updated_at');

            // Índices
            $table->index(['phone']);
            $table->index(['country']);
            $table->index(['provider', 'provider_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone', 'apellidos', 'theme', 'color_palette', 'language_preference',
                'country', 'timezone', 'currency', 'email_verified_at', 'email_verification_token',
                'failed_login_attempts', 'locked_until', 'provider', 'provider_id',
                'two_factor_enabled', 'two_factor_secret', 'deleted_at'
            ]);
        });
    }
};
