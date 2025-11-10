<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;
use Exception;

class JwtService
{
    private string $privateKey;
    private string $publicKey;
    private string $algorithm = 'RS256';
    private string $issuer;

    public function __construct()
    {
        $this->privateKey = file_get_contents(storage_path('keys/private.pem'));
        $this->publicKey = file_get_contents(storage_path('keys/public.pem'));
        $this->issuer = config('app.url');
    }

    /**
     * Generar Access Token (15 minutos)
     */
    public function generateAccessToken(User $user): string
    {
        $now = time();
        $payload = [
            'iss' => $this->issuer,
            'sub' => $user->id,
            'iat' => $now,
            'exp' => $now + (15 * 60), // 15 minutos
            'type' => 'access',
            'data' => [
                'user_id' => $user->id,
                'email' => $user->email,
                'estado' => $user->estado,
            ]
        ];

        return JWT::encode($payload, $this->privateKey, $this->algorithm);
    }

    /**
     * Generar Refresh Token (7 días)
     */
    public function generateRefreshToken(User $user): string
    {
        $now = time();
        $payload = [
            'iss' => $this->issuer,
            'sub' => $user->id,
            'iat' => $now,
            'exp' => $now + (7 * 24 * 60 * 60), // 7 días
            'type' => 'refresh'
        ];

        $token = JWT::encode($payload, $this->privateKey, $this->algorithm);

        // Guardar en base de datos para poder revocar
        \DB::table('refresh_tokens')->insert([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $token),
            'expires_at' => date('Y-m-d H:i:s', $now + (7 * 24 * 60 * 60)),
            'created_at' => date('Y-m-d H:i:s', $now)
        ]);

        return $token;
    }

    /**
     * Validar token
     */
    public function validateToken(string $token): ?object
    {
        try {
            $decoded = JWT::decode($token, new Key($this->publicKey, $this->algorithm));

            // Verificar si el token está en blacklist
            if ($this->isTokenBlacklisted($token)) {
                throw new Exception('Token revocado');
            }

            return $decoded;
        } catch (Exception $e) {
            \Log::error("Token validation failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Refrescar access token usando refresh token
     */
    public function refreshAccessToken(string $refreshToken): ?string
    {
        $decoded = $this->validateToken($refreshToken);

        if (!$decoded || $decoded->type !== 'refresh') {
            return null;
        }

        // Verificar que el refresh token existe en la base de datos
        $tokenHash = hash('sha256', $refreshToken);
        $exists = \DB::table('refresh_tokens')
            ->where('token_hash', $tokenHash)
            ->where('user_id', $decoded->sub)
            ->where('expires_at', '>', now())
            ->exists();

        if (!$exists) {
            return null;
        }

        $user = User::find($decoded->sub);
        if (!$user) {
            return null;
        }

        return $this->generateAccessToken($user);
    }

    /**
     * Revocar token (agregar a blacklist)
     */
    public function revokeToken(string $token): void
    {
        \DB::table('token_blacklist')->insert([
            'token_hash' => hash('sha256', $token),
            'created_at' => now()
        ]);
    }

    /**
     * Verificar si un token está en blacklist
     */
    private function isTokenBlacklisted(string $token): bool
    {
        return \DB::table('token_blacklist')
            ->where('token_hash', hash('sha256', $token))
            ->exists();
    }

    /**
     * Revocar todos los tokens de un usuario
     */
    public function revokeAllUserTokens(int $userId): void
    {
        \DB::table('refresh_tokens')
            ->where('user_id', $userId)
            ->delete();
    }
}
