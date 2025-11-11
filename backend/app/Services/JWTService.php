<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Firebase\JWT\BeforeValidException;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

/**
 * JWT Service
 *
 * Handles JWT token generation, validation, and refresh
 * Uses RS256 algorithm with RSA key pairs
 */
class JWTService
{
    /**
     * @var string
     */
    protected string $privateKey;

    /**
     * @var string
     */
    protected string $publicKey;

    /**
     * @var string
     */
    protected string $algorithm;

    /**
     * @var int
     */
    protected int $ttl;

    /**
     * @var int
     */
    protected int $refreshTtl;

    /**
     * @var int
     */
    protected int $leeway;

    /**
     * @var string
     */
    protected string $issuer;

    /**
     * @var string
     */
    protected string $audience;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->privateKey = file_get_contents(config('jwt.private_key'));
        $this->publicKey = file_get_contents(config('jwt.public_key'));
        $this->algorithm = config('jwt.algorithm', 'RS256');
        $this->ttl = config('jwt.ttl', 3600);
        $this->refreshTtl = config('jwt.refresh_ttl', 604800);
        $this->leeway = config('jwt.leeway', 60);
        $this->issuer = config('jwt.issuer', 'salon-api');
        $this->audience = config('jwt.audience', 'salon-app');

        JWT::$leeway = $this->leeway;
    }

    /**
     * Generate access token for a user
     *
     * @param User $user
     * @param array $customClaims
     * @return string
     */
    public function generateAccessToken(User $user, array $customClaims = []): string
    {
        $issuedAt = time();
        $expiresAt = $issuedAt + $this->ttl;

        $payload = array_merge([
            'iss' => $this->issuer,
            'aud' => $this->audience,
            'iat' => $issuedAt,
            'exp' => $expiresAt,
            'sub' => $user->id,
            'jti' => Str::uuid()->toString(), // JWT ID
            'role' => $user->role,
            'email' => $user->email,
            'name' => $user->name,
        ], $customClaims);

        return JWT::encode($payload, $this->privateKey, $this->algorithm);
    }

    /**
     * Generate refresh token for a user
     *
     * @param User $user
     * @return string
     */
    public function generateRefreshToken(User $user): string
    {
        $issuedAt = time();
        $expiresAt = $issuedAt + $this->refreshTtl;
        $refreshTokenId = Str::uuid()->toString();

        $payload = [
            'iss' => $this->issuer,
            'aud' => $this->audience,
            'iat' => $issuedAt,
            'exp' => $expiresAt,
            'sub' => $user->id,
            'jti' => $refreshTokenId,
            'type' => 'refresh',
        ];

        // Store refresh token ID in Redis with expiration
        if (config('jwt.blacklist_enabled')) {
            Redis::setex(
                "refresh_token:{$refreshTokenId}",
                $this->refreshTtl,
                json_encode([
                    'user_id' => $user->id,
                    'issued_at' => $issuedAt,
                    'expires_at' => $expiresAt,
                ])
            );
        }

        return JWT::encode($payload, $this->privateKey, $this->algorithm);
    }

    /**
     * Decode and validate a JWT token
     *
     * @param string $token
     * @return object
     * @throws \Exception
     */
    public function decode(string $token): object
    {
        try {
            $decoded = JWT::decode($token, new Key($this->publicKey, $this->algorithm));

            // Check if token is blacklisted
            if (config('jwt.blacklist_enabled') && $this->isBlacklisted($decoded->jti)) {
                throw new \Exception('Token has been revoked');
            }

            return $decoded;
        } catch (ExpiredException $e) {
            throw new \Exception('Token has expired');
        } catch (SignatureInvalidException $e) {
            throw new \Exception('Token signature is invalid');
        } catch (BeforeValidException $e) {
            throw new \Exception('Token is not yet valid');
        } catch (\Exception $e) {
            throw new \Exception('Token validation failed: ' . $e->getMessage());
        }
    }

    /**
     * Validate a token and return the user
     *
     * @param string $token
     * @return User|null
     */
    public function validateToken(string $token): ?User
    {
        try {
            $decoded = $this->decode($token);
            return User::find($decoded->sub);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Refresh an access token using a refresh token
     *
     * @param string $refreshToken
     * @return array ['access_token' => string, 'refresh_token' => string]
     * @throws \Exception
     */
    public function refresh(string $refreshToken): array
    {
        try {
            $decoded = $this->decode($refreshToken);

            // Verify it's a refresh token
            if (!isset($decoded->type) || $decoded->type !== 'refresh') {
                throw new \Exception('Invalid refresh token');
            }

            // Check if refresh token exists in Redis
            if (config('jwt.blacklist_enabled')) {
                $storedToken = Redis::get("refresh_token:{$decoded->jti}");
                if (!$storedToken) {
                    throw new \Exception('Refresh token not found or expired');
                }
            }

            // Get user
            $user = User::find($decoded->sub);
            if (!$user) {
                throw new \Exception('User not found');
            }

            // Generate new tokens
            $newAccessToken = $this->generateAccessToken($user);
            $newRefreshToken = null;

            // Refresh token rotation: invalidate old refresh token and generate new one
            if (config('jwt.refresh_rotation')) {
                $this->blacklistToken($decoded->jti);
                $newRefreshToken = $this->generateRefreshToken($user);
            }

            return [
                'access_token' => $newAccessToken,
                'refresh_token' => $newRefreshToken ?? $refreshToken,
                'token_type' => 'Bearer',
                'expires_in' => $this->ttl,
            ];
        } catch (\Exception $e) {
            throw new \Exception('Token refresh failed: ' . $e->getMessage());
        }
    }

    /**
     * Blacklist a token
     *
     * @param string $jti
     * @param int|null $ttl
     * @return void
     */
    public function blacklistToken(string $jti, ?int $ttl = null): void
    {
        if (!config('jwt.blacklist_enabled')) {
            return;
        }

        $ttl = $ttl ?? $this->ttl + config('jwt.blacklist_grace_period', 300);

        Redis::setex("blacklist:{$jti}", $ttl, time());
    }

    /**
     * Check if a token is blacklisted
     *
     * @param string $jti
     * @return bool
     */
    public function isBlacklisted(string $jti): bool
    {
        if (!config('jwt.blacklist_enabled')) {
            return false;
        }

        return Redis::exists("blacklist:{$jti}") > 0;
    }

    /**
     * Revoke all tokens for a user
     *
     * @param int $userId
     * @return void
     */
    public function revokeAllUserTokens(int $userId): void
    {
        if (!config('jwt.blacklist_enabled')) {
            return;
        }

        // This requires maintaining a user tokens list in Redis
        // For simplicity, we'll just set a flag
        Redis::setex("user_tokens_revoked:{$userId}", $this->refreshTtl, time());
    }

    /**
     * Extract token from Authorization header
     *
     * @param string|null $header
     * @return string|null
     */
    public function extractTokenFromHeader(?string $header): ?string
    {
        if (!$header) {
            return null;
        }

        $prefix = config('jwt.token_prefix', 'Bearer');

        if (stripos($header, $prefix) === 0) {
            return trim(substr($header, strlen($prefix)));
        }

        return null;
    }

    /**
     * Generate both access and refresh tokens
     *
     * @param User $user
     * @return array
     */
    public function generateTokenPair(User $user): array
    {
        return [
            'access_token' => $this->generateAccessToken($user),
            'refresh_token' => $this->generateRefreshToken($user),
            'token_type' => 'Bearer',
            'expires_in' => $this->ttl,
        ];
    }

    /**
     * Get the TTL (time to live) for access tokens
     *
     * @return int
     */
    public function getTTL(): int
    {
        return $this->ttl;
    }

    /**
     * Get the TTL for refresh tokens
     *
     * @return int
     */
    public function getRefreshTTL(): int
    {
        return $this->refreshTtl;
    }
}
