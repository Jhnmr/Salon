# 📋 PLAN DE EJECUCIÓN - SALON MVP (2 Semanas)

**Objetivo:** Alcanzar 70-75% de conformidad (desde 48%) con un MVP funcional de principio a fin.

**Periodo:** 2 semanas de desarrollo acelerado

**Estado Actual:**
- Frontend: 5% (solo template básico)
- Backend: ~90% base (falta JWT, rate limiting, audit logs)
- Integraciones: 0% (Stripe, Maps, SendGrid, FCM)
- Seguridad: 25%

---

## 🎯 SEMANA 1: FUNDACIÓN & AUTENTICACIÓN

### Día 1: Setup & Componentes Base

**Frontend:**
- [ ] Crear librería de componentes reutilizables
  - Button (primario, secundario, outline)
  - Card, Input, FormGroup
  - Modal, Toast notification system
  - Navbar + Bottom Navigation (móvil)
  - Loader/Spinner
  - Estructura responsive con Tailwind

- [ ] Setup Context API para autenticación
- [ ] Crear API client service (axios + JWT interceptors)

**Backend:**
- [ ] Instalar `tymon/jwt-auth`
- [ ] Generar RSA key pairs para JWT RS256
- [ ] Configurar JWT en `config/jwt.php`
- [ ] Crear custom User model con métodos JWT

---

### Días 2-3: Páginas de Autenticación

**Frontend:**
- [ ] Página Register
  - Formulario con validación (email, password, confirmar password)
  - Envío de registro a API
  - Almacenamiento de JWT token
  - Redirección a home después de registro exitoso

- [ ] Página Login
  - Formulario simple (email, password)
  - Autenticación JWT
  - Gestión de tokens en localStorage
  - "Remember me" opcional

- [ ] Rutas protegidas
  - PrivateRoute component
  - Redirección a login si no autenticado

**Backend:**
- [ ] Update endpoints `/api/register` y `/api/login` para JWT
- [ ] Implement JWT middleware
- [ ] Endpoint `/api/user` para obtener usuario autenticado
- [ ] Logout endpoint (blacklist de tokens)

---

### Días 4-5: Búsqueda de Estilistas & Integración Google Maps

**Frontend:**
- [ ] Integración Google Maps API
  - Mapa mostrando salones cercanos
  - Autocomplete para búsqueda de ubicación
  - Geolocalización del usuario
  - Filtros básicos (por servicio, distancia)

- [ ] Página de Search/Listing
  - Lista de estilistas con cards
  - Filtrado y búsqueda
  - Puntuación y número de reviews simple

- [ ] Perfil de Estilista (Detail Page)
  - Información básica
  - Servicios con precios
  - Calificación promedio (1-5 estrellas)
  - Botón "Reservar"

**Backend:**
- [ ] Endpoint `GET /api/stylists` con geolocalización
- [ ] Endpoint `GET /api/stylists/{id}` con servicios
- [ ] Endpoint `GET /api/stylists/{id}/availability`
- [ ] Cálculo de distancia desde ubicación del usuario

---

### Días 6-7: Flujo de Reserva & Calendario

**Frontend:**
- [ ] Componente de Calendario
  - Visualización por mes
  - Highlight de fechas disponibles
  - Selección de fecha

- [ ] Página de Reserva
  - Seleccionar servicio
  - Seleccionar fecha y hora
  - Resumen de reserva (precio total, duración)
  - Botón "Proceder al pago"

- [ ] Página de Confirmación (temporal, antes de pago)
  - Resumen de detalles

**Backend:**
- [ ] Endpoint `GET /api/slots?stylist_id={id}&date={date}`
- [ ] Validación de disponibilidad
- [ ] Lógica de cálculo de duración del servicio

---

### Backend Semana 1: Seguridad & Rate Limiting

**Implementar JWT RS256 completo:**
- [ ] Middleware de autenticación JWT
- [ ] Refresh token logic
- [ ] Token expiration handling

**Rate Limiting:**
- [ ] Setup Redis rate limiter
- [ ] Middleware para limitar requests (100/min por IP)
- [ ] Endpoints críticos protegidos (login, register, payments)
- [ ] HTTP 429 responses con headers informativos

**Audit Logs:**
- [ ] Tabla `audit_logs` con migración
- [ ] AuditLog Model
- [ ] Observer patrón para capturar cambios
- [ ] Log de: usuario, acción, tabla, datos antes/después, IP, timestamp

---

## 🎯 SEMANA 2: INTEGRACIONES & PULIDO

### Días 1-2: Integración Stripe

**Frontend:**
- [ ] Instalar `@stripe/react-stripe-js`
- [ ] Página de Checkout
  - Stripe Elements para card input
  - Monto total y desglose de precios
  - Manejo de errores
  - Confirmación visual de pago procesando

**Backend:**
- [ ] Instalar Stripe PHP SDK
- [ ] API key en .env
- [ ] Endpoint `POST /api/payments/create-intent`
  - Crear Payment Intent
  - Retornar clientSecret

- [ ] Endpoint `POST /api/payments/confirm`
  - Confirmar Payment Intent
  - Crear Reservation si pago exitoso
  - Crear Transaction record

- [ ] Webhook para confirmación de pagos
  - Endpoint `/webhooks/stripe`
  - Verificar firma de Stripe
  - Actualizar reservación si falla

---

### Día 3: Integración SendGrid

**Backend:**
- [ ] Instalar SendGrid SDK
- [ ] API key en .env
- [ ] Crear Mailable classes:
  - `RegistrationConfirmation` - Bienvenida
  - `BookingConfirmation` - Confirmación de cita
  - `BookingReminder` - Recordatorio 24h antes
  - `BookingCancellation` - Confirmación de cancelación

- [ ] Queue jobs para envío asincrónico
- [ ] Disparar emails en eventos apropiados
  - `UserCreated` → RegistrationConfirmation
  - `ReservationCreated` → BookingConfirmation
  - `ReservationCancelled` → BookingCancellation

**Frontend:**
- [ ] Mensaje "Se envió confirmación a tu email"

---

### Día 4: Firebase Cloud Messaging (Básico)

**Si hay tiempo:**
- [ ] Setup Firebase project
- [ ] Service Worker registration en React
- [ ] Request permission para push notifications
- [ ] Store FCM token en servidor
- [ ] Backend setup para enviar push notifications

**Si no hay tiempo:**
- [ ] Documentar cómo hacerlo para post-MVP

---

### Días 5-6: Perfil de Usuario & Dashboards

**Frontend - Cliente:**
- [ ] Página de Perfil
  - Mostrar información de usuario
  - Editar nombre, email, foto de perfil
  - Cambiar contraseña

- [ ] Próximas Citas
  - Lista de citas próximas
  - Opción de cancelar cita
  - Opción de reprogramar (si hay tiempo)

- [ ] Historial de Citas
  - Citas pasadas
  - Opción de dejar calificación simple (1-5 estrellas)

**Frontend - Estilista:**
- [ ] Dashboard
  - Citas de hoy
  - Citas de la semana
  - Estadísticas simples (número de citas, ingresos del día)

- [ ] Gestión de Citas
  - Aceptar/Rechazar cita pendiente
  - Marcar cita como completada

- [ ] Gestión de Servicios (básico)
  - Ver servicios que ofrece
  - Editar precio y duración
  - Activar/desactivar servicios

**Backend:**
- [ ] Endpoint `GET /api/reservations` (filtrado por usuario y estado)
- [ ] Endpoint `PATCH /api/reservations/{id}` (actualizar estado)
- [ ] Endpoint `DELETE /api/reservations/{id}` (cancelar cita)
- [ ] Endpoint `GET /api/dashboard/stylist` (métricas simples)

---

### Días 6-7: Seguridad, Testing & Pulido

**Seguridad:**
- [ ] CSP Headers en Laravel (prevenir XSS)
- [ ] CORS configuración restrictiva
- [ ] Input validation en todos los endpoints
- [ ] SQL injection prevention (usar Eloquent)
- [ ] HTTPS en producción (verifica certificados)

**Testing:**
- [ ] Tests unitarios para Stripe payment processing
- [ ] Tests para JWT authentication
- [ ] Tests para rate limiting
- [ ] End-to-end manual testing del flujo completo

**UX Improvements:**
- [ ] Optimizar imágenes
- [ ] Lazy loading para listas largas
- [ ] Skeleton screens para estados de carga
- [ ] Error boundaries en React

---

## 📊 FUNCIONALIDADES EXCLUIDAS DEL MVP

❌ Chat en tiempo real
❌ Portafolio tipo Instagram
❌ Sistema de reviews completo (solo calificación simple)
❌ Facturación electrónica Hacienda (solo para Costa Rica)
❌ Panel Super Admin
❌ Múltiples métodos de pago
❌ Suscripciones
❌ Analytics avanzado
❌ Promociones y descuentos

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Funcionales
- [x] Usuarios pueden registrarse
- [x] Login con JWT funciona
- [x] Búsqueda de estilistas en mapa
- [x] Ver perfil de estilista
- [x] Reservar cita (seleccionar servicio, fecha, hora)
- [x] Pagar con Stripe
- [x] Recibir email de confirmación
- [x] Ver próximas citas
- [x] Cancelar cita
- [x] Estilista ver citas del día y aceptarlas
- [x] Admin ver dashboard básico

### Técnicos
- [x] PWA funcional (service worker básico)
- [x] Responsive en móvil, tablet, desktop
- [x] JWT RS256 funcionando
- [x] Rate limiting protegiendo endpoints críticos
- [x] Audit logs registrando acciones
- [x] Stripe pagos en modo test
- [x] Google Maps mostrando salones
- [x] SendGrid enviando emails
- [x] Sin errores críticos en consola

### UX
- [x] Interfaz limpia y profesional
- [x] Flujo intuitivo
- [x] Feedback visual (loaders, toasts)
- [x] Manejo de errores amigable
- [x] Performance < 3s en 4G

---

## 📦 STACK CONFIRMADO

```
Backend:     Laravel 11, PHP 8.3, PostgreSQL 15, Redis 7
Frontend:    React 18, Vite, TailwindCSS
Pagos:       Stripe
Mapas:       Google Maps API
Emails:      SendGrid
Push:        Firebase Cloud Messaging (básico)
Seguridad:   JWT RS256, Redis rate limiting
```

---

## 🚀 PRÓXIMOS PASOS

1. **Explorar código existente** en backend (migraciones, modelos, seeders)
2. **Crear rama de feature** para desarrollo (ya estamos en rama correcta)
3. **Iniciar con componentes base de React** (Button, Card, Form, etc.)
4. **Implementar JWT en backend** en paralelo
5. **Construir flujo de auth completo** (register → login → dashboard)
6. **Integrar Google Maps** para búsqueda
7. **Implementar Stripe** para pagos
8. **Agregar SendGrid** para emails
9. **Testing y refinamiento**

---

## 📞 NOTAS IMPORTANTES

**NO BUSCAMOS PERFECCIÓN:**
- Diseño limpio pero no pixel-perfect
- 30-40% cobertura de tests es suficiente
- Está bien tener TODOs para mejoras futuras
- Enfoque: funcionalidad sobre completitud

**ESTÁ BIEN SI:**
- Faltan algunas optimizaciones de performance
- No hay tests exhaustivos
- El código tiene algunas rough edges
- Faltan features "nice to have"

**NO ESTÁ BIEN SI:**
- El flujo de reserva no funciona end-to-end
- Hay bugs críticos
- Seguridad básica falta
- Pagos Stripe no funcionan
- No responsive en móvil

---

Ahora comenzamos la ejecución. ¡Vamos! 🚀
