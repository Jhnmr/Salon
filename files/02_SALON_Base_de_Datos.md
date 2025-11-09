# SALON - Base de Datos y Modelos de Datos
## Documento 02 - Arquitectura de Datos

---

## ÍNDICE
1. [Diagrama Entidad-Relación Completo](#erd)
2. [Esquemas SQL Detallados](#sql)
3. [Estrategia de Escalabilidad Multi-País](#escalabilidad)
4. [Índices y Optimización](#optimizacion)
5. [Triggers y Procedimientos Almacenados](#triggers)
6. [Estrategia de Backup y Recuperación](#backup)

---

## 1. DIAGRAMA ENTIDAD-RELACIÓN COMPLETO {#erd}

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BASE DE DATOS SALON                           │
│                     (MySQL 8.0 / PostgreSQL 15)                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│    usuarios     │ ◄─────────────────┐
├─────────────────┤                   │
│ PK id           │                   │
│    email UNIQUE │                   │
│    password     │                   │
│    nombre       │                   │
│    telefono     │                   │
│    foto_perfil  │                   │
│    rol ENUM     │                   │
│    pais         │                   │
│    idioma       │                   │
│    tema ENUM    │                   │
│    paleta JSON  │                   │
│    estado ENUM  │                   │
│    verificado   │                   │
│    created_at   │                   │
│    updated_at   │                   │
└────────┬────────┘                   │
         │ 1                          │
         │                            │
         │ *                          │
┌────────▼────────┐                   │
│     roles       │                   │
├─────────────────┤                   │
│ PK id           │                   │
│ FK usuario_id   │───────────────────┘
│    tipo_rol     │
│    activo       │
│    created_at   │
└─────────────────┘

         │ 1
         │
         │ 1
┌────────▼────────────────────────────────────────────┐
│                    planes                            │
├─────────────────────────────────────────────────────┤
│ PK id                                                │
│    nombre VARCHAR(100)                               │
│    precio_mensual DECIMAL(10,2)                      │
│    precio_anual DECIMAL(10,2)                        │
│    max_estilistas INT                                │
│    max_sucursales INT                                │
│    comision_plataforma DECIMAL(5,2)                  │
│    features JSON                                     │
│    orden INT (para mostrar)                          │
│    destacado BOOLEAN                                 │
│    activo BOOLEAN                                    │
│    created_at                                        │
└─────────────┬───────────────────────────────────────┘
              │ 1
              │
              │ *
┌─────────────▼──────────────────────────────────────┐
│                  sucursales                         │
├────────────────────────────────────────────────────┤
│ PK id                                               │
│ FK admin_id → usuarios(id)                          │
│ FK plan_id → planes(id)                             │
│    nombre VARCHAR(255)                              │
│    slug VARCHAR(255) UNIQUE                         │
│    descripcion TEXT                                 │
│    direccion TEXT                                   │
│    latitud DECIMAL(10,8)                            │
│    longitud DECIMAL(11,8)                           │
│    telefono VARCHAR(20)                             │
│    whatsapp VARCHAR(20)                             │
│    email VARCHAR(255)                               │
│    logo VARCHAR(500)                                │
│    fotos JSON                                       │
│    horario JSON                                     │
│    dias_cerrado JSON                                │
│    zona_horaria VARCHAR(50)                         │
│    moneda VARCHAR(3)                                │
│    idiomas_soportados JSON                          │
│    estado ENUM(pendiente, aprobada, suspendida)     │
│    rating_promedio DECIMAL(3,2)                     │
│    total_resenas INT DEFAULT 0                      │
│    verificada BOOLEAN DEFAULT FALSE                 │
│    fecha_aprobacion DATETIME                        │
│    fecha_suspension DATETIME                        │
│    razon_suspension TEXT                            │
│    configuracion JSON                               │
│    created_at                                       │
│    updated_at                                       │
└────────────┬───────────────────────────────────────┘
             │ 1
             │
             │ *
┌────────────▼──────────────────────────────────────┐
│                  servicios                         │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK sucursal_id → sucursales(id) ON DELETE CASCADE  │
│ FK categoria_id → categorias_servicios(id)         │
│    nombre VARCHAR(255)                             │
│    descripcion TEXT                                │
│    precio DECIMAL(10,2)                            │
│    precio_descuento DECIMAL(10,2)                  │
│    duracion_minutos INT                            │
│    tiempo_preparacion INT DEFAULT 0                │
│    tiempo_limpieza INT DEFAULT 0                   │
│    foto VARCHAR(500)                               │
│    requiere_deposito BOOLEAN DEFAULT FALSE         │
│    monto_deposito DECIMAL(10,2)                    │
│    orden INT                                       │
│    visible BOOLEAN DEFAULT TRUE                    │
│    activo BOOLEAN DEFAULT TRUE                     │
│    tags JSON                                       │
│    created_at                                      │
│    updated_at                                      │
└────────────┬──────────────────────────────────────┘
             │
             │ *:*
             ▼
┌───────────────────────────────────────────────────┐
│           servicios_estilistas                     │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK servicio_id → servicios(id)                     │
│ FK estilista_id → estilistas(id)                   │
│    precio_personalizado DECIMAL(10,2)              │
│    duracion_personalizada INT                      │
│    activo BOOLEAN DEFAULT TRUE                     │
│    created_at                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│              categorias_servicios                  │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│    nombre VARCHAR(100)                             │
│    slug VARCHAR(100) UNIQUE                        │
│    descripcion TEXT                                │
│    icono VARCHAR(50)                               │
│    color VARCHAR(7)                                │
│    orden INT                                       │
│    activo BOOLEAN DEFAULT TRUE                     │
└───────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│                   estilistas                        │
├────────────────────────────────────────────────────┤
│ PK id                                               │
│ FK usuario_id → usuarios(id) ON DELETE CASCADE      │
│ FK sucursal_id → sucursales(id) ON DELETE CASCADE   │
│    bio TEXT                                         │
│    especialidad VARCHAR(255)                        │
│    anos_experiencia INT                             │
│    certificaciones JSON                             │
│    comision_porcentaje DECIMAL(5,2) DEFAULT 70.00   │
│    propinas_habilitadas BOOLEAN DEFAULT TRUE        │
│    rating_promedio DECIMAL(3,2) DEFAULT 0           │
│    total_resenas INT DEFAULT 0                      │
│    total_servicios INT DEFAULT 0                    │
│    activo BOOLEAN DEFAULT TRUE                      │
│    fecha_inicio DATE                                │
│    fecha_fin DATE                                   │
│    created_at                                       │
│    updated_at                                       │
└────────────┬───────────────────────────────────────┘
             │ 1
             │
             │ *
┌────────────▼──────────────────────────────────────┐
│          disponibilidad_estilistas                 │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK estilista_id → estilistas(id) ON DELETE CASCADE │
│    dia_semana ENUM(lun, mar, mie, jue, vie, sab, dom)│
│    hora_inicio TIME                                │
│    hora_fin TIME                                   │
│    duracion_slot INT DEFAULT 30                    │
│    activo BOOLEAN DEFAULT TRUE                     │
│    created_at                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│             bloqueos_horario                       │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK estilista_id → estilistas(id) ON DELETE CASCADE │
│    fecha_inicio DATETIME                           │
│    fecha_fin DATETIME                              │
│    tipo ENUM(vacaciones, personal, enfermedad)     │
│    motivo VARCHAR(255)                             │
│    todo_el_dia BOOLEAN DEFAULT TRUE                │
│    recurrente BOOLEAN DEFAULT FALSE                │
│    created_at                                      │
└───────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│                    clientes                         │
├────────────────────────────────────────────────────┤
│ PK id                                               │
│ FK usuario_id → usuarios(id) ON DELETE CASCADE      │
│    ubicacion_lat DECIMAL(10,8)                      │
│    ubicacion_lng DECIMAL(11,8)                      │
│    direccion_guardada TEXT                          │
│    preferencias JSON                                │
│    fecha_nacimiento DATE                            │
│    genero ENUM(m, f, otro, prefiero_no_decir)      │
│    total_citas INT DEFAULT 0                        │
│    total_gastado DECIMAL(10,2) DEFAULT 0            │
│    created_at                                       │
│    updated_at                                       │
└────────────┬───────────────────────────────────────┘
             │ 1
             │
             │ *
┌────────────▼──────────────────────────────────────┐
│                     citas                          │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK cliente_id → clientes(id)                       │
│ FK estilista_id → estilistas(id)                   │
│ FK servicio_id → servicios(id)                     │
│ FK sucursal_id → sucursales(id)                    │
│    codigo_cita VARCHAR(20) UNIQUE                  │
│    fecha DATE                                      │
│    hora_inicio TIME                                │
│    hora_fin TIME                                   │
│    duracion_total INT (calculado)                  │
│    estado ENUM(pendiente, confirmada, en_progreso, │
│               completada, cancelada, no_asistio)   │
│    precio_servicio DECIMAL(10,2)                   │
│    precio_descuento DECIMAL(10,2) DEFAULT 0        │
│    precio_total DECIMAL(10,2)                      │
│    propina DECIMAL(10,2) DEFAULT 0                 │
│    notas_cliente TEXT                              │
│    notas_internas TEXT                             │
│    requiere_confirmacion BOOLEAN DEFAULT TRUE      │
│    confirmada_en DATETIME                          │
│    cancelada_en DATETIME                           │
│    cancelada_por ENUM(cliente, estilista, admin, sistema)│
│    razon_cancelacion TEXT                          │
│    tiempo_cancelacion INT (minutos antes)          │
│    completada_en DATETIME                          │
│    recordatorio_enviado BOOLEAN DEFAULT FALSE      │
│    recordatorio_24h DATETIME                       │
│    recordatorio_1h DATETIME                        │
│    created_at                                      │
│    updated_at                                      │
└────────────┬───────────────────────────────────────┘
             │ 1
             │
             │ 0..1
┌────────────▼──────────────────────────────────────┐
│                     pagos                          │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK cita_id → citas(id) ON DELETE CASCADE UNIQUE    │
│ FK cliente_id → clientes(id)                       │
│    codigo_transaccion VARCHAR(100) UNIQUE          │
│    monto_subtotal DECIMAL(10,2)                    │
│    monto_propina DECIMAL(10,2) DEFAULT 0           │
│    monto_descuento DECIMAL(10,2) DEFAULT 0         │
│    monto_total DECIMAL(10,2)                       │
│    metodo_pago ENUM(tarjeta, efectivo, transferencia,│
│                     wallet, crypto)                │
│    proveedor_pago ENUM(stripe, paypal, efectivo)   │
│    stripe_payment_intent_id VARCHAR(255)           │
│    stripe_charge_id VARCHAR(255)                   │
│    paypal_order_id VARCHAR(255)                    │
│    estado ENUM(pendiente, procesando, completado,  │
│               fallido, reembolsado, parcial_reembolso)│
│    comision_plataforma DECIMAL(10,2)               │
│    comision_porcentaje DECIMAL(5,2)                │
│    monto_estilista DECIMAL(10,2)                   │
│    monto_sucursal DECIMAL(10,2)                    │
│    fecha_pago DATETIME                             │
│    fecha_liberacion DATETIME                       │
│    reembolso_monto DECIMAL(10,2)                   │
│    reembolso_fecha DATETIME                        │
│    reembolso_razon TEXT                            │
│    metadata JSON                                   │
│    created_at                                      │
│    updated_at                                      │
└────────────┬───────────────────────────────────────┘
             │ 1
             │
             │ 0..1
┌────────────▼──────────────────────────────────────┐
│                   facturas                         │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK pago_id → pagos(id) ON DELETE CASCADE UNIQUE    │
│ FK sucursal_id → sucursales(id)                    │
│    numero_factura VARCHAR(50) UNIQUE               │
│    tipo_factura ENUM(electronica, manual)          │
│    hacienda_clave VARCHAR(100) UNIQUE              │
│    hacienda_consecutivo VARCHAR(50)                │
│    xml_contenido LONGTEXT                          │
│    xml_firmado LONGTEXT                            │
│    pdf_url VARCHAR(500)                            │
│    estado_hacienda ENUM(pendiente, enviada,        │
│                         aceptada, rechazada)       │
│    mensaje_hacienda TEXT                           │
│    codigo_respuesta VARCHAR(20)                    │
│    fecha_emision DATETIME                          │
│    fecha_envio_hacienda DATETIME                   │
│    fecha_respuesta_hacienda DATETIME               │
│    intentos_envio INT DEFAULT 0                    │
│    created_at                                      │
│    updated_at                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│                     posts                          │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK estilista_id → estilistas(id) ON DELETE CASCADE │
│ FK sucursal_id → sucursales(id)                    │
│    imagen_url VARCHAR(500)                         │
│    thumbnail_url VARCHAR(500)                      │
│    descripcion TEXT                                │
│    hashtags JSON                                   │
│    likes_count INT DEFAULT 0                       │
│    comentarios_count INT DEFAULT 0                 │
│    compartidos_count INT DEFAULT 0                 │
│    vistas_count INT DEFAULT 0                      │
│    visible BOOLEAN DEFAULT TRUE                    │
│    destacado BOOLEAN DEFAULT FALSE                 │
│    reportado BOOLEAN DEFAULT FALSE                 │
│    fecha_publicacion DATETIME                      │
│    created_at                                      │
│    updated_at                                      │
└────────────┬──────────────────────────────────────┘
             │ 1
             │
             │ *
┌────────────▼──────────────────────────────────────┐
│                  likes_posts                       │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK post_id → posts(id) ON DELETE CASCADE           │
│ FK usuario_id → usuarios(id) ON DELETE CASCADE     │
│    created_at                                      │
│    UNIQUE(post_id, usuario_id)                     │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│               comentarios_posts                    │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK post_id → posts(id) ON DELETE CASCADE           │
│ FK usuario_id → usuarios(id) ON DELETE CASCADE     │
│ FK parent_id → comentarios_posts(id) (respuestas)  │
│    contenido TEXT                                  │
│    editado BOOLEAN DEFAULT FALSE                   │
│    reportado BOOLEAN DEFAULT FALSE                 │
│    created_at                                      │
│    updated_at                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│                    resenas                         │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK cita_id → citas(id) ON DELETE CASCADE UNIQUE    │
│ FK cliente_id → clientes(id)                       │
│ FK estilista_id → estilistas(id)                   │
│ FK sucursal_id → sucursales(id)                    │
│    calificacion INT CHECK (1 <= calificacion <= 5) │
│    calificacion_puntualidad INT                    │
│    calificacion_calidad INT                        │
│    calificacion_amabilidad INT                     │
│    calificacion_limpieza INT                       │
│    comentario TEXT                                 │
│    respuesta_estilista TEXT                        │
│    respuesta_fecha DATETIME                        │
│    fotos JSON                                      │
│    visible BOOLEAN DEFAULT TRUE                    │
│    verificada BOOLEAN DEFAULT TRUE                 │
│    reportada BOOLEAN DEFAULT FALSE                 │
│    likes_count INT DEFAULT 0                       │
│    util_count INT DEFAULT 0                        │
│    created_at                                      │
│    updated_at                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│              mensajes_chat                         │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK conversacion_id → conversaciones(id)            │
│ FK remitente_id → usuarios(id)                     │
│    mensaje TEXT                                    │
│    tipo ENUM(texto, imagen, archivo, ubicacion)    │
│    metadata JSON                                   │
│    leido BOOLEAN DEFAULT FALSE                     │
│    leido_en DATETIME                               │
│    editado BOOLEAN DEFAULT FALSE                   │
│    eliminado BOOLEAN DEFAULT FALSE                 │
│    created_at                                      │
│    updated_at                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│                conversaciones                      │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK usuario1_id → usuarios(id)                      │
│ FK usuario2_id → usuarios(id)                      │
│    ultimo_mensaje_id → mensajes_chat(id)           │
│    ultimo_mensaje_fecha DATETIME                   │
│    no_leidos_usuario1 INT DEFAULT 0                │
│    no_leidos_usuario2 INT DEFAULT 0                │
│    activa BOOLEAN DEFAULT TRUE                     │
│    created_at                                      │
│    updated_at                                      │
│    UNIQUE(usuario1_id, usuario2_id)                │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│                notificaciones                      │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK usuario_id → usuarios(id) ON DELETE CASCADE     │
│ FK relacionado_id (genérico: cita, pago, etc)     │
│    tipo ENUM(cita, pago, mensaje, sistema,         │
│             promocion, resena)                     │
│    titulo VARCHAR(255)                             │
│    mensaje TEXT                                    │
│    icono VARCHAR(100)                              │
│    url_destino VARCHAR(500)                        │
│    metadata JSON                                   │
│    leida BOOLEAN DEFAULT FALSE                     │
│    leida_en DATETIME                               │
│    push_enviado BOOLEAN DEFAULT FALSE              │
│    email_enviado BOOLEAN DEFAULT FALSE             │
│    sms_enviado BOOLEAN DEFAULT FALSE               │
│    created_at                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│                   favoritos                        │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK cliente_id → clientes(id) ON DELETE CASCADE     │
│ FK estilista_id → estilistas(id) ON DELETE CASCADE │
│    notas TEXT                                      │
│    created_at                                      │
│    UNIQUE(cliente_id, estilista_id)                │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│              metodos_pago_guardados                │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK usuario_id → usuarios(id) ON DELETE CASCADE     │
│    tipo ENUM(tarjeta, paypal, wallet)              │
│    proveedor VARCHAR(50)                           │
│    token_pago VARCHAR(255) ENCRYPTED               │
│    ultimos_4_digitos VARCHAR(4)                    │
│    marca_tarjeta VARCHAR(50)                       │
│    fecha_expiracion VARCHAR(7)                     │
│    nombre_titular VARCHAR(255)                     │
│    es_predeterminado BOOLEAN DEFAULT FALSE         │
│    activo BOOLEAN DEFAULT TRUE                     │
│    created_at                                      │
│    updated_at                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│                 promociones                        │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK sucursal_id → sucursales(id)                    │
│    codigo VARCHAR(50) UNIQUE                       │
│    nombre VARCHAR(255)                             │
│    descripcion TEXT                                │
│    tipo ENUM(porcentaje, monto_fijo, servicio_gratis)│
│    valor DECIMAL(10,2)                             │
│    minimo_compra DECIMAL(10,2)                     │
│    maximo_descuento DECIMAL(10,2)                  │
│    fecha_inicio DATE                               │
│    fecha_fin DATE                                  │
│    usos_maximos INT                                │
│    usos_actuales INT DEFAULT 0                     │
│    usos_por_usuario INT DEFAULT 1                  │
│    servicios_aplicables JSON                       │
│    dias_semana_aplicables JSON                     │
│    activa BOOLEAN DEFAULT TRUE                     │
│    created_at                                      │
│    updated_at                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│              suscripciones_planes                  │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK sucursal_id → sucursales(id)                    │
│ FK plan_id → planes(id)                            │
│    estado ENUM(activa, cancelada, suspendida,      │
│               vencida, prueba)                     │
│    fecha_inicio DATE                               │
│    fecha_fin DATE                                  │
│    fecha_renovacion DATE                           │
│    fecha_cancelacion DATE                          │
│    razon_cancelacion TEXT                          │
│    auto_renovar BOOLEAN DEFAULT TRUE               │
│    periodo ENUM(mensual, anual)                    │
│    precio_pagado DECIMAL(10,2)                     │
│    metodo_pago VARCHAR(50)                         │
│    stripe_subscription_id VARCHAR(255)             │
│    en_prueba BOOLEAN DEFAULT FALSE                 │
│    dias_prueba INT DEFAULT 0                       │
│    created_at                                      │
│    updated_at                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│                auditoria_logs                      │
├───────────────────────────────────────────────────┤
│ PK id                                              │
│ FK usuario_id → usuarios(id)                       │
│    accion VARCHAR(100)                             │
│    tabla VARCHAR(100)                              │
│    registro_id INT                                 │
│    datos_anteriores JSON                           │
│    datos_nuevos JSON                               │
│    ip_address VARCHAR(45)                          │
│    user_agent TEXT                                 │
│    created_at                                      │
└───────────────────────────────────────────────────┘
```

---

## 2. ESQUEMAS SQL DETALLADOS {#sql}

### 2.1 Tabla: usuarios (Core)

```sql
CREATE TABLE usuarios (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255),
    telefono VARCHAR(20),
    telefono_verificado BOOLEAN DEFAULT FALSE,
    foto_perfil VARCHAR(500),
    fecha_nacimiento DATE,
    genero ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir'),
    
    -- Configuración regional
    pais VARCHAR(2) DEFAULT 'CR' COMMENT 'ISO 3166-1 alpha-2',
    codigo_pais VARCHAR(5) DEFAULT '+506',
    idioma VARCHAR(5) DEFAULT 'es' COMMENT 'ISO 639-1',
    zona_horaria VARCHAR(50) DEFAULT 'America/Costa_Rica',
    moneda VARCHAR(3) DEFAULT 'CRC' COMMENT 'ISO 4217',
    
    -- Personalización
    tema ENUM('claro', 'oscuro', 'auto') DEFAULT 'auto',
    paleta_colores JSON COMMENT '{"primary": "#d4af37", "secondary": "#1a1a1a"}',
    preferencias_notificaciones JSON,
    
    -- Estado y seguridad
    estado ENUM('activo', 'suspendido', 'eliminado', 'pendiente_verificacion') DEFAULT 'pendiente_verificacion',
    email_verificado BOOLEAN DEFAULT FALSE,
    email_verificado_en DATETIME,
    token_verificacion VARCHAR(100),
    token_reset_password VARCHAR(100),
    token_reset_expira DATETIME,
    intentos_login_fallidos INT DEFAULT 0,
    bloqueado_hasta DATETIME,
    
    -- OAuth / Social Login
    provider VARCHAR(50) COMMENT 'google, facebook, apple',
    provider_id VARCHAR(255),
    
    -- Metadata
    ultimo_acceso DATETIME,
    ip_ultimo_acceso VARCHAR(45),
    dispositivo_info JSON,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME COMMENT 'Soft delete',
    
    -- Índices
    INDEX idx_email (email),
    INDEX idx_telefono (telefono),
    INDEX idx_estado (estado),
    INDEX idx_pais (pais),
    INDEX idx_provider (provider, provider_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.2 Tabla: citas (Core Business Logic)

```sql
CREATE TABLE citas (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    codigo_cita VARCHAR(20) UNIQUE NOT NULL COMMENT 'Ej: SLN-20250515-A3B9',
    
    -- Relaciones
    cliente_id INT UNSIGNED NOT NULL,
    estilista_id INT UNSIGNED NOT NULL,
    servicio_id INT UNSIGNED NOT NULL,
    sucursal_id INT UNSIGNED NOT NULL,
    promocion_id INT UNSIGNED,
    
    -- Fecha y hora
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_minutos INT GENERATED ALWAYS AS (
        TIMESTAMPDIFF(MINUTE, 
            CONCAT(fecha, ' ', hora_inicio),
            CONCAT(fecha, ' ', hora_fin)
        )
    ) STORED,
    
    -- Estado del flujo
    estado ENUM(
        'pendiente',           -- Recién creada, esperando confirmación
        'confirmada',          -- Confirmada por estilista
        'recordatorio_enviado',-- Recordatorio enviado
        'en_progreso',         -- Cliente llegó, servicio iniciado
        'completada',          -- Servicio finalizado
        'cancelada',           -- Cancelada por alguna parte
        'no_asistio'           -- Cliente no llegó (no-show)
    ) DEFAULT 'pendiente',
    
    -- Precios
    precio_servicio DECIMAL(10,2) NOT NULL,
    precio_descuento DECIMAL(10,2) DEFAULT 0.00,
    monto_descuento DECIMAL(10,2) DEFAULT 0.00,
    propina DECIMAL(10,2) DEFAULT 0.00,
    precio_total DECIMAL(10,2) GENERATED ALWAYS AS (
        precio_servicio - monto_descuento + propina
    ) STORED,
    
    -- Notas
    notas_cliente TEXT COMMENT 'Visible para estilista',
    notas_internas TEXT COMMENT 'Solo para admin',
    alergias_especiales TEXT,
    
    -- Control de confirmación
    requiere_confirmacion BOOLEAN DEFAULT TRUE,
    confirmada_por ENUM('cliente', 'estilista', 'admin', 'auto') NULL,
    confirmada_en DATETIME,
    
    -- Control de cancelación
    cancelable_hasta DATETIME COMMENT 'Calculado: fecha_cita - políticas cancelación',
    cancelada_en DATETIME,
    cancelada_por ENUM('cliente', 'estilista', 'admin', 'sistema'),
    razon_cancelacion TEXT,
    penalizacion_cancelacion DECIMAL(10,2) DEFAULT 0.00,
    
    -- Completamiento
    completada_en DATETIME,
    calificacion_servicio INT CHECK (calificacion_servicio BETWEEN 1 AND 5),
    
    -- Recordatorios
    recordatorio_24h_enviado BOOLEAN DEFAULT FALSE,
    recordatorio_24h_fecha DATETIME,
    recordatorio_1h_enviado BOOLEAN DEFAULT FALSE,
    recordatorio_1h_fecha DATETIME,
    recordatorio_llegada_enviado BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    origen ENUM('web', 'mobile_app', 'llamada_telefonica', 'walk_in') DEFAULT 'web',
    dispositivo VARCHAR(50),
    navegador VARCHAR(50),
    ip_creacion VARCHAR(45),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (estilista_id) REFERENCES estilistas(id) ON DELETE RESTRICT,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE RESTRICT,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT,
    FOREIGN KEY (promocion_id) REFERENCES promociones(id) ON DELETE SET NULL,
    
    -- Índices para queries comunes
    INDEX idx_codigo (codigo_cita),
    INDEX idx_cliente (cliente_id),
    INDEX idx_estilista_fecha (estilista_id, fecha, estado),
    INDEX idx_sucursal_fecha (sucursal_id, fecha),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha),
    INDEX idx_fecha_hora (fecha, hora_inicio),
    INDEX idx_created_at (created_at),
    
    -- Índice compuesto para búsquedas complejas
    INDEX idx_busqueda_compleja (sucursal_id, estilista_id, fecha, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.3 Tabla: pagos (Financial Core)

```sql
CREATE TABLE pagos (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    codigo_transaccion VARCHAR(100) UNIQUE NOT NULL,
    
    -- Relaciones
    cita_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT 'Una cita = un pago',
    cliente_id INT UNSIGNED NOT NULL,
    sucursal_id INT UNSIGNED NOT NULL,
    
    -- Montos
    monto_subtotal DECIMAL(10,2) NOT NULL,
    monto_propina DECIMAL(10,2) DEFAULT 0.00,
    monto_descuento DECIMAL(10,2) DEFAULT 0.00,
    monto_impuesto DECIMAL(10,2) DEFAULT 0.00,
    monto_total DECIMAL(10,2) NOT NULL,
    
    -- Método de pago
    metodo_pago ENUM(
        'tarjeta_credito',
        'tarjeta_debito',
        'efectivo',
        'transferencia_bancaria',
        'paypal',
        'wallet_digital',
        'criptomoneda'
    ) NOT NULL,
    
    -- Proveedor
    proveedor_pago ENUM('stripe', 'paypal', 'manual', 'otro') NOT NULL,
    
    -- IDs externos (payment providers)
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    paypal_order_id VARCHAR(255),
    paypal_capture_id VARCHAR(255),
    
    -- Estado del pago
    estado ENUM(
        'pendiente',           -- Iniciado, no procesado
        'procesando',          -- En proceso con provider
        'completado',          -- Pago exitoso
        'fallido',             -- Falló el cargo
        'reembolsado',         -- Reembolso total
        'parcialmente_reembolsado', -- Reembolso parcial
        'disputado',           -- Cliente disputó el cargo
        'cancelado'            -- Cancelado antes de procesar
    ) DEFAULT 'pendiente',
    
    -- Comisiones (Business Model)
    comision_plataforma DECIMAL(10,2) NOT NULL,
    comision_porcentaje DECIMAL(5,2) NOT NULL COMMENT 'Del plan de la sucursal',
    monto_estilista DECIMAL(10,2) NOT NULL,
    monto_sucursal DECIMAL(10,2) NOT NULL,
    
    -- Fechas de pago
    fecha_pago DATETIME,
    fecha_liberacion DATETIME COMMENT 'Cuando se libera dinero a sucursal',
    
    -- Reembolsos
    reembolso_monto DECIMAL(10,2),
    reembolso_fecha DATETIME,
    reembolso_razon TEXT,
    reembolso_procesado_por INT UNSIGNED COMMENT 'FK usuarios(id)',
    
    -- Facturación
    requiere_factura BOOLEAN DEFAULT TRUE,
    factura_generada BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSON COMMENT 'Datos adicionales del provider, webhooks, etc',
    ip_cliente VARCHAR(45),
    navegador VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_codigo (codigo_transaccion),
    INDEX idx_cita (cita_id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_sucursal_fecha (sucursal_id, fecha_pago),
    INDEX idx_estado (estado),
    INDEX idx_proveedor (proveedor_pago, estado),
    INDEX idx_stripe_payment (stripe_payment_intent_id),
    INDEX idx_fecha_pago (fecha_pago),
    INDEX idx_fecha_creacion (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. ESTRATEGIA DE ESCALABILIDAD MULTI-PAÍS {#escalabilidad}

### 3.1 Enfoque Híbrido Recomendado

```
┌─────────────────────────────────────────────────────────────┐
│            ARQUITECTURA MULTI-PAÍS (Híbrida)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  NIVEL 1: Base de datos GLOBAL (Master)                     │
│  ├─ Usuarios (todos los países)                             │
│  ├─ Planes y configuraciones globales                       │
│  ├─ Super Admin data                                        │
│  └─ Métricas consolidadas                                   │
│                                                              │
│  NIVEL 2: Bases de datos POR REGIÓN (Shards)               │
│  ├─ salon_latam (Costa Rica, Nicaragua, etc)               │
│  │   ├─ Sucursales                                          │
│  │   ├─ Citas                                               │
│  │   ├─ Pagos                                               │
│  │   └─ Facturas                                            │
│  │                                                           │
│  ├─ salon_eu (España, Francia, etc)                         │
│  └─ salon_na (USA, Canadá, etc)                             │
│                                                              │
│  NIVEL 3: Cache distribuido (Redis Cluster)                 │
│  └─ Por región geográfica                                   │
│                                                              │
│  ROUTING LAYER:                                             │
│  ├─ Detecta país del usuario                                │
│  ├─ Rutea a la DB correcta                                  │
│  └─ Fallback a global si necesario                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Modificaciones de Esquema para Multi-País

```sql
-- Agregar a tablas relevantes:

ALTER TABLE sucursales 
ADD COLUMN region VARCHAR(20) DEFAULT 'latam',
ADD COLUMN pais VARCHAR(2) NOT NULL,
ADD COLUMN moneda VARCHAR(3) NOT NULL DEFAULT 'USD',
ADD COLUMN zona_horaria VARCHAR(50) NOT NULL,
ADD COLUMN regulacion_local JSON COMMENT 'Reglas específicas del país',
ADD INDEX idx_region_pais (region, pais);

ALTER TABLE servicios
ADD COLUMN precios_multi_moneda JSON COMMENT '{"CRC": 10000, "USD": 20, "MXN": 380}';

ALTER TABLE citas
ADD COLUMN pais VARCHAR(2) GENERATED ALWAYS AS (
    (SELECT pais FROM sucursales WHERE id = sucursal_id)
) STORED,
ADD INDEX idx_pais_fecha (pais, fecha);

-- Tabla de conversión de monedas (actualizada diariamente)
CREATE TABLE tipos_cambio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    moneda_origen VARCHAR(3) NOT NULL,
    moneda_destino VARCHAR(3) NOT NULL,
    tasa_cambio DECIMAL(15,6) NOT NULL,
    fecha_actualizacion DATETIME NOT NULL,
    fuente VARCHAR(50) DEFAULT 'API Exchange Rate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_conversion (moneda_origen, moneda_destino, fecha_actualizacion),
    INDEX idx_fecha (fecha_actualizacion)
);

-- Configuración por país
CREATE TABLE configuracion_pais (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pais VARCHAR(2) UNIQUE NOT NULL,
    nombre_pais VARCHAR(100) NOT NULL,
    moneda VARCHAR(3) NOT NULL,
    codigo_telefono VARCHAR(5) NOT NULL,
    formato_fecha VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    formato_hora VARCHAR(20) DEFAULT 'HH:mm',
    idiomas_disponibles JSON,
    regulaciones JSON COMMENT 'Ej: requiere_factura_electronica, impuestos',
    proveedores_pago JSON COMMENT 'Stripe, PayPal habilitados',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. ÍNDICES Y OPTIMIZACIÓN {#optimizacion}

### 4.1 Índices Compuestos Estratégicos

```sql
-- Para búsqueda de disponibilidad de estilistas
CREATE INDEX idx_disponibilidad_busqueda 
ON citas (estilista_id, fecha, hora_inicio, estado)
WHERE estado IN ('confirmada', 'en_progreso');

-- Para dashboard de sucursal
CREATE INDEX idx_sucursal_metricas
ON citas (sucursal_id, fecha, estado, precio_total);

-- Para reportes financieros
CREATE INDEX idx_pagos_reportes
ON pagos (sucursal_id, fecha_pago, estado, monto_total);

-- Para búsqueda de estilistas por ubicación
CREATE SPATIAL INDEX idx_sucursal_ubicacion
ON sucursales (ubicacion); -- Requiere campo tipo POINT

-- Para notificaciones no leídas
CREATE INDEX idx_notif_usuario_no_leidas
ON notificaciones (usuario_id, leida, created_at)
WHERE leida = FALSE;

-- Para mensajes de chat
CREATE INDEX idx_chat_conversacion
ON mensajes_chat (conversacion_id, created_at DESC);
```

### 4.2 Particionamiento de Tablas

```sql
-- Particionar tabla de citas por fecha (mensual)
ALTER TABLE citas
PARTITION BY RANGE (YEAR(fecha) * 100 + MONTH(fecha)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    -- ... crear particiones automáticamente
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Particionar logs de auditoría por fecha
ALTER TABLE auditoria_logs
PARTITION BY RANGE (TO_DAYS(created_at)) (
    PARTITION p_old VALUES LESS THAN (TO_DAYS('2025-01-01')),
    PARTITION p_202501 VALUES LESS THAN (TO_DAYS('2025-02-01')),
    -- ... etc
);
```

---

## 5. TRIGGERS Y PROCEDIMIENTOS ALMACENADOS {#triggers}

### 5.1 Triggers Importantes

```sql
-- Actualizar rating promedio de estilista al crear reseña
DELIMITER $$
CREATE TRIGGER after_resena_insert
AFTER INSERT ON resenas
FOR EACH ROW
BEGIN
    UPDATE estilistas
    SET rating_promedio = (
        SELECT AVG(calificacion)
        FROM resenas
        WHERE estilista_id = NEW.estilista_id AND visible = TRUE
    ),
    total_resenas = total_resenas + 1,
    updated_at = NOW()
    WHERE id = NEW.estilista_id;
    
    UPDATE sucursales
    SET rating_promedio = (
        SELECT AVG(calificacion)
        FROM resenas
        WHERE sucursal_id = NEW.sucursal_id AND visible = TRUE
    ),
    total_resenas = total_resenas + 1
    WHERE id = NEW.sucursal_id;
END$$

-- Generar código de cita automáticamente
DELIMITER $$
CREATE TRIGGER before_cita_insert
BEFORE INSERT ON citas
FOR EACH ROW
BEGIN
    DECLARE codigo VARCHAR(20);
    DECLARE fecha_format VARCHAR(8);
    DECLARE random_suffix VARCHAR(4);
    
    SET fecha_format = DATE_FORMAT(NEW.fecha, '%Y%m%d');
    SET random_suffix = UPPER(SUBSTRING(MD5(RAND()), 1, 4));
    SET codigo = CONCAT('SLN-', fecha_format, '-', random_suffix);
    
    -- Verificar unicidad
    WHILE EXISTS(SELECT 1 FROM citas WHERE codigo_cita = codigo) DO
        SET random_suffix = UPPER(SUBSTRING(MD5(RAND()), 1, 4));
        SET codigo = CONCAT('SLN-', fecha_format, '-', random_suffix);
    END WHILE;
    
    SET NEW.codigo_cita = codigo;
END$$

-- Actualizar contador de likes en posts
DELIMITER $$
CREATE TRIGGER after_like_post
AFTER INSERT ON likes_posts
FOR EACH ROW
BEGIN
    UPDATE posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
END$$

DELIMITER $$
CREATE TRIGGER after_unlike_post
AFTER DELETE ON likes_posts
FOR EACH ROW
BEGIN
    UPDATE posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
END$$

-- Log de auditoría automático para cambios sensibles
DELIMITER $$
CREATE TRIGGER audit_usuario_update
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    IF OLD.email != NEW.email OR OLD.estado != NEW.estado THEN
        INSERT INTO auditoria_logs (
            usuario_id,
            accion,
            tabla,
            registro_id,
            datos_anteriores,
            datos_nuevos,
            created_at
        ) VALUES (
            NEW.id,
            'UPDATE',
            'usuarios',
            NEW.id,
            JSON_OBJECT('email', OLD.email, 'estado', OLD.estado),
            JSON_OBJECT('email', NEW.email, 'estado', NEW.estado),
            NOW()
        );
    END IF;
END$$
DELIMITER ;
```

### 5.2 Procedimientos Almacenados Clave

```sql
-- Buscar disponibilidad de estilista
DELIMITER $$
CREATE PROCEDURE buscar_disponibilidad(
    IN p_estilista_id INT,
    IN p_fecha DATE,
    IN p_duracion_minutos INT
)
BEGIN
    -- Obtener horario laboral del día
    SELECT 
        TIME_FORMAT(d.hora_inicio, '%H:%i') as inicio,
        TIME_FORMAT(d.hora_fin, '%H:%i') as fin,
        d.duracion_slot
    FROM disponibilidad_estilistas d
    WHERE d.estilista_id = p_estilista_id
    AND d.dia_semana = DAYNAME(p_fecha)
    AND d.activo = TRUE;
    
    -- Obtener citas existentes
    SELECT 
        TIME_FORMAT(hora_inicio, '%H:%i') as hora_ocupada,
        duracion_minutos
    FROM citas
    WHERE estilista_id = p_estilista_id
    AND fecha = p_fecha
    AND estado IN ('confirmada', 'en_progreso', 'pendiente');
    
    -- Obtener bloqueos
    SELECT 
        TIME_FORMAT(fecha_inicio, '%H:%i') as inicio_bloqueo,
        TIME_FORMAT(fecha_fin, '%H:%i') as fin_bloqueo
    FROM bloqueos_horario
    WHERE estilista_id = p_estilista_id
    AND DATE(fecha_inicio) <= p_fecha
    AND DATE(fecha_fin) >= p_fecha;
END$$

-- Calcular comisiones de un pago
DELIMITER $$
CREATE PROCEDURE calcular_comisiones_pago(
    IN p_cita_id BIGINT,
    IN p_monto_total DECIMAL(10,2),
    OUT p_comision_plataforma DECIMAL(10,2),
    OUT p_monto_estilista DECIMAL(10,2),
    OUT p_monto_sucursal DECIMAL(10,2)
)
BEGIN
    DECLARE v_comision_pct DECIMAL(5,2);
    DECLARE v_comision_estilista_pct DECIMAL(5,2);
    
    -- Obtener porcentaje de comisión del plan
    SELECT 
        pl.comision_plataforma,
        e.comision_porcentaje
    INTO v_comision_pct, v_comision_estilista_pct
    FROM citas c
    JOIN sucursales s ON c.sucursal_id = s.id
    JOIN planes pl ON s.plan_id = pl.id
    JOIN estilistas e ON c.estilista_id = e.id
    WHERE c.id = p_cita_id;
    
    -- Calcular montos
    SET p_comision_plataforma = ROUND(p_monto_total * (v_comision_pct / 100), 2);
    SET p_monto_estilista = ROUND((p_monto_total - p_comision_plataforma) * (v_comision_estilista_pct / 100), 2);
    SET p_monto_sucursal = p_monto_total - p_comision_plataforma - p_monto_estilista;
END$$
DELIMITER ;
```

---

## 6. ESTRATEGIA DE BACKUP Y RECUPERACIÓN {#backup}

```
┌─────────────────────────────────────────────────────────────┐
│                ESTRATEGIA DE BACKUP                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  BACKUPS AUTOMÁTICOS:                                        │
│  ├─ Completo (Full): Diario a las 2:00 AM                   │
│  │   └─ Retención: 30 días                                  │
│  │                                                           │
│  ├─ Incremental: Cada 6 horas                               │
│  │   └─ Retención: 7 días                                   │
│  │                                                           │
│  └─ Transaction Logs: Continuo (cada 15 min)                │
│      └─ Retención: 7 días                                   │
│                                                              │
│  ALMACENAMIENTO:                                             │
│  ├─ Primario: AWS S3 / Google Cloud Storage                 │
│  ├─ Secundario: Backup región diferente                     │
│  └─ Terciario: Backup offline (mensual)                     │
│                                                              │
│  ENCRIPTACIÓN:                                               │
│  └─ AES-256 en reposo y en tránsito                         │
│                                                              │
│  PRUEBAS DE RECUPERACIÓN:                                    │
│  └─ Mensual (restauración completa a DB de prueba)          │
│                                                              │
│  RTO (Recovery Time Objective): 1 hora                       │
│  RPO (Recovery Point Objective): 15 minutos                  │
└─────────────────────────────────────────────────────────────┘
```

### Script de Backup Automatizado

```bash
#!/bin/bash
# backup_database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/salon"
DB_NAME="salon_prod"
S3_BUCKET="s3://salon-backups/mysql"

# Backup completo
mysqldump --single-transaction --routines --triggers \
  --user=$DB_USER --password=$DB_PASS \
  --host=$DB_HOST $DB_NAME | gzip > $BACKUP_DIR/full_$DATE.sql.gz

# Encriptar
openssl enc -aes-256-cbc -salt -in $BACKUP_DIR/full_$DATE.sql.gz \
  -out $BACKUP_DIR/full_$DATE.sql.gz.enc -pass file:/etc/backup_key

# Subir a S3
aws s3 cp $BACKUP_DIR/full_$DATE.sql.gz.enc $S3_BUCKET/

# Limpiar backups antiguos (> 30 días)
find $BACKUP_DIR -name "full_*.sql.gz.enc" -mtime +30 -delete

# Notificar éxito
curl -X POST https://api.salon.com/internal/backup-completed \
  -H "Authorization: Bearer $INTERNAL_TOKEN" \
  -d "{\"date\": \"$DATE\", \"size\": \"$(du -h $BACKUP_DIR/full_$DATE.sql.gz | cut -f1)\"}"
```

---

**Continúa en: 03_SALON_Diseño_UI_UX.md**
