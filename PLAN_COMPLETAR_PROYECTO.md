# 📋 PLAN COMPLETO - QUÉ FALTA PARA COMPLETAR SALON

**Fecha:** 2025-11-11
**Rama:** claude/salon-critical-phase-1-011CV1CWV1FfeTeutXeK4FTj
**Conformidad Actual:** ~65% ⚠️
**Objetivo:** 100% ✅

---

## ✅ YA COMPLETADO (FASE 1)

### Backend Crítico ✅
- ✅ **JWT RS256 Authentication** - Implementado completo con RSA 4096-bit
- ✅ **RBAC Sistema Completo** - 4 roles, 35+ permisos, middleware
- ✅ **7 Modelos Eloquent Nuevos:**
  - Payment (pagos con Stripe/PayPal)
  - Branch (sucursales multi-tenant)
  - Stylist (estilistas con comisiones)
  - Client (clientes con preferencias)
  - Invoice (facturas electrónicas)
  - Review (reseñas y ratings)
  - AuditLog (auditoría compliance)
- ✅ **5 Controllers Nuevos:**
  - PaymentController
  - BranchController
  - StylistController
  - InvoiceController
  - AuditLogController
- ✅ **8 Migraciones de Base de Datos:**
  - Tabla roles/permissions (RBAC)
  - Renombrar reservations → citas (35 campos completos)
  - Agregar 20+ campos a users
  - 7 tablas nuevas completas
- ✅ **Servicios JWT:**
  - JWTService completo
  - JwtMiddleware
  - RBACMiddleware
  - Token blacklisting con Redis
  - Token refresh rotation

### Frontend Crítico ✅
- ✅ **Tailwind CSS 4.x** - Configurado con tema dark mode
- ✅ **10 Componentes React:**
  - Base: Button, Card
  - Layout: StatusBar, SearchBar, BottomNavigation, FloatingButton
  - Dashboard: StatCard, BookingCard
  - Calendar: Calendar, TimelineBooking
- ✅ **2 Páginas Completas:**
  - Dashboard (stats + bookings)
  - CalendarView (calendario + timeline)
- ✅ **Design System:**
  - Color palette: #0d0d0d (black), #2d2d2d (gray), #f4d03f (yellow)
  - Rounded corners (2xl, 3xl)
  - Shadow effects (float, glow)
  - Animaciones CSS

**Commits:** c4274a0 (backend), 1864ce6 (frontend), 7e0e5d9 (Tailwind fix)

---

## ⏳ PENDIENTE PARA 80% CONFORMIDAD (FASE 2)

### 🔒 Seguridad - ALTA PRIORIDAD

#### 1. Rate Limiting Middleware ⏰ 2-3 horas
**Por qué:** Protección contra fuerza bruta, DDoS
**Especificación:** 100 req/min por IP
**Tareas:**
- [ ] Crear middleware `RateLimitMiddleware.php`
- [ ] Configurar límites en `config/rate-limit.php`
- [ ] Aplicar a rutas de autenticación
- [ ] Aplicar a rutas de API
- [ ] Tests de validación

```php
// Ejemplo
Route::middleware(['throttle:100,1'])->group(function () {
    // API routes
});
```

#### 2. Content Security Policy (CSP) Headers ⏰ 2 horas
**Por qué:** Prevención de XSS
**Tareas:**
- [ ] Crear middleware `CSPMiddleware.php`
- [ ] Configurar políticas CSP
- [ ] Agregar nonces dinámicos para scripts
- [ ] Agregar headers en respuestas

```php
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'unsafe-inline'
```

#### 3. CSRF Protection Mejorado ⏰ 1 hora
**Tareas:**
- [ ] Validar CSRF en todas las rutas POST/PUT/DELETE
- [ ] Agregar excepción para webhooks
- [ ] Documentar uso en frontend

---

### 📊 Base de Datos - ALTA PRIORIDAD

#### 4. Completar Tabla `services` ⏰ 2 horas
**Campos faltantes:**
- [ ] `precio_descuento` (decimal)
- [ ] `monto_deposito` (decimal)
- [ ] `requiere_deposito` (boolean)
- [ ] `tiempo_preparacion` (int minutos)
- [ ] `tiempo_limpieza` (int minutos)
- [ ] `foto` (string URL)
- [ ] `orden` (int para ordenamiento)
- [ ] `visible` (boolean)
- [ ] `tags` (JSON)
- [ ] `categoria_id` (FK)

**Migración:** `2025_11_11_add_missing_fields_to_services_table.php`

#### 5. Sistema de Posts/Portfolio ⏰ 4-6 horas
**Por qué:** Feature principal tipo Instagram
**Tareas:**
- [ ] Crear migración `create_posts_table.php` (20 campos)
- [ ] Crear migración `create_likes_posts_table.php`
- [ ] Crear migración `create_comentarios_posts_table.php`
- [ ] Crear modelo `Post.php` con relaciones
- [ ] Crear modelo `LikePost.php`
- [ ] Crear modelo `ComentarioPost.php`
- [ ] Crear `PostController.php` (CRUD + like/comment)
- [ ] Validaciones y permisos RBAC
- [ ] Tests

**Campos posts:**
```
- id, user_id, sucursal_id
- tipo (foto, video, transformacion)
- titulo, descripcion
- foto_url, foto_thumbnail
- tags (JSON), servicios_usados (JSON)
- likes_count, comentarios_count
- visible, destacado
- timestamps, deleted_at
```

#### 6. Sistema de Conversaciones/Chat ⏰ 6-8 horas
**Por qué:** Feature documentada como core
**Decisión:** Laravel + Pusher (tiempo real) o Firestore
**Tareas:**
- [ ] Crear migración `create_conversaciones_table.php`
- [ ] Crear migración `create_mensajes_chat_table.php`
- [ ] Crear modelo `Conversacion.php`
- [ ] Crear modelo `MensajeChat.php`
- [ ] Crear `ChatController.php`
- [ ] Integrar Pusher para tiempo real
- [ ] Event broadcasting
- [ ] Tests

#### 7. Disponibilidad Estilistas Completa ⏰ 3-4 horas
**Tareas:**
- [ ] Agregar campos a `availabilities`:
  - `duracion_slot` (default 30 min)
  - `activo` (boolean)
- [ ] Crear migración `create_bloqueos_horario_table.php`
- [ ] Crear modelo `BloqueoHorario.php`
- [ ] Actualizar `AvailabilityController.php`
- [ ] Lógica de cálculo de slots disponibles
- [ ] Tests

---

### 🔌 Integraciones Externas - ALTA PRIORIDAD

#### 8. Integración Stripe (Pagos) ⏰ 6-8 horas
**Por qué:** Procesamiento de pagos crítico
**Tareas:**
- [ ] Instalar `stripe/stripe-php`
- [ ] Configurar API keys en `.env`
- [ ] Crear `StripeService.php`:
  - createPaymentIntent()
  - createCharge()
  - processRefund()
  - handleWebhook()
- [ ] Actualizar `PaymentController.php`
- [ ] Crear ruta webhook `/webhook/stripe`
- [ ] Validar firmas de webhook
- [ ] Manejo de errores y reintentos
- [ ] Tests con Stripe test mode

```bash
composer require stripe/stripe-php
```

#### 9. Integración SendGrid/SES (Email) ⏰ 4-5 horas
**Por qué:** Emails transaccionales (confirmaciones, recordatorios)
**Tareas:**
- [ ] Instalar `sendgrid/sendgrid`
- [ ] Configurar API key en `.env`
- [ ] Crear templates de email:
  - Confirmación de cita
  - Recordatorio 24h
  - Recordatorio 1h
  - Cancelación
  - Factura
- [ ] Crear `EmailService.php`
- [ ] Crear eventos de Laravel:
  - `CitaCreated`
  - `CitaCancelled`
  - etc.
- [ ] Crear listeners para enviar emails
- [ ] Queue jobs para emails
- [ ] Tests

#### 10. Google Maps API (Ubicación) ⏰ 3-4 horas
**Por qué:** Mostrar sucursales, direcciones
**Tareas:**
- [ ] Obtener API key de Google Maps
- [ ] Configurar en `.env`
- [ ] Crear `GoogleMapsService.php`:
  - geocode(address)
  - reverseGeocode(lat, lng)
  - getDistance(origin, destination)
- [ ] Agregar a `BranchController.php`
- [ ] Frontend: componente de mapa
- [ ] Tests

#### 11. Firebase Cloud Messaging (Push) ⏰ 5-6 horas
**Por qué:** Notificaciones push móviles
**Tareas:**
- [ ] Configurar proyecto Firebase
- [ ] Descargar `service-account.json`
- [ ] Instalar `kreait/firebase-php`
- [ ] Crear `FirebaseService.php`:
  - sendNotification(userId, title, body)
  - sendToTopic(topic, title, body)
- [ ] Agregar campo `fcm_token` a users
- [ ] Crear `NotificationController.php`
- [ ] Eventos para notificaciones
- [ ] Tests

#### 12. Hacienda API (Facturación CR) ⏰ 8-10 horas
**Por qué:** Compliance legal Costa Rica (Ley 8968)
**Tareas:**
- [ ] Estudiar documentación API Hacienda
- [ ] Obtener certificados digitales
- [ ] Crear `HaciendaService.php`:
  - generateXML(invoice)
  - signXML(xml)
  - sendToHacienda(xml)
  - consultarRespuesta(clave)
- [ ] Actualizar `InvoiceController.php`
- [ ] Manejo de estados de factura
- [ ] Almacenar XML y respuestas
- [ ] Tests con ambiente de pruebas

---

### 🎨 Frontend - PRIORIDAD MEDIA-ALTA

#### 13. Capa de Integración con API ⏰ 4-5 horas
**Tareas:**
- [ ] Crear `frontend/src/services/api.js`:
  - Configurar Axios
  - Interceptores para JWT
  - Manejo de errores
  - Refresh token automático
- [ ] Crear servicios por recurso:
  - `authService.js` (login, register, logout, refresh)
  - `citasService.js` (CRUD citas)
  - `servicesService.js` (listar servicios)
  - `stylistsService.js` (listar estilistas)
  - `paymentsService.js` (procesar pagos)
- [ ] Tests con MSW (Mock Service Worker)

```javascript
// Ejemplo
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

#### 14. Sistema de Autenticación Frontend ⏰ 6-8 horas
**Tareas:**
- [ ] Crear Context `AuthContext.jsx`:
  - Estado de usuario
  - login(), logout(), register()
  - refreshToken()
- [ ] Crear páginas:
  - `Login.jsx`
  - `Register.jsx`
  - `ForgotPassword.jsx`
  - `ResetPassword.jsx`
- [ ] Crear componente `ProtectedRoute.jsx`
- [ ] Validación de formularios
- [ ] Manejo de errores
- [ ] Tests

#### 15. State Management (Context o Zustand) ⏰ 3-4 horas
**Tareas:**
- [ ] Decidir: Context API o Zustand
- [ ] Crear stores:
  - `useAuthStore` (usuario, permisos)
  - `useCitasStore` (citas, filtros)
  - `useNotificationsStore` (notificaciones)
- [ ] Integrar con componentes
- [ ] Persistencia en localStorage
- [ ] Tests

#### 16. Páginas Faltantes ⏰ 15-20 horas
**Tareas:**
- [ ] **Profile.jsx** - Perfil de usuario (editar datos)
- [ ] **Bookings.jsx** - Lista completa de citas
- [ ] **BookingDetail.jsx** - Detalle de cita
- [ ] **NewBooking.jsx** - Crear nueva cita (wizard)
- [ ] **Customers.jsx** - Lista de clientes (admin/stylist)
- [ ] **CustomerDetail.jsx** - Detalle de cliente
- [ ] **Services.jsx** - Catálogo de servicios
- [ ] **ServiceDetail.jsx** - Detalle de servicio
- [ ] **Stylists.jsx** - Lista de estilistas
- [ ] **StylistDetail.jsx** - Perfil de estilista
- [ ] **Settings.jsx** - Configuración de usuario
- [ ] **AdminDashboard.jsx** - Dashboard admin con analytics
- [ ] **Portfolio.jsx** - Posts/transformaciones
- [ ] **Chat.jsx** - Conversaciones

#### 17. Componentes Adicionales ⏰ 8-10 horas
**Tareas:**
- [ ] **Forms:**
  - Input, Textarea, Select, Checkbox, Radio
  - DatePicker, TimePicker
  - FileUpload (imágenes)
- [ ] **Feedback:**
  - Alert, Toast, Modal, Confirmation
  - Loading, Skeleton, Spinner
- [ ] **Navigation:**
  - Breadcrumbs, Tabs, Sidebar
- [ ] **Data Display:**
  - Table, Pagination, Badge
  - Avatar, Rating stars
- [ ] **Business:**
  - ServiceCard, StylistCard
  - AppointmentForm, PaymentForm

#### 18. PWA Features ⏰ 4-5 horas
**Tareas:**
- [ ] Crear `manifest.json`
- [ ] Crear Service Worker
- [ ] Configurar Vite PWA plugin
- [ ] Cache strategies
- [ ] Offline mode
- [ ] Install prompt
- [ ] Tests

---

### 🧪 Testing & Quality - PRIORIDAD MEDIA

#### 19. Tests Backend ⏰ 10-12 horas
**Tareas:**
- [ ] **Unit Tests:**
  - Models (relaciones, métodos)
  - Services (JWT, Email, Stripe)
  - Helpers
- [ ] **Feature Tests:**
  - Authentication flow
  - CRUD endpoints
  - Permissions RBAC
  - Payments workflow
- [ ] **Integration Tests:**
  - Stripe webhooks
  - Email sending
  - Firebase notifications
- [ ] Configurar CI/CD con GitHub Actions
- [ ] Coverage > 70%

```bash
php artisan test --coverage
```

#### 20. Tests Frontend ⏰ 8-10 horas
**Tareas:**
- [ ] Configurar Vitest
- [ ] **Component Tests:**
  - Render correctamente
  - Props funcionan
  - Events disparan
- [ ] **Integration Tests:**
  - Flujos completos (login, booking)
  - API calls con MSW
- [ ] **E2E Tests:**
  - Cypress o Playwright
  - Flujos críticos
- [ ] Coverage > 70%

---

### 📚 Documentación - PRIORIDAD BAJA

#### 21. OpenAPI/Swagger ⏰ 6-8 horas
**Tareas:**
- [ ] Instalar `darkaonline/l5-swagger`
- [ ] Documentar todos los endpoints:
  - Request/Response schemas
  - Autenticación
  - Códigos de error
- [ ] Generar Swagger UI
- [ ] Publicar documentación

```bash
composer require darkaonline/l5-swagger
php artisan l5-swagger:generate
```

#### 22. Seeders Completos ⏰ 4-5 horas
**Tareas:**
- [ ] `RolePermissionSeeder` - Roles y permisos
- [ ] `UserSeeder` - Usuarios de prueba
- [ ] `BranchSeeder` - Sucursales
- [ ] `ServiceSeeder` - Servicios completos
- [ ] `StylistSeeder` - Estilistas con disponibilidad
- [ ] `CitaSeeder` - Citas de ejemplo
- [ ] `PostSeeder` - Portfolio

```bash
php artisan db:seed
```

---

## 📊 RESUMEN DE ESFUERZO ESTIMADO

| Categoría | Tareas | Horas | Prioridad |
|-----------|--------|-------|-----------|
| **Seguridad** | 3 | 5-6 | 🔴 CRÍTICO |
| **Base de Datos** | 4 | 15-20 | 🔴 CRÍTICO |
| **Integraciones** | 5 | 26-33 | 🟠 ALTO |
| **Frontend Core** | 3 | 13-17 | 🟠 ALTO |
| **Frontend Pages** | 2 | 23-30 | 🟡 MEDIO |
| **Testing** | 2 | 18-22 | 🟡 MEDIO |
| **Documentación** | 2 | 10-13 | 🟢 BAJO |
| **TOTAL** | **21** | **110-141 horas** | - |

### Distribución por Fase

**FASE 2 - Para 80% Conformidad** (40-50 horas)
- ✅ Seguridad (5-6h)
- ✅ BD Crítica (10-12h)
- ✅ Frontend Core (13-17h)
- ✅ Integraciones básicas (12-15h - Stripe, Email)

**FASE 3 - Para 90% Conformidad** (35-45 horas)
- ✅ Frontend Pages completo (23-30h)
- ✅ Integraciones restantes (12-15h)

**FASE 4 - Para 100% Conformidad** (35-46 horas)
- ✅ Testing completo (18-22h)
- ✅ Documentación (10-13h)
- ✅ PWA features (4-5h)
- ✅ Polish y bugs (3-6h)

---

## 🎯 ROADMAP SUGERIDO

### Semana 1: Seguridad + BD Crítica (20-26 horas)
```
Día 1-2: Rate Limiting + CSP + CSRF
Día 3-4: Completar services + Posts/Portfolio
Día 5: Disponibilidad + Bloqueos
```

### Semana 2: Integraciones + Frontend Core (25-32 horas)
```
Día 1-2: Stripe + Email
Día 3: API Layer frontend
Día 4-5: Auth frontend + State Management
```

### Semana 3: Frontend Pages (23-30 horas)
```
Día 1: Profile + Settings
Día 2: Bookings (list, detail, new)
Día 3: Customers + Services
Día 4: Stylists + Portfolio
Día 5: Admin Dashboard + Chat
```

### Semana 4: Integraciones Restantes (14-18 horas)
```
Día 1: Google Maps
Día 2-3: Firebase FCM
Día 4-5: Hacienda API (CR)
```

### Semana 5: Testing + Documentación (28-35 horas)
```
Día 1-2: Tests Backend
Día 3-4: Tests Frontend
Día 5: OpenAPI + Seeders
```

### Semana 6: PWA + Polish (10-15 horas)
```
Día 1: PWA features
Día 2-3: Bug fixes
Día 4-5: Performance optimization + Deploy
```

---

## ✅ CHECKLIST DE VALIDACIÓN 100%

### Backend
- [ ] Todas las tablas de especificación creadas
- [ ] Todos los campos completos
- [ ] RBAC funcionando correctamente
- [ ] JWT RS256 funcionando
- [ ] Rate limiting activo
- [ ] CSP headers configurados
- [ ] Audit logs registrando cambios
- [ ] Todas las integraciones funcionando
- [ ] Tests > 70% coverage
- [ ] OpenAPI documentado

### Frontend
- [ ] Todas las páginas creadas
- [ ] Autenticación completa
- [ ] CRUD de citas funcionando
- [ ] Payments integrado
- [ ] Chat funcionando
- [ ] PWA instalable
- [ ] Offline mode
- [ ] Tests > 70% coverage
- [ ] Responsive design

### Integraciones
- [ ] Stripe producción configurado
- [ ] Emails enviándose
- [ ] Push notifications funcionando
- [ ] Google Maps mostrando sucursales
- [ ] Facturación electrónica CR (si aplica)

### Deployment
- [ ] Ambiente staging funcional
- [ ] Ambiente producción funcional
- [ ] CI/CD pipeline configurado
- [ ] Monitoreo (Sentry, logs)
- [ ] Backups automáticos
- [ ] SSL/HTTPS configurado

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### Opción A: Completar Seguridad (Más Rápido a 80%)
```bash
# 1. Rate Limiting (2-3h)
# 2. CSP Headers (2h)
# 3. Completar services table (2h)
# Total: 6-7 horas → 75% conformidad
```

### Opción B: Completar Integraciones Core (Más Valor)
```bash
# 1. Stripe integration (6-8h)
# 2. Email integration (4-5h)
# 3. Frontend API layer (4-5h)
# Total: 14-18 horas → 70% conformidad + features clave
```

### Opción C: Completar Frontend (Más Visible)
```bash
# 1. Auth pages (6-8h)
# 2. Bookings pages (8-10h)
# 3. API integration (4-5h)
# Total: 18-23 horas → Frontend funcional
```

---

## 💡 RECOMENDACIÓN

**Mejor estrategia para llegar a 80% rápido:**

1. **Seguridad (6h)** → Rate Limiting + CSP + CSRF
2. **Stripe (8h)** → Pagos funcionando
3. **Email (5h)** → Confirmaciones automáticas
4. **Frontend Auth (8h)** → Login/Register
5. **Frontend Bookings (10h)** → Crear citas

**Total: 37 horas → 80%+ conformidad con features críticas funcionando**

---

¿Por dónde quieres empezar?
