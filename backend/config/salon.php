<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Business Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for salon business logic and rules
    |
    */

    'business' => [
        // Business operating hours
        'hours' => [
            'start' => env('BUSINESS_HOUR_START', 9), // 9 AM
            'end' => env('BUSINESS_HOUR_END', 18), // 6 PM
        ],

        // Time slot duration in minutes
        'slot_duration' => env('SLOT_DURATION_MINUTES', 30),

        // Reservation advance notice (hours)
        'advance_notice_hours' => env('ADVANCE_NOTICE_HOURS', 1),

        // Cancellation policy (hours before appointment)
        'cancellation_policy_hours' => env('CANCELLATION_POLICY_HOURS', 24),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Configuration
    |--------------------------------------------------------------------------
    |
    | Payment processing and commission configuration
    |
    */

    'payment' => [
        // Platform commission percentage
        'commission_percentage' => env('PAYMENT_COMMISSION_PERCENTAGE', 20),

        // Stylist percentage (what they receive after commission)
        'stylist_percentage' => env('STYLIST_PERCENTAGE', 0.70), // 70%

        // Branch percentage
        'branch_percentage' => env('BRANCH_PERCENTAGE', 0.10), // 10%

        // Payment methods enabled
        'methods' => [
            'cash' => env('PAYMENT_METHOD_CASH', true),
            'card' => env('PAYMENT_METHOD_CARD', true),
            'sinpe' => env('PAYMENT_METHOD_SINPE', true),
            'transfer' => env('PAYMENT_METHOD_TRANSFER', true),
        ],

        // Auto-approve payments
        'auto_approve' => env('PAYMENT_AUTO_APPROVE', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Pagination Configuration
    |--------------------------------------------------------------------------
    |
    | Default pagination limits
    |
    */

    'pagination' => [
        'default' => env('PAGINATION_DEFAULT', 15),
        'max' => env('PAGINATION_MAX', 100),
        'min' => env('PAGINATION_MIN', 1),
    ],

    /*
    |--------------------------------------------------------------------------
    | Review Configuration
    |--------------------------------------------------------------------------
    |
    | Review and rating configuration
    |
    */

    'reviews' => [
        // Auto-approve reviews
        'auto_approve' => env('REVIEWS_AUTO_APPROVE', true),

        // Minimum rating
        'min_rating' => 1,

        // Maximum rating
        'max_rating' => 5,

        // Allow review editing (hours after creation)
        'edit_window_hours' => env('REVIEW_EDIT_WINDOW_HOURS', 24),
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Configuration
    |--------------------------------------------------------------------------
    |
    | Notification settings
    |
    */

    'notifications' => [
        // Send reminder 24 hours before appointment
        'reminder_24h' => env('NOTIFICATION_REMINDER_24H', true),

        // Send reminder 1 hour before appointment
        'reminder_1h' => env('NOTIFICATION_REMINDER_1H', true),

        // Notification channels
        'channels' => [
            'database' => true,
            'email' => env('NOTIFICATION_EMAIL', true),
            'push' => env('NOTIFICATION_PUSH', false),
            'sms' => env('NOTIFICATION_SMS', false),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Configuration
    |--------------------------------------------------------------------------
    |
    | File upload limits and allowed types
    |
    */

    'uploads' => [
        'max_size' => env('UPLOAD_MAX_SIZE', 5120), // 5MB in KB

        'allowed_images' => [
            'jpg', 'jpeg', 'png', 'gif', 'webp',
        ],

        'allowed_documents' => [
            'pdf', 'doc', 'docx',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | Security settings
    |
    */

    'security' => [
        // Password reset token expiry (minutes)
        'password_reset_expiry' => env('PASSWORD_RESET_EXPIRY', 60),

        // Email verification token expiry (hours)
        'email_verification_expiry' => env('EMAIL_VERIFICATION_EXPIRY', 24),

        // Max login attempts before lockout
        'max_login_attempts' => env('MAX_LOGIN_ATTEMPTS', 5),

        // Lockout duration (minutes)
        'lockout_duration' => env('LOCKOUT_DURATION', 15),
    ],

];
