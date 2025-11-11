# 🎨 PROMPT: COMPONENTES REACT COMPLETOS - SALON UI SYSTEM

## SOLICITUD DIRECTA AL EQUIPO DE IA

Necesito que generes **código React 18 production-ready** que implemente exactamente el siguiente diseño visual sin mockups previos. El código debe ser funcional, modular y listo para integrar con el backend.

---

## 📱 DESCRIPCIÓN VISUAL DEL DISEÑO

### TEMA Y PALETA
- **Fondo principal:** Negro profundo (#0d0d0d)
- **Fondo secundario/tarjetas:** Gris carbón (#1a1a1a, #2d2d2d)
- **Acento principal:** Amarillo brillante (#f4d03f)
- **Texto principal:** Blanco (#ffffff)
- **Texto secundario:** Gris claro (#b0b0b0)
- **Éxito:** Verde (#28a745)
- **Error/Negativo:** Rojo (#dc3545)
- **Bordes redondeados:** Radio amplio (16-24px en componentes principales)

### TIPOGRAFÍA
- Familia: `'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Títulos: Bold (700), blanco
- Datos/números: Amarillo, peso 700
- Secundario: Gris claro (#b0b0b0), peso 500
- Labels: Pequeño (12-14px), gris, uppercase
- Peso general: Slightly bold (fuente moderna)

---

## 📱 PANTALLA 1: DASHBOARD DEL ESTILISTA

### ESTRUCTURA COMPLETA:

```
┌─────────────────────────────────────────┐
│ 12:45    📶 📡 🔋    [RED CIRCLE "08"]│ ← Status Bar
├─────────────────────────────────────────┤
│ [🔍 Search for client.....................] │ ← Search Bar
├─────────────────────────────────────────┤
│ Your Stats                               │
│ ┌──────────────────┬──────────────────┐ │
│ │ Total Bookings   │  Cancelled Month │ │
│ │ 28 ↑ (green)     │  12% ↓ (red)    │ │
│ │ (YELLOW BG)      │  (DARK GRAY BG) │ │
│ └──────────────────┴──────────────────┘ │
├─────────────────────────────────────────┤
│ Today's Bookings                        │
│ ┌─────────────────────────────────────┐ │
│ │ [9:30 AM - 10:30 AM] (yellow bubble)│ │
│ │ 60min x02 Services                  │ │
│ │ [👤] Sarah Johnson        REF 6790  │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [10:45 AM - 11:45 AM]               │ │
│ │ 45min x01 Services                  │ │
│ │ [👤] Emma Davis           REF 4521  │ │
│ └─────────────────────────────────────┘ │
│                              ┌─────────┐│
│                              │  [+]    ││ ← Floating Button
│                              └─────────┘│
├─────────────────────────────────────────┤
│ [🏠] [📅] [📋] [👥]                     │ ← Bottom Nav
│ Home Calendar Bookings Customers        │
└─────────────────────────────────────────┘
```

---

## 📅 PANTALLA 2: CALENDAR VIEW

### ESTRUCTURA COMPLETA:

```
┌─────────────────────────────────────────┐
│ 12:45    📶 📡 🔋    [RED CIRCLE "08"]│
├─────────────────────────────────────────┤
│ October 2022                            │
│ [Mo 17] [Tu 18] [W 19] [Th 20*] [Fr 21]│
│        * Dia activo en amarillo         │
├─────────────────────────────────────────┤
│ Today's Bookings                        │
│ ┌─────────────────────────────────────┐ │
│ │ 9:30 AM                             │ │
│ │ [9:30 AM - 10:30 AM] [👤] Sarah...  │ │
│ │ Haircut - 60min           [Details] │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 10:45 AM                            │ │
│ │ [10:45 AM - 11:45 AM] [👤] Emma...  │ │
│ │ Color & Style - 45min     [Details] │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 1:00 PM                             │ │
│ │ [1:00 PM - 2:30 PM] [👤] Lisa....   │ │
│ │ Styling - 90min           [Details] │ │
│ └─────────────────────────────────────┘ │
│                              ┌─────────┐│
│                              │  [+]    ││
│                              └─────────┘│
├─────────────────────────────────────────┤
│ [🏠] [📅] [📋] [👥]                     │
│ Home Calendar Bookings Customers        │
└─────────────────────────────────────────┘
```

---

## 🔧 COMPONENTES A CREAR

### 1. **StatusBar** (Top Component)
```
Props:
- time: string (ej: "12:45")
- notifications: number (ej: 8)
- signal: boolean
- wifi: boolean
- battery: number (0-100)

Render:
- Hora centrada
- Íconos derecha
- Badge rojo circular con número (arriba derecha)
```

### 2. **SearchBar**
```
Props:
- placeholder: string
- onSearch: function
- icon: ReactNode

Styles:
- Background: #2d2d2d
- Border radius: 12px
- Ícono derecha (lupa)
- Padding: 12px 16px
```

### 3. **StatsCard**
```
Props:
- title: string
- value: number | string
- trend: 'up' | 'down'
- variant: 'primary' | 'secondary'

Styles (Primary - Yellow):
- Background: #f4d03f
- Text: #0d0d0d
- Borde radius: 16px

Styles (Secondary - Dark Gray):
- Background: #2d2d2d
- Text: #ffffff
- Borde radius: 16px
```

### 4. **BookingCard**
```
Props:
- timeStart: string (ej: "9:30 AM")
- timeEnd: string (ej: "10:30 AM")
- duration: string (ej: "60min")
- services: number (ej: 2)
- clientName: string
- clientImage: string (URL)
- reference: string (ej: "REF 6790768C")
- onDetails?: function

Styles:
- Background: #2d2d2d
- Border radius: 16px
- Padding: 16px
- Hora en burbuja amarilla (#f4d03f)
- Texto cliente gris
```

### 5. **TimelineBookingCard** (Para Calendar View)
```
Props:
- time: string (ej: "9:30 AM")
- timeStart: string
- timeEnd: string
- clientName: string
- clientImage: string
- service: string
- duration: string
- onDetails?: function

Styles:
- Similar a BookingCard pero horizontal
- Hora en burbuja izquierda
- Detalles derecha con botón "Details"
```

### 6. **FloatingActionButton**
```
Props:
- icon?: ReactNode (default: "+")
- onClick: function
- color: string (default: #f4d03f)

Styles:
- Circular
- Background: #f4d03f
- Color: #0d0d0d
- Position: fixed bottom-right
- Sombra suave (shadow-lg)
- Size: 56-64px
```

### 7. **BottomNavigation**
```
Props:
- activeTab: string ('home' | 'calendar' | 'bookings' | 'customers')
- onTabChange: function

Items:
- Home (🏠)
- Calendar (📅)
- Bookings (📋)
- Customers (👥)

Styles (Active):
- Background: rgba(244, 208, 63, 0.2)
- Text: #ffffff
- Icon: #f4d03f

Styles (Inactive):
- Text: #b0b0b0
- Icon: #b0b0b0
```

### 8. **DaySelector** (Calendar View)
```
Props:
- selectedDate: Date
- onDateChange: function
- month: string (ej: "October")
- year: number

Render:
- Mes y año como header
- 7 días en burbujas horizontales
- Día activo: Amarillo (#f4d03f) con texto negro
- Días inactivos: Gris oscuro (#2d2d2d)
- Border radius: 12px
```

---

## 📦 ESTRUCTURA DE CARPETAS

```
src/
├── components/
│   ├── common/
│   │   ├── StatusBar.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FloatingActionButton.jsx
│   │   ├── BottomNavigation.jsx
│   │   └── index.js
│   ├── dashboard/
│   │   ├── DashboardScreen.jsx
│   │   ├── StatsCard.jsx
│   │   ├── BookingCard.jsx
│   │   └── YourStatsSection.jsx
│   ├── calendar/
│   │   ├── CalendarScreen.jsx
│   │   ├── DaySelector.jsx
│   │   ├── TimelineBookingCard.jsx
│   │   └── TimelineSection.jsx
│   └── styles/
│       ├── theme.js
│       ├── globals.css
│       └── tailwind.config.js
├── pages/
│   ├── Dashboard.jsx
│   └── Calendar.jsx
└── App.jsx
```

---

## 🎨 TEMA Y VARIABLES CSS

```js
// theme.js
export const darkTheme = {
  colors: {
    // Backgrounds
    bg: {
      primary: '#0d0d0d',
      secondary: '#1a1a1a',
      tertiary: '#2d2d2d',
      card: '#1e1e1e',
    },
    
    // Text
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      tertiary: '#6c757d',
      inverse: '#0d0d0d',
    },
    
    // Accents
    accent: {
      primary: '#f4d03f', // Amarillo
      success: '#28a745',
      error: '#dc3545',
    },
    
    // Borders
    border: {
      primary: '#3d3d3d',
      light: '#4d4d4d',
    },
  },
  
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
  },
};
```

---

## ✅ REQUISITOS DE IMPLEMENTACIÓN

### Obligatorio:
1. ✅ React 18 con hooks (useState, useContext)
2. ✅ Tailwind CSS para estilos
3. ✅ Componentes reutilizables y modular
4. ✅ Props correctas y PropTypes
5. ✅ Mobile-first (360px mínimo)
6. ✅ Responsive design (360px, 480px, 768px, 1024px, 1920px)
7. ✅ Tema oscuro por defecto
8. ✅ Sin dependencias externas complejas (solo Tailwind + React)
9. ✅ Iconos: Usar iconos simples (SVG o lucide-react)
10. ✅ Estados mock (datos hardcoded para demo)

### Funcionalidad:
1. ✅ Bottom navigation interactiva (cambiar pantalla)
2. ✅ Search bar funcional (filter local)
3. ✅ FAB clickeable (console.log o modal)
4. ✅ Day selector funcional
5. ✅ Smooth transitions entre pantallas

### Código Quality:
1. ✅ ESLint compliant
2. ✅ Nombres descriptivos
3. ✅ Comentarios en secciones complejas
4. ✅ Componentes <200 líneas (si es > 300, separar)
5. ✅ DRY principle (no repetir código)
6. ✅ Accesibilidad: aria-labels, semantic HTML

---

## 📤 ENTREGA ESPERADA

### Archivo principal: `SalonUI.jsx`
```
Export:
- DashboardScreen (exporta componente listo para usar)
- CalendarScreen (exporta componente listo para usar)
- App (exporta app con ambas pantallas)

La app debe ser:
1. Funcional immediatamente (npm run dev)
2. Con datos mock (no requerir API aún)
3. Responsive en cualquier pantalla
4. Production-ready
5. Con navegación funcional entre pantallas
```

### Archivos adicionales:
- `theme.js` (variables de tema)
- `tailwind.config.js` (configuración)
- `globals.css` (estilos globales)
- Comentarios en el código

---

## 🔗 NOTAS IMPORTANTES

- **NO usar:** Material-UI, Chakra UI, shadcn/ui (solo Tailwind puro)
- **SÍ usar:** Tailwind utility classes + custom CSS si es necesario
- **Iconos:** lucide-react O SVG inline (evitar Font Awesome)
- **Estados:** Mock data (no API aún)
- **Performance:** Memoize componentes si es necesario

---

## 🎯 RESULTADO FINAL

Al ejecutar el código debe verse exactamente así:

**Pantalla 1 (Dashboard):**
- Status bar arriba con hora y notificaciones
- Search bar
- Stats section (2 tarjetas)
- Today's Bookings list (2-3 items)
- FAB amarillo abajo derecha
- Bottom nav con active state

**Pantalla 2 (Calendar):**
- Status bar arriba
- Month selector con 7 días
- Day active en amarillo
- Today's Bookings timeline
- FAB amarillo
- Bottom nav con active state

**Interactividad:**
- Click en bottom nav cambia pantalla
- FAB hace algo (alert/modal)
- Day selector cambia día
- Search filtra bookings

---

## 💡 BONUS POINTS

- ✅ Animaciones suaves en transiciones
- ✅ Hover states en tarjetas
- ✅ Loading skeletons
- ✅ Gestos touch-friendly
- ✅ Dark mode smooth transition
- ✅ Tema claro como variante (toggle)

---

**¡Listo para implementar? Adelante con el código production-ready!**
