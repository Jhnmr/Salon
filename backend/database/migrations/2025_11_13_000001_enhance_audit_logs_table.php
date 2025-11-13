<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Enhances the existing audit_logs table with additional fields
     * for comprehensive security and audit tracking.
     */
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            // Add new fields for enhanced audit logging
            $table->string('request_method', 10)
                ->after('user_agent')
                ->nullable()
                ->comment('HTTP method: GET, POST, PUT, DELETE, PATCH');

            $table->string('request_path', 500)
                ->after('request_method')
                ->nullable()
                ->comment('Request URI path');

            $table->unsignedSmallInteger('status_code')
                ->after('request_path')
                ->nullable()
                ->comment('HTTP response status code');

            $table->decimal('duration_ms', 10, 2)
                ->after('status_code')
                ->nullable()
                ->comment('Request duration in milliseconds');

            $table->json('metadata')
                ->after('duration_ms')
                ->nullable()
                ->comment('Additional context: referer, query params, etc.');

            // Add indexes for new fields
            $table->index('request_path');
            $table->index('status_code');
            $table->index(['action', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex(['action', 'created_at']);
            $table->dropIndex(['status_code']);
            $table->dropIndex(['request_path']);

            $table->dropColumn([
                'request_method',
                'request_path',
                'status_code',
                'duration_ms',
                'metadata',
            ]);
        });
    }
};
