# SALON - Diseño de Interfaz y Experiencia de Usuario
## Documento 03 - UI/UX Design System

---

## ÍNDICE
1. [Sistema de Diseño (Design System)](#design-system)
2. [Componentes Reutilizables](#componentes)
3. [Layouts por Rol](#layouts)
4. [Flujos de Usuario Detallados](#flujos)
5. [Responsive Design](#responsive)
6. [Animaciones y Microinteracciones](#animaciones)
7. [Accesibilidad (WCAG 2.1)](#accesibilidad)

---

## 1. SISTEMA DE DISEÑO (DESIGN SYSTEM) {#design-system}

### 1.1 Paleta de Colores

```css
:root {
  /* === COLORES PRIMARIOS === */
  --salon-gold: #d4af37;           /* Dorado elegante - Principal */
  --salon-gold-light: #e8d67f;     /* Dorado claro - Hover */
  --salon-gold-dark: #b8962e;      /* Dorado oscuro - Active */
  
  /* === COLORES SECUNDARIOS === */
  --salon-black: #1a1a1a;          /* Negro profundo */
  --salon-black-light: #2d2d2d;    /* Negro suave */
  
  /* === ESCALA DE GRISES === */
  --gray-50: #fafafa;
  --gray-100: #f8f9fa;
  --gray-200: #e9ecef;
  --gray-300: #dee2e6;
  --gray-400: #ced4da;
  --gray-500: #adb5bd;
  --gray-600: #6c757d;
  --gray-700: #495057;
  --gray-800: #343a40;
  --gray-900: #212529;
  
  /* === COLORES FUNCIONALES === */
  --success: #28a745;
  --success-light: #d4edda;
  --warning: #ffc107;
  --warning-light: #fff3cd;
  --error: #dc3545;
  --error-light: #f8d7da;
  --info: #17a2b8;
  --info-light: #d1ecf1;
  
  /* === COLORES TEMA CLARO === */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --bg-card: #ffffff;
  --bg-overlay: rgba(0, 0, 0, 0.5);
  
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-tertiary: #adb5bd;
  --text-inverse: #ffffff;
  
  --border-color: #dee2e6;
  --border-light: #e9ecef;
  --border-dark: #ced4da;
  
  /* === SOMBRAS === */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.07);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.20);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
  
  /* === RADIOS DE BORDE === */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* === ESPACIADO === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  
  /* === TRANSICIONES === */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* === Z-INDEX === */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-notification: 1080;
}

/* === TEMA OSCURO === */
[data-theme="dark"] {
  --salon-gold: #f4d03f;           /* Amarillo más brillante para dark mode */
  
  --bg-primary: #0d0d0d;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #2d2d2d;
  --bg-card: #1e1e1e;
  --bg-overlay: rgba(255, 255, 255, 0.1);
  
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --text-tertiary: #6c757d;
  --text-inverse: #0d0d0d;
  
  --border-color: #3d3d3d;
  --border-light: #2d2d2d;
  --border-dark: #4d4d4d;
  
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.6);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.7);
}
```

### 1.2 Tipografía

```css
/* === FUENTE BASE: ROBOTO === */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

:root {
  /* Familia */
  --font-family-sans: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                      'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 
                      'Courier New', monospace;
  
  /* Tamaños */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */
  
  /* Pesos */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-bold: 700;
  --font-black: 900;
  
  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}

/* === CLASES DE UTILIDAD === */
.h1, h1 {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-6);
}

.h2, h2 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-5);
}

.h3, h3 {
  font-size: var(--text-3xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-snug);
  margin-bottom: var(--space-4);
}

.h4, h4 {
  font-size: var(--text-2xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-3);
}

.h5, h5 {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-3);
}

.h6, h6 {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-2);
}

p {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-4);
  color: var(--text-primary);
}

.text-small {
  font-size: var(--text-sm);
}

.text-muted {
  color: var(--text-secondary);
}

.text-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--text-secondary);
}
```

---

## 2. COMPONENTES REUTILIZABLES {#componentes}

### 2.1 Botones

```html
<!-- Botón primario -->
<button class="btn btn-primary">
  <svg class="btn-icon" width="20" height="20">
    <use href="#icon-check"></use>
  </svg>
  <span>Confirmar reserva</span>
</button>

<!-- Botón secundario -->
<button class="btn btn-secondary">Cancelar</button>

<!-- Botón outline -->
<button class="btn btn-outline">Ver más</button>

<!-- Botón ghost -->
<button class="btn btn-ghost">
  <svg class="btn-icon">
    <use href="#icon-heart"></use>
  </svg>
</button>

<!-- Botón con loading -->
<button class="btn btn-primary" disabled>
  <span class="btn-spinner"></span>
  <span>Procesando...</span>
</button>

<!-- Tamaños -->
<button class="btn btn-primary btn-sm">Pequeño</button>
<button class="btn btn-primary btn-md">Mediano</button>
<button class="btn btn-primary btn-lg">Grande</button>

<style>
/* === BASE BUTTON === */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  font-family: var(--font-family-sans);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: var(--leading-none);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* === VARIANTES === */
.btn-primary {
  background: var(--salon-gold);
  color: var(--salon-black);
}

.btn-primary:hover {
  background: var(--salon-gold-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: var(--gray-200);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--gray-300);
}

.btn-outline {
  background: transparent;
  border-color: var(--salon-gold);
  color: var(--salon-gold);
}

.btn-outline:hover {
  background: var(--salon-gold);
  color: var(--salon-black);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  padding: var(--space-2);
}

.btn-ghost:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-danger {
  background: var(--error);
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

/* === TAMAÑOS === */
.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}

.btn-lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
}

/* === ICONOS === */
.btn-icon {
  flex-shrink: 0;
}

.btn-icon-only {
  padding: var(--space-3);
  width: 40px;
  height: 40px;
}

/* === SPINNER === */
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* === EFECTO RIPPLE === */
.btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:active::after {
  width: 300px;
  height: 300px;
}
</style>
```

### 2.2 Cards (Tarjetas)

```html
<!-- Card de servicio -->
<div class="card card-service">
  <div class="card-image">
    <img src="servicio.jpg" alt="Corte de cabello">
    <span class="card-badge">Popular</span>
    <button class="card-favorite">
      <svg><use href="#icon-heart"></use></svg>
    </button>
  </div>
  <div class="card-body">
    <span class="card-category">Corte de cabello</span>
    <h3 class="card-title">Corte moderno + barba</h3>
    <p class="card-description">
      Corte personalizado con asesoría de estilo y arreglo de barba completo
    </p>
    <div class="card-meta">
      <span class="meta-item">
        <svg class="meta-icon"><use href="#icon-clock"></use></svg>
        45 min
      </span>
      <span class="meta-item">
        <svg class="meta-icon"><use href="#icon-star"></use></svg>
        4.9 (156)
      </span>
    </div>
  </div>
  <div class="card-footer">
    <div class="card-price">
      <span class="price-label">Desde</span>
      <span class="price-amount">$25.00</span>
    </div>
    <button class="btn btn-primary btn-sm">Reservar</button>
  </div>
</div>

<!-- Card de estilista -->
<div class="card card-stylist">
  <div class="card-header">
    <div class="stylist-avatar">
      <img src="estilista.jpg" alt="María González">
      <span class="avatar-status"></span>
    </div>
    <div class="stylist-info">
      <h4 class="stylist-name">María González</h4>
      <p class="stylist-specialty">Colorista experta</p>
      <div class="stylist-rating">
        <svg class="icon-star"><use href="#icon-star"></use></svg>
        <span>4.9</span>
        <span class="rating-count">(127)</span>
      </div>
    </div>
  </div>
  <div class="card-body">
    <div class="stylist-stats">
      <div class="stat">
        <span class="stat-value">8+</span>
        <span class="stat-label">años</span>
      </div>
      <div class="stat">
        <span class="stat-value">850+</span>
        <span class="stat-label">clientes</span>
      </div>
    </div>
    <p class="stylist-bio">
      Especializada en colorimetría y técnicas de balayage...
    </p>
  </div>
  <div class="card-footer">
    <button class="btn btn-outline btn-block">Ver perfil</button>
  </div>
</div>

<style>
/* === CARD BASE === */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--transition-base);
  border: 1px solid var(--border-light);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

/* === CARD IMAGE === */
.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.card:hover .card-image img {
  transform: scale(1.05);
}

.card-badge {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  padding: var(--space-1) var(--space-3);
  background: var(--salon-gold);
  color: var(--salon-black);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.card-favorite {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-base);
}

.card-favorite:hover {
  background: var(--error);
  color: white;
  transform: scale(1.1);
}

/* === CARD BODY === */
.card-body {
  padding: var(--space-4);
}

.card-category {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.card-description {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-3);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.meta-icon {
  width: 16px;
  height: 16px;
}

/* === CARD FOOTER === */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-top: 1px solid var(--border-light);
}

.card-price {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.price-amount {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--salon-gold);
}

/* === CARD ESTILISTA === */
.card-stylist .card-header {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-light);
}

.stylist-avatar {
  position: relative;
  flex-shrink: 0;
}

.stylist-avatar img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--salon-gold);
}

.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  background: var(--success);
  border: 3px solid var(--bg-card);
  border-radius: 50%;
}

.stylist-info {
  flex: 1;
  min-width: 0;
}

.stylist-name {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-1);
}

.stylist-specialty {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.stylist-rating {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.icon-star {
  width: 16px;
  height: 16px;
  fill: var(--salon-gold);
}

.rating-count {
  color: var(--text-tertiary);
}

.stylist-stats {
  display: flex;
  gap: var(--space-6);
  margin-bottom: var(--space-4);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--salon-gold);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.stylist-bio {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
```

---

**El documento es muy extenso. Continuaré creando los documentos restantes de manera más eficiente...**
