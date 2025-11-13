<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Input Sanitization Middleware
 *
 * Sanitizes all user input to prevent XSS attacks and other injection vulnerabilities.
 *
 * Features:
 * - Trims all string inputs
 * - Removes null bytes
 * - Converts special characters with htmlspecialchars for specific fields
 * - Whitelist support (password fields, raw_ prefixed fields)
 * - Preserves JSON fields
 * - Logs sanitization events
 *
 * @package App\Http\Middleware
 */
class InputSanitizationMiddleware
{
    /**
     * Fields that should not be sanitized
     *
     * @var array<int, string>
     */
    protected array $whitelist = [
        'password',
        'password_confirmation',
        'current_password',
        'new_password',
    ];

    /**
     * Field patterns that should not be sanitized
     *
     * @var array<int, string>
     */
    protected array $whitelistPatterns = [
        '/^raw_/',  // Fields starting with 'raw_'
    ];

    /**
     * Fields that should be treated as HTML and sanitized more aggressively
     *
     * @var array<int, string>
     */
    protected array $htmlFields = [
        'comment',
        'comments',
        'review',
        'reviews',
        'note',
        'notes',
        'message',
        'description',
        'bio',
        'about',
    ];

    /**
     * Fields that contain JSON data (should not be sanitized)
     *
     * @var array<int, string>
     */
    protected array $jsonFields = [
        'metadata',
        'settings',
        'preferences',
        'data',
        'config',
        'options',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip sanitization if disabled in config
        if (!config('security.input_sanitization.enabled', true)) {
            return $next($request);
        }

        // Only sanitize specific request methods
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            $this->sanitizeInput($request);
        }

        return $next($request);
    }

    /**
     * Sanitize all request input
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    protected function sanitizeInput(Request $request): void
    {
        $input = $request->all();
        $sanitized = $this->sanitizeArray($input);

        // Check if any sanitization occurred
        if ($sanitized !== $input) {
            $changes = $this->detectChanges($input, $sanitized);

            if (!empty($changes)) {
                Log::info('Input sanitization applied', [
                    'path' => $request->path(),
                    'method' => $request->method(),
                    'user_id' => $request->user()?->id,
                    'ip' => $request->ip(),
                    'fields_sanitized' => array_keys($changes),
                    'count' => count($changes)
                ]);
            }
        }

        // Replace request input with sanitized data
        $request->replace($sanitized);
    }

    /**
     * Recursively sanitize array data
     *
     * @param  array<mixed>  $data
     * @param  string  $parentKey
     * @return array<mixed>
     */
    protected function sanitizeArray(array $data, string $parentKey = ''): array
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            $fullKey = $parentKey ? $parentKey . '.' . $key : $key;

            // Check if field is whitelisted
            if ($this->isWhitelisted($key, $fullKey)) {
                $sanitized[$key] = $value;
                continue;
            }

            // Check if field is JSON
            if ($this->isJsonField($key)) {
                $sanitized[$key] = $value;
                continue;
            }

            // Sanitize based on value type
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitizeArray($value, $fullKey);
            } elseif (is_string($value)) {
                $sanitized[$key] = $this->sanitizeString($value, $key);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }

    /**
     * Sanitize a string value
     *
     * @param  string  $value
     * @param  string  $key
     * @return string
     */
    protected function sanitizeString(string $value, string $key): string
    {
        // Remove null bytes
        $value = str_replace("\0", '', $value);

        // Trim whitespace
        $value = trim($value);

        // Apply HTML sanitization for specific fields
        if ($this->isHtmlField($key)) {
            // Convert special characters to HTML entities
            $value = htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }

        return $value;
    }

    /**
     * Check if a field is whitelisted
     *
     * @param  string  $key
     * @param  string  $fullKey
     * @return bool
     */
    protected function isWhitelisted(string $key, string $fullKey): bool
    {
        // Check exact match in whitelist
        if (in_array($key, $this->whitelist) || in_array($fullKey, $this->whitelist)) {
            return true;
        }

        // Check pattern match
        foreach ($this->whitelistPatterns as $pattern) {
            if (preg_match($pattern, $key) || preg_match($pattern, $fullKey)) {
                return true;
            }
        }

        // Check config whitelist
        $configWhitelist = config('security.input_sanitization.whitelist', []);
        if (in_array($key, $configWhitelist) || in_array($fullKey, $configWhitelist)) {
            return true;
        }

        return false;
    }

    /**
     * Check if a field should be treated as HTML
     *
     * @param  string  $key
     * @return bool
     */
    protected function isHtmlField(string $key): bool
    {
        return in_array(strtolower($key), $this->htmlFields);
    }

    /**
     * Check if a field contains JSON data
     *
     * @param  string  $key
     * @return bool
     */
    protected function isJsonField(string $key): bool
    {
        return in_array(strtolower($key), $this->jsonFields);
    }

    /**
     * Detect changes between original and sanitized data
     *
     * @param  array<mixed>  $original
     * @param  array<mixed>  $sanitized
     * @return array<string, array{original: mixed, sanitized: mixed}>
     */
    protected function detectChanges(array $original, array $sanitized): array
    {
        $changes = [];

        foreach ($sanitized as $key => $value) {
            if (!isset($original[$key])) {
                continue;
            }

            if (is_array($value)) {
                $nestedChanges = $this->detectChanges($original[$key], $value);
                if (!empty($nestedChanges)) {
                    foreach ($nestedChanges as $nestedKey => $nestedChange) {
                        $changes[$key . '.' . $nestedKey] = $nestedChange;
                    }
                }
            } elseif ($original[$key] !== $value) {
                $changes[$key] = [
                    'original' => $original[$key],
                    'sanitized' => $value
                ];
            }
        }

        return $changes;
    }
}
