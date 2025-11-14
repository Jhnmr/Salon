<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register middleware aliases
        $middleware->alias([
            // Authentication & Authorization
            'jwt' => \App\Http\Middleware\JwtMiddleware::class,
            'rbac' => \App\Http\Middleware\RBACMiddleware::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class, // Simple role-based access

            // Security Middleware
            'security.headers' => \App\Http\Middleware\SecurityHeadersMiddleware::class,
            'cors' => \App\Http\Middleware\CorsMiddleware::class,
            'input.sanitization' => \App\Http\Middleware\InputSanitizationMiddleware::class,
            'audit.log' => \App\Http\Middleware\AuditLogMiddleware::class,

            // Rate Limiting (with different limits)
            'rate.limit' => \App\Http\Middleware\RateLimitMiddleware::class,
            'rate.limit.auth' => \App\Http\Middleware\RateLimitMiddleware::class . ':auth',
            'rate.limit.api' => \App\Http\Middleware\RateLimitMiddleware::class . ':api',
            'rate.limit.authenticated' => \App\Http\Middleware\RateLimitMiddleware::class . ':authenticated',
        ]);

        // Add security middleware to API routes
        $middleware->api(append: [
            \App\Http\Middleware\SecurityHeadersMiddleware::class,
            \App\Http\Middleware\CorsMiddleware::class,
            \App\Http\Middleware\InputSanitizationMiddleware::class,
            \App\Http\Middleware\AuditLogMiddleware::class,
            \App\Http\Middleware\RateLimitMiddleware::class . ':api',
        ]);

        // Add security middleware to web routes
        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeadersMiddleware::class,
            \App\Http\Middleware\InputSanitizationMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
