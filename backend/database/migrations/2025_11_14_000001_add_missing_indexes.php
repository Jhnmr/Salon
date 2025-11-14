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
        // Add missing indexes for performance optimization

        // Messages table
        Schema::table('messages', function (Blueprint $table) {
            $table->index(['conversation_id', 'created_at'], 'idx_messages_conversation_created');
            $table->index(['receiver_id', 'read_at'], 'idx_messages_receiver_read');
        });

        // Likes Posts table
        Schema::table('likes_posts', function (Blueprint $table) {
            $table->index(['post_id', 'user_id'], 'idx_likes_post_user');
            $table->index(['created_at'], 'idx_likes_created');
        });

        // Comments Posts table
        Schema::table('comentarios_posts', function (Blueprint $table) {
            $table->index(['post_id', 'created_at'], 'idx_comments_post_created');
        });

        // Notifications table
        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'is_read', 'created_at'], 'idx_notifications_user_read_created');
        });

        // Payments table
        Schema::table('payments', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'idx_payments_user_status');
            $table->index(['branch_id', 'created_at'], 'idx_payments_branch_created');
        });

        // Posts table
        Schema::table('posts', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'idx_posts_user_created');
        });

        // Promotions table
        Schema::table('promotions', function (Blueprint $table) {
            $table->index(['code'], 'idx_promotions_code');
            $table->index(['is_active', 'valid_from', 'valid_until'], 'idx_promotions_active_validity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('idx_messages_conversation_created');
            $table->dropIndex('idx_messages_receiver_read');
        });

        Schema::table('likes_posts', function (Blueprint $table) {
            $table->dropIndex('idx_likes_post_user');
            $table->dropIndex('idx_likes_created');
        });

        Schema::table('comentarios_posts', function (Blueprint $table) {
            $table->dropIndex('idx_comments_post_created');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_user_read_created');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_user_status');
            $table->dropIndex('idx_payments_branch_created');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex('idx_posts_user_created');
        });

        Schema::table('promotions', function (Blueprint $table) {
            $table->dropIndex('idx_promotions_code');
            $table->dropIndex('idx_promotions_active_validity');
        });
    }
};
