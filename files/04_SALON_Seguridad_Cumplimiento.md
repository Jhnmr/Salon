# SALON - Seguridad y Cumplimiento Legal
## Documento 04 - Security & Compliance

---

## RESUMEN DE SEGURIDAD

```
┌─────────────────────────────────────────────────────────────┐
│               ARQUITECTURA DE SEGURIDAD SALON                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CAPA 1: PERÍMETRO                                          │
│  ├─ WAF (Web Application Firewall)                          │
│  ├─ DDoS Protection (CloudFlare)                            │
│  ├─ Rate Limiting (100 req/min por IP)                      │
│  └─ SSL/TLS 1.3 (Certificado wildcard)                      │
│                                                              │
│  CAPA 2: AUTENTICACIÓN                                      │
│  ├─ JWT Tokens (RS256)                                      │
│  ├─ Refresh Tokens (rotación)                               │
│  ├─ MFA opcional (TOTP / SMS)                               │
│  ├─ OAuth 2.0 (Google, Facebook, Apple)                     │
│  └─ Sesiones seguras (httpOnly cookies)                     │
│                                                              │
│  CAPA 3: AUTORIZACIÓN                                       │
│  ├─ RBAC (Role-Based Access Control)                        │
│  ├─ Permisos granulares por recurso                         │
│  └─ Verificación en cada endpoint                           │
│                                                              │
│  CAPA 4: DATOS                                              │
│  ├─ Contraseñas: bcrypt (cost 12)                           │
│  ├─ Datos sensibles: AES-256-GCM                            │
│  ├─ Datos de pago: PCI DSS (Stripe tokenización)            │
│  ├─ DB encryption at rest                                   │
│  └─ Backups encriptados                                     │
│                                                              │
│  CAPA 5: APLICACIÓN                                         │
│  ├─ Input validation (whitelist)                            │
│  ├─ Output encoding                                         │
│  ├─ Prepared statements (SQL injection)                     │
│  ├─ CSP headers (XSS)                                       │
│  ├─ CSRF tokens                                             │
│  └─ Sanitización de uploads                                 │
│                                                              │
│  CAPA 6: MONITOREO                                          │
│  ├─ Logs de auditoría                                       │
│  ├─ Alertas de seguridad                                    │
│  ├─ Pentesting trimestral                                   │
│  └─ Bug bounty program                                      │
└─────────────────────────────────────────────────────────────┘
```

## 1. AUTENTICACIÓN Y AUTORIZACIÓN

### 1.1 Flujo de Autenticación JWT

```
┌──────────┐                                      ┌──────────┐
│  CLIENTE │                                      │ SERVIDOR │
└────┬─────┘                                      └────┬─────┘
     │                                                 │
     │  1. POST /api/auth/login                       │
     │    { email, password }                         │
     ├────────────────────────────────────────────────>│
     │                                                 │
     │                        2. Verificar credenciales│
     │                           - Hash password (bcrypt)
     │                           - Validar en DB      │
     │                                                 │
     │                        3. Generar tokens       │
     │                           - Access Token (15min)│
     │                           - Refresh Token (7d) │
     │                                                 │
     │  4. Tokens + Usuario                           │
     │<────────────────────────────────────────────────│
     │  {                                              │
     │    "access_token": "eyJhbGc...",               │
     │    "refresh_token": "eyJhbGc...",              │
     │    "user": {...}                                │
     │  }                                              │
     │                                                 │
     │  5. Almacenar tokens                           │
     │    - Access: Memory                             │
     │    - Refresh: httpOnly cookie                   │
     │                                                 │
     │  6. Requests con Authorization header          │
     │    Bearer eyJhbGc...                            │
     ├────────────────────────────────────────────────>│
     │                                                 │
     │                        7. Validar token        │
     │                           - Verify signature   │
     │                           - Check expiration   │
     │                           - Validate payload   │
     │                                                 │
     │  8. Si token expiró → 401                      │
     │<────────────────────────────────────────────────│
     │                                                 │
     │  9. POST /api/auth/refresh                     │
     │    (refresh_token en cookie)                    │
     ├────────────────────────────────────────────────>│
     │                                                 │
     │                        10. Nuevo access_token  │
     │<────────────────────────────────────────────────│
     │                                                 │
```

### 1.2 Implementación JWT (PHP)

```php
<?php
// JWTManager.php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTManager {
    private $privateKey;
    private $publicKey;
    private $algorithm = 'RS256';
    
    public function __construct() {
        $this->privateKey = file_get_contents(__DIR__ . '/keys/private.pem');
        $this->publicKey = file_get_contents(__DIR__ . '/keys/public.pem');
    }
    
    public function generateAccessToken(User $user): string {
        $now = time();
        $payload = [
            'iss' => 'https://api.salon.com',
            'sub' => $user->id,
            'iat' => $now,
            'exp' => $now + (15 * 60), // 15 minutos
            'data' => [
                'user_id' => $user->id,
                'email' => $user->email,
                'rol' => $user->rol,
                'sucursal_id' => $user->sucursal_id ?? null
            ]
        ];
        
        return JWT::encode($payload, $this->privateKey, $this->algorithm);
    }
    
    public function generateRefreshToken(User $user): string {
        $now = time();
        $payload = [
            'iss' => 'https://api.salon.com',
            'sub' => $user->id,
            'iat' => $now,
            'exp' => $now + (7 * 24 * 60 * 60), // 7 días
            'type' => 'refresh'
        ];
        
        $token = JWT::encode($payload, $this->privateKey, $this->algorithm);
        
        // Guardar en DB para poder revocar
        $this->saveRefreshToken($user->id, $token, $now + (7 * 24 * 60 * 60));
        
        return $token;
    }
    
    public function validateToken(string $token): ?object {
        try {
            $decoded = JWT::decode($token, new Key($this->publicKey, $this->algorithm));
            
            // Verificar si el token está en blacklist
            if ($this->isTokenBlacklisted($token)) {
                throw new Exception('Token revocado');
            }
            
            return $decoded;
        } catch (Exception $e) {
            error_log("Token validation failed: " . $e->getMessage());
            return null;
        }
    }
    
    public function refreshAccessToken(string $refreshToken): ?string {
        $decoded = $this->validateToken($refreshToken);
        
        if (!$decoded || $decoded->type !== 'refresh') {
            return null;
        }
        
        $user = User::find($decoded->sub);
        if (!$user) {
            return null;
        }
        
        return $this->generateAccessToken($user);
    }
    
    private function saveRefreshToken(int $userId, string $token, int $expiresAt): void {
        DB::table('refresh_tokens')->insert([
            'user_id' => $userId,
            'token' => hash('sha256', $token),
            'expires_at' => date('Y-m-d H:i:s', $expiresAt),
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }
    
    private function isTokenBlacklisted(string $token): bool {
        return DB::table('token_blacklist')
            ->where('token_hash', hash('sha256', $token))
            ->exists();
    }
}
```

## 2. PROTECCIÓN CONTRA ATAQUES COMUNES

### 2.1 SQL Injection (Prepared Statements)

```php
<?php
// ❌ MAL - Vulnerable a SQL Injection
$query = "SELECT * FROM usuarios WHERE email = '$email'";

// ✅ BIEN - Prepared Statement
$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
$stmt->execute([$email]);

// ✅ BIEN - Named Parameters
$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = :email AND estado = :estado");
$stmt->execute([
    'email' => $email,
    'estado' => 'activo'
]);
```

### 2.2 XSS (Cross-Site Scripting)

```php
<?php
// Sanitización de inputs
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Headers de seguridad
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.salon.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.salon.com;");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");
```

### 2.3 CSRF (Cross-Site Request Forgery)

```php
<?php
class CSRFProtection {
    public static function generateToken(): string {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    public static function validateToken(string $token): bool {
        if (!isset($_SESSION['csrf_token'])) {
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
}

// En formularios
<input type="hidden" name="csrf_token" value="<?= CSRFProtection::generateToken() ?>">

// En AJAX
fetch('/api/citas', {
    method: 'POST',
    headers: {
        'X-CSRF-Token': '<?= CSRFProtection::generateToken() ?>',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
});
```

### 2.4 Rate Limiting

```php
<?php
class RateLimiter {
    private $redis;
    private $maxAttempts = 100;
    private $decayMinutes = 1;
    
    public function __construct() {
        $this->redis = new Redis();
        $this->redis->connect('127.0.0.1', 6379);
    }
    
    public function tooManyAttempts(string $key): bool {
        $attempts = $this->redis->get($key);
        return $attempts !== false && $attempts >= $this->maxAttempts;
    }
    
    public function hit(string $key, int $decayMinutes = null): int {
        $decayMinutes = $decayMinutes ?? $this->decayMinutes;
        
        $this->redis->incr($key);
        $this->redis->expire($key, $decayMinutes * 60);
        
        return (int) $this->redis->get($key);
    }
    
    public function attemptsLeft(string $key): int {
        $attempts = $this->redis->get($key) ?: 0;
        return max(0, $this->maxAttempts - $attempts);
    }
    
    public function resetAttempts(string $key): void {
        $this->redis->del($key);
    }
}

// Middleware de Rate Limiting
function rateLimitMiddleware($request, $next) {
    $limiter = new RateLimiter();
    $key = 'rate_limit:' . $request->ip();
    
    if ($limiter->tooManyAttempts($key)) {
        return response()->json([
            'error' => 'Demasiadas solicitudes. Intente más tarde.'
        ], 429);
    }
    
    $limiter->hit($key);
    
    $response = $next($request);
    $response->header('X-RateLimit-Limit', $limiter->maxAttempts);
    $response->header('X-RateLimit-Remaining', $limiter->attemptsLeft($key));
    
    return $response;
}
```

## 3. ENCRIPTACIÓN DE DATOS

### 3.1 Contraseñas (Bcrypt)

```php
<?php
class PasswordManager {
    private $cost = 12;
    
    public function hash(string $password): string {
        return password_hash($password, PASSWORD_BCRYPT, [
            'cost' => $this->cost
        ]);
    }
    
    public function verify(string $password, string $hash): bool {
        return password_verify($password, $hash);
    }
    
    public function needsRehash(string $hash): bool {
        return password_needs_rehash($hash, PASSWORD_BCRYPT, [
            'cost' => $this->cost
        ]);
    }
}
```

### 3.2 Datos Sensibles (AES-256-GCM)

```php
<?php
class EncryptionManager {
    private $key;
    private $cipher = 'aes-256-gcm';
    
    public function __construct() {
        $this->key = getenv('APP_ENCRYPTION_KEY');
    }
    
    public function encrypt(string $data): string {
        $iv = random_bytes(16);
        $tag = '';
        
        $encrypted = openssl_encrypt(
            $data,
            $this->cipher,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
        
        return base64_encode($iv . $tag . $encrypted);
    }
    
    public function decrypt(string $encrypted): string {
        $data = base64_decode($encrypted);
        
        $iv = substr($data, 0, 16);
        $tag = substr($data, 16, 16);
        $ciphertext = substr($data, 32);
        
        return openssl_decrypt(
            $ciphertext,
            $this->cipher,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
    }
}
```

## 4. CUMPLIMIENTO LEGAL

### 4.1 GDPR (Europa)

```
REQUISITOS GDPR PARA SALON:
├─ Consentimiento explícito para cookies no esenciales
├─ Derecho al olvido (eliminación de datos)
├─ Derecho a la portabilidad (exportar datos)
├─ Derecho a rectificación
├─ Notificación de brechas de seguridad (72h)
├─ DPO (Data Protection Officer) si procesa datos de EU
├─ Privacy by Design
└─ Política de privacidad clara y accesible
```

### 4.2 Ley 8968 - Costa Rica

```
REQUISITOS LEY 8968:
├─ Registro de bases de datos ante PRODHAB
├─ Consentimiento informado para recolección de datos
├─ Seguridad de datos personales
├─ Derecho de acceso, rectificación y supresión
├─ Nombramiento de responsable de datos
├─ Notificación de incidentes de seguridad
└─ No transferencia internacional sin consentimiento
```

### 4.3 PCI DSS (Pagos con Tarjeta)

```
CUMPLIMIENTO PCI DSS:
├─ NO almacenar datos completos de tarjetas
├─ Usar tokenización (Stripe/PayPal)
├─ SSL/TLS en todas las transacciones
├─ Logs de acceso a datos de pago
├─ Escaneos de vulnerabilidades trimestrales
├─ Firewall y segmentación de red
└─ Auditorías anuales (si aplica)
```

## 5. LOGS Y AUDITORÍA

```php
<?php
class AuditLogger {
    public static function log(
        int $userId,
        string $action,
        string $tabla,
        int $registroId,
        ?array $datosAnteriores = null,
        ?array $datosNuevos = null
    ): void {
        DB::table('auditoria_logs')->insert([
            'usuario_id' => $userId,
            'accion' => $action,
            'tabla' => $tabla,
            'registro_id' => $registroId,
            'datos_anteriores' => json_encode($datosAnteriores),
            'datos_nuevos' => json_encode($datosNuevos),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }
    
    public static function logLogin(int $userId, bool $success): void {
        DB::table('login_logs')->insert([
            'usuario_id' => $userId,
            'success' => $success,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        // Detectar actividad sospechosa
        if (!$success) {
            self::checkSuspiciousActivity($userId);
        }
    }
    
    private static function checkSuspiciousActivity(int $userId): void {
        $failedAttempts = DB::table('login_logs')
            ->where('usuario_id', $userId)
            ->where('success', false)
            ->where('created_at', '>=', date('Y-m-d H:i:s', strtotime('-15 minutes')))
            ->count();
        
        if ($failedAttempts >= 5) {
            // Bloquear cuenta temporalmente
            DB::table('usuarios')
                ->where('id', $userId)
                ->update([
                    'bloqueado_hasta' => date('Y-m-d H:i:s', strtotime('+30 minutes'))
                ]);
            
            // Enviar alerta
            SecurityAlerts::send("Usuario $userId bloqueado por intentos fallidos");
        }
    }
}
```

---

**Continúa en: 05_SALON_Politicas_Legales.md**
