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
            // Agregar campos demográficos y personales
            $table->string('apellidos', 255)->nullable()->after('name');
            $table->string('telefono', 20)->nullable()->after('email');
            $table->boolean('telefono_verificado')->default(false)->after('telefono');
            $table->string('foto_perfil', 500)->nullable()->after('telefono_verificado');
            $table->date('fecha_nacimiento')->nullable()->after('foto_perfil');
            $table->enum('genero', ['masculino', 'femenino', 'otro', 'prefiero_no_decir'])->nullable()->after('fecha_nacimiento');

            // Configuración regional
            $table->string('pais', 2)->default('CR')->comment('ISO 3166-1 alpha-2')->after('genero');
            $table->string('codigo_pais', 5)->default('+506')->after('pais');
            $table->string('idioma', 5)->default('es')->comment('ISO 639-1')->after('codigo_pais');
            $table->string('zona_horaria', 50)->default('America/Costa_Rica')->after('idioma');
            $table->string('moneda', 3)->default('CRC')->comment('ISO 4217')->after('zona_horaria');

            // Personalización
            $table->enum('tema', ['claro', 'oscuro', 'auto'])->default('auto')->after('moneda');
            $table->json('paleta_colores')->nullable()->comment('{"primary": "#d4af37", "secondary": "#1a1a1a"}')->after('tema');
            $table->json('preferencias_notificaciones')->nullable()->after('paleta_colores');

            // Estado y seguridad
            $table->enum('estado', ['activo', 'suspendido', 'eliminado', 'pendiente_verificacion'])->default('pendiente_verificacion')->after('preferencias_notificaciones');
            $table->timestamp('email_verificado_en')->nullable()->after('email_verified_at');
            $table->string('token_verificacion', 100)->nullable()->after('email_verificado_en');
            $table->string('token_reset_password', 100)->nullable()->after('token_verificacion');
            $table->timestamp('token_reset_expira')->nullable()->after('token_reset_password');
            $table->unsignedInteger('intentos_login_fallidos')->default(0)->after('token_reset_expira');
            $table->timestamp('bloqueado_hasta')->nullable()->after('intentos_login_fallidos');

            // OAuth / Social Login
            $table->string('provider', 50)->nullable()->comment('google, facebook, apple')->after('bloqueado_hasta');
            $table->string('provider_id', 255)->nullable()->after('provider');

            // Metadata
            $table->timestamp('ultimo_acceso')->nullable()->after('provider_id');
            $table->string('ip_ultimo_acceso', 45)->nullable()->after('ultimo_acceso');
            $table->json('dispositivo_info')->nullable()->after('ip_ultimo_acceso');

            // Soft delete
            $table->softDeletes()->after('updated_at');

            // Índices
            $table->index('telefono');
            $table->index('estado');
            $table->index('pais');
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
                'apellidos', 'telefono', 'telefono_verificado', 'foto_perfil',
                'fecha_nacimiento', 'genero', 'pais', 'codigo_pais', 'idioma',
                'zona_horaria', 'moneda', 'tema', 'paleta_colores',
                'preferencias_notificaciones', 'estado', 'email_verificado_en',
                'token_verificacion', 'token_reset_password', 'token_reset_expira',
                'intentos_login_fallidos', 'bloqueado_hasta', 'provider',
                'provider_id', 'ultimo_acceso', 'ip_ultimo_acceso',
                'dispositivo_info', 'deleted_at'
            ]);
        });
    }
};
