# 📚 SALON - DOCUMENTACIÓN MAESTRA
## Arquitectura Completa del Sistema

---

## 🎯 PROPÓSITO DE ESTA DOCUMENTACIÓN

Este conjunto de documentos constituye la **arquitectura técnica completa** para el desarrollo de **SALON**, una plataforma web progresiva (PWA) global para el sector de belleza y bienestar, inspirada en Uber, Booksy y Fresha.

---

## 📑 ÍNDICE DE DOCUMENTOS

### **DOCUMENTOS PRINCIPALES**

| # | Documento | Descripción | Estado |
|---|-----------|-------------|--------|
| 00 | **MASTER INDEX** (este archivo) | Índice general y guía de uso | ✅ Completo |
| 01 | **Arquitectura General y UML** | Diagramas de casos de uso, clases, secuencia | ✅ Completo |
| 02 | **Base de Datos** | ERD, esquemas SQL, escalabilidad multi-país | ✅ Completo |
| 03 | **Diseño UI/UX** | Design system, componentes, layouts | ✅ Parcial |
| 04 | **Seguridad y Cumplimiento** | JWT, encriptación, GDPR, PCI DSS | ✅ Completo |
| 05 | **Políticas y Fases** | Términos legales, roadmap de desarrollo | ✅ Completo |

---

## 🚀 QUICK START GUIDE

###  Para Desarrolladores

1. **Lee primero:** Documento 01 (Arquitectura General)
2. **Configura entorno:** Instala stack (PHP 8.2+, MySQL 8, Node.js 18+, Redis)
3. **Clona estructura de DB:** Usa los scripts SQL del Documento 02
4. **Implementa autenticación:** Sigue el código del Documento 04
5. **Diseña UI:** Usa el Design System del Documento 03
6. **Sigue sprints:** Cronograma del Documento 05

### 👨‍💼 Para Product Managers

1. **Documento 05:** Fases y roadmap
2. **Documento 01:** Casos de uso por rol
3. **Documento 03:** Flujos de usuario y experiencia
4. **Documento 05:** Políticas legales a validar con Legal

### 🎨 Para Diseñadores

1. **Documento 03:** Design System completo
   - Paleta de colores
   - Tipografía (Roboto)
   - Componentes reutilizables
   - Layouts responsivos
2. **Documento 01:** Flujos de usuario detallados

### 🔐 Para Security/DevOps

1. **Documento 04:** Estrategia de seguridad
2. **Documento 02:** Backup y recuperación
3. **Documento 04:** Cumplimiento legal (GDPR, PCI DSS)

---

## 🏗️ ARQUITECTURA EN RESUMEN

```
┌─────────────────────────────────────────────────────────────┐
│                     SALON - STACK                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FRONTEND (PWA)                                              │
│  ├─ HTML5 + CSS3 (Variables CSS)                            │
│  ├─ JavaScript ES6+ (Vanilla o framework)                   │
│  ├─ Service Worker (Offline support)                        │
│  └─ Responsive Design (360px - 1920px)                      │
│                                                              │
│  BACKEND                                                     │
│  ├─ PHP 8.2+ (API REST)                                     │
│  ├─ Node.js 18+ (WebSocket - Chat/Notif)                   │
│  └─ Python 3.11+ (Integración Hacienda)                    │
│                                                              │
│  BASE DE DATOS                                               │
│  ├─ MySQL 8.0 / PostgreSQL 15 (Relacional)                 │
│  ├─ Firestore (Tiempo real)                                │
│  └─ Redis 7.0 (Cache & Sessions)                            │
│                                                              │
│  INTEGRACIONES                                               │
│  ├─ Stripe (Pagos)                                          │
│  ├─ Google Maps (Ubicación)                                │
│  ├─ Firebase (Push notifications)                           │
│  ├─ Hacienda API (Facturación CR)                          │
│  └─ SendGrid / AWS SES (Emails)                            │
│                                                              │
│  INFRAESTRUCTURA                                             │
│  ├─ AWS / Google Cloud                                      │
│  ├─ CloudFlare (CDN + WAF)                                 │
│  ├─ SSL/TLS 1.3                                            │
│  └─ CI/CD (GitHub Actions)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 CARACTERÍSTICAS PRINCIPALES

### Para CLIENTES
- ✅ Buscar salones y servicios por ubicación
- ✅ Ver perfiles de estilistas con portafolio
- ✅ Reservar citas en tiempo real
- ✅ Pagar online de forma segura
- ✅ Recibir recordatorios automáticos
- ✅ Dejar reseñas y calificaciones
- ✅ Chat directo con estilistas

### Para ESTILISTAS
- ✅ Gestionar agenda y disponibilidad
- ✅ Aceptar/rechazar citas
- ✅ Publicar trabajos (portafolio)
- ✅ Ver ganancias y estadísticas
- ✅ Responder a reseñas
- ✅ Chat con clientes

### Para ADMINISTRADORES DE SUCURSAL
- ✅ Dashboard con KPIs en tiempo real
- ✅ Gestionar equipo de estilistas
- ✅ Configurar servicios y precios
- ✅ Reportes financieros
- ✅ Facturación electrónica (Hacienda)
- ✅ Control de horarios

### Para SUPER ADMIN
- ✅ Dashboard global multi-sucursal
- ✅ Aprobar nuevas sucursales
- ✅ Gestionar planes de suscripción
- ✅ Analytics avanzado
- ✅ Configuración de comisiones
- ✅ Soporte técnico

---

## 🔐 SEGURIDAD

### Capas de Protección

```
1. PERÍMETRO
   └─ WAF, DDoS Protection, Rate Limiting

2. AUTENTICACIÓN
   └─ JWT (RS256), OAuth 2.0, MFA

3. AUTORIZACIÓN
   └─ RBAC, Permisos granulares

4. DATOS
   └─ bcrypt, AES-256-GCM, PCI DSS

5. APLICACIÓN
   └─ Prepared Statements, CSP, CSRF Tokens

6. MONITOREO
   └─ Logs de auditoría, Alertas, Pentesting
```

### Cumplimiento Legal
- ✅ GDPR (Europa)
- ✅ Ley 8968 (Costa Rica)
- ✅ PCI DSS (Pagos)
- ✅ Facturación electrónica (Hacienda)

---

## 📅 ROADMAP DE DESARROLLO

### **Año 1: Lanzamiento (Costa Rica)**

```
FASE 1 (Meses 1-2): Planificación y Diseño
├─ Requisitos y arquitectura
├─ Diseño UX/UI completo
└─ Prototipo navegable

FASE 2 (Meses 3-5): MVP
├─ Autenticación
├─ Catálogo de servicios
├─ Sistema de reservas
├─ Pagos con Stripe
└─ Dashboards básicos

FASE 3 (Meses 6-9): Plataforma Completa
├─ Portafolio y posts
├─ Chat en tiempo real
├─ Reseñas y ratings
├─ Analytics avanzado
├─ Facturación electrónica
└─ PWA completa

FASE 4 (Meses 10-12): Testing y Lanzamiento
├─ QA exhaustivo
├─ Beta privada (10 sucursales)
└─ Lanzamiento público Costa Rica
```

**Objetivo Año 1:** 
- 50 sucursales activas
- $50K MRR (Monthly Recurring Revenue)
- 10,000 usuarios registrados

### **Año 2-3: Expansión Regional**
- Centroamérica (Nicaragua, Honduras, El Salvador, Panamá)
- 500 sucursales
- $500K MRR
- Expansión a México

---

## 💰 MODELO DE NEGOCIO

```
INGRESOS:

1. SUSCRIPCIONES MENSUALES
   ├─ Basic: $29/mes (1 sucursal, 5 estilistas)
   ├─ Premium: $99/mes (3 sucursales, 20 estilistas)
   └─ Enterprise: Custom (ilimitado)

2. COMISIONES POR TRANSACCIÓN
   └─ 7% sobre cada cita completada

3. SERVICIOS ADICIONALES
   ├─ Marketing digital
   ├─ Análisis de datos
   └─ Integraciones personalizadas

PROYECCIÓN AÑO 1:
├─ Suscripciones: $21,000 (50 sucursales x $35 promedio)
├─ Comisiones: $42,000 (7% de $600K en GMV)
└─ Total: $63,000 MRR → $756K ARR
```

---

## 🛠️ INSTALACIÓN Y CONFIGURACIÓN

### Requisitos del Sistema

```bash
# Servidor
- Ubuntu 22.04 LTS o superior
- CPU: 4 cores
- RAM: 8 GB mínimo
- Disco: 100 GB SSD

# Software
- PHP 8.2+
- MySQL 8.0 / PostgreSQL 15
- Node.js 18+
- Redis 7.0
- Nginx / Apache 2.4
- Composer 2.x
- npm 9.x
```

### Instalación Rápida

```bash
# 1. Clonar repositorio
git clone https://github.com/salon/platform.git
cd platform

# 2. Instalar dependencias PHP
composer install

# 3. Instalar dependencias Node.js
npm install

# 4. Configurar variables de entorno
cp .env.example .env
nano .env  # Configurar DB, Stripe, etc

# 5. Generar claves de aplicación
php artisan key:generate
php artisan jwt:secret

# 6. Ejecutar migraciones
php artisan migrate

# 7. Seed de datos iniciales
php artisan db:seed

# 8. Compilar assets
npm run build

# 9. Iniciar servicios
php artisan serve
npm run dev  # WebSocket server
redis-server
```

### Variables de Entorno Clave

```env
# Aplicación
APP_NAME="Salon"
APP_ENV=production
APP_URL=https://salon.com

# Base de Datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=salon
DB_USERNAME=root
DB_PASSWORD=secret

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Stripe
STRIPE_KEY=pk_live_xxx
STRIPE_SECRET=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Firebase
FIREBASE_API_KEY=xxx
FIREBASE_PROJECT_ID=salon-app
FIREBASE_MESSAGING_SENDER_ID=xxx

# Google Maps
GOOGLE_MAPS_API_KEY=xxx

# Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.xxx

# Hacienda API (Costa Rica)
HACIENDA_API_URL=https://api.hacienda.go.cr
HACIENDA_USERNAME=xxx
HACIENDA_PASSWORD=xxx
```

---

## 📚 RECURSOS ADICIONALES

### Documentación Externa
- [Stripe API Docs](https://stripe.com/docs/api)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Google Maps API](https://developers.google.com/maps/documentation)
- [API Hacienda Costa Rica](https://tribunet.hacienda.go.cr/docs/esquemas/)

### Herramientas Recomendadas
- **Diseño:** Figma, Adobe XD
- **Desarrollo:** VS Code, PhpStorm
- **API Testing:** Postman, Insomnia
- **Monitoreo:** Sentry, New Relic
- **Analytics:** Google Analytics, Mixpanel
- **CI/CD:** GitHub Actions, GitLab CI

---

## ❓ PREGUNTAS FRECUENTES

### ¿Cómo escala la base de datos con múltiples países?
**R:** Enfoque híbrido con DB global (usuarios, planes) y DB por región (citas, pagos). Ver Documento 02, Sección 3.

### ¿Qué modelo de permisos se usa?
**R:** RBAC (Role-Based Access Control) con jerarquía de roles. Ver Documento 04.

### ¿Cómo funciona la personalización de colores?
**R:** CSS Variables + JSON en DB del usuario. Ver Documento 03.

### ¿Qué elementos tienen fallback offline en PWA?
**R:** Perfil, citas próximas, historial, mensajes cacheados. Ver Documento 03.

### ¿Cómo se integra con Hacienda de Costa Rica?
**R:** API SOAP/REST para generar XML firmado y enviar facturas. Ver Documento 02 y scripts Python.

---

## 📞 CONTACTO Y SOPORTE

**Equipo de Desarrollo:**
- Email: dev@salon.com
- Slack: #salon-dev
- Jira: salon.atlassian.net

**Documentación Técnica:**
- Wiki: wiki.salon.com
- API Docs: api.salon.com/docs

---

## 📝 NOTAS FINALES

### Estado de la Documentación
- ✅ Arquitectura general completa
- ✅ Base de datos 100% documentada
- ⚠️  UI/UX parcialmente documentado (falta completar componentes)
- ✅ Seguridad y cumplimiento completo
- ✅ Políticas legales listas
- ✅ Roadmap definido

### Próximos Pasos
1. Completar diseño UI/UX en Figma
2. Crear diagramas visuales completos (draw.io)
3. Documentar APIs REST en OpenAPI 3.0
4. Preparar guías de usuario final
5. Crear videos de onboarding


---


*Este es un documento vivo que se actualizará conforme el proyecto evolucione.*

