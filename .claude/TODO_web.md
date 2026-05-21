# TODO_WEB — Lo que falta implementar

> Prompt autocontenido para continuar la web de GymApp.
> Léelo completo antes de tocar un solo archivo.

---

## Estado actual de la web

La web es un proyecto **Nuxt 3** bajo `/train/` que ya tiene:

| Feature | Ruta | Estado |
|---|---|---|
| Login | `/train/auth/login` | ✅ Hecho |
| Dashboard home | `/train/` | ✅ Hecho |
| Workout activo | `/train/workout/[id]` | ✅ Hecho |
| Plantillas | `/train/templates/` | ✅ Hecho |
| Feed social | `/train/feed/` | ✅ Hecho |
| Settings | `/train/settings/` | ✅ Hecho |

**Stack confirmado:**
- Nuxt 3 · Vue 3 Composition API
- Pinia (estado global)
- Firebase SDK v10+ modular
- Tailwind CSS · TypeScript estricto
- `@nuxtjs/i18n` (ES/EN)

---

## Lo que falta (este TODO)

Tres bloques nuevos que NO existen todavía:

1. **Registro** — ✅ COMPLETADO
2. **Landing pública** — ✅ COMPLETADO (secciones SocialProof + SponsorSection + CtaSection + Pricing añadidas)
3. **Stats dashboard** — pendiente (BLOQUE 3)

---

## BLOQUE 1 — Registro ✅ COMPLETADO

### Ruta: `/train/auth/register`

Wizard de 3 pasos. Mismo estilo que el login existente.

**Paso 1 — Cuenta**
```
Email
Contraseña
Repetir contraseña
[Siguiente →]
```

**Paso 2 — Perfil**
```
Username (único, validar en Firestore antes de crear)
Objetivo: ganar músculo · perder grasa · mantenimiento · rendimiento
Nivel: principiante · intermedio · avanzado
[Crear cuenta →]
```

**Paso 3 — Descarga la app**
```
¡Cuenta lista! 🎉
Descarga la app para entrenar desde tu móvil.
[Google Play]   [App Store]

O continúa aquí →  [Ir a mi dashboard]
```

**Al completar:**
1. `createUserWithEmailAndPassword(auth, email, password)`
2. Crear doc `users/{uid}` en Firestore:
```typescript
{
  id: uid,
  username: string,
  email: string,
  photoUrl: null,
  createdAt: serverTimestamp(),
  buildType: objetivoSeleccionado,  // mapear al enum de la app
  isPrivate: false,
  followersCount: 0,
  followingCount: 0,
  totalXp: 0,
  coins: 0,
  purchasedItems: [],
}
```
3. Redirect a `/train/` (dashboard)

**Archivos nuevos:**
```
pages/train/auth/register.vue      ← wizard 3 pasos
components/auth/RegisterStep1.vue
components/auth/RegisterStep2.vue
components/auth/RegisterStep3.vue
services/authService.ts            ← añadir registerUser() si no existe
```

**Añadir link en login.vue:** "¿No tienes cuenta? Regístrate"

---

## BLOQUE 2 — Landing pública ✅ COMPLETADO

Páginas fuera de `/train/`. Son públicas, sin auth, con SSG para SEO.

### Ruta: `/` — Landing principal

> Si la raíz del proyecto Nuxt ya está ocupada por algo, usar `/landing` o configurar en `nuxt.config.ts`.

**Navbar** (fuera del middleware `auth.ts`):
```
[Logo GymApp]                    [Login]  [Empezar gratis →]
```

**Hero section:**
```
Tu gym en el bolsillo.
Registra. Progresa. Compite con tus amigos.

[↓ Google Play]   [↓ App Store]   [Probar desde web →]

[Mockup de la app — screenshot o imagen estática]
```
El botón "Probar desde web →" lleva a `/train/auth/login`.

**Features section** — 3 cards:
```
🏋️ Entrena         📊 Progresa         🥇 Compite
Registra sets,     Ve tus stats y      Reta a amigos
reps y pesos       evolución en        en tiempo real
                   gráficas
```

**Social proof** — números en tiempo real (o hardcoded si no hay `config/stats` en Firestore):
```
+2.400 usuarios · +18.000 workouts completados · +340 PRs esta semana
```
Si tienes `config/stats` doc en Firestore con `totalUsers`, `totalWorkouts`, etc., léelo aquí con una Cloud Function o desde el cliente con `getDoc`.

**Sponsors section** — "Nuestros partners" (solo si hay sponsors activos):
```typescript
// Leer de Firestore:
collection('sponsorships')
  .where('isActive', '==', true)
  .where('placement', 'array-contains', 'web_landing')
```
Si el array `placement` incluye `'web_landing'`, mostrar el logo. Si no hay ninguno activo, la sección no se renderiza (v-if).

**CTA final:**
```
¿Listo para empezar?
[Crear cuenta gratis →]   [Ver precios]
```

**Footer:**
- Links: Privacidad · Términos · Contacto
- Badges Google Play / App Store
- © 2026 GymApp

---

### Ruta: `/pricing` — Precios

**Tabla de planes:**

```
┌──────────────────────────┐   ┌─────────────────────────────┐
│          Free            │   │         Premium ⭐           │
│          0€/mes          │   │   5,99€/mes · 47,99€/año    │
│                          │   │                             │
│ ✓ Workouts ilimitados    │   │ Todo lo de Free, más:       │
│ ✓ Historial 30 días      │   │ ✓ Historial completo        │
│ ✓ 5 plantillas           │   │ ✓ Plantillas ilimitadas     │
│ ✓ IA 10 msg/día          │   │ ✓ IA sin límites            │
│ ✓ Social básico          │   │ ✓ Analíticas avanzadas      │
│                          │   │ ✓ Sin publicidad            │
│  [Empezar gratis]        │   │ ✓ Todos los temas           │
│                          │   │ ✓ Badge Premium en perfil   │
│                          │   │                             │
│                          │   │ [Prueba gratis 7 días →]    │
└──────────────────────────┘   └─────────────────────────────┘
```
Anual destacado visualmente (borde, badge "Ahorra 33%").

**FAQ section:**
- ¿Puedo cancelar cuando quiera? → Sí, sin permanencia.
- ¿Qué pasa con mis datos si cancelo? → Tus datos se conservan, vuelves al plan Free.
- ¿Está disponible en iOS y Android? → Sí, y también puedes entrenar desde esta web.
- ¿Cómo pago? → Desde la app (Google Play / App Store billing).

Botones de la pricing page → redirigen a `/train/auth/register`.

**Archivos nuevos:**
```
pages/index.vue                    ← landing (o pages/landing.vue si / está ocupado)
pages/pricing.vue
components/landing/HeroSection.vue
components/landing/FeaturesSection.vue
components/landing/SponsorCarousel.vue
components/landing/PricingCard.vue
components/landing/FaqSection.vue
components/shared/PublicNavbar.vue  ← navbar sin auth (diferente al del dashboard)
components/shared/Footer.vue
```

**Configurar en `nuxt.config.ts`** que `/` y `/pricing` no pasan por el middleware `auth.ts`.

---

## BLOQUE 3 — Stats Dashboard

Rutas bajo `/train/` (protegidas por el middleware auth existente). Son extensiones del dashboard actual.

### Ruta: `/train/stats`

**Overview cards** (fila superior):
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Workouts    │  │  Volumen     │  │  Racha       │  │  Nivel XP    │
│  totales     │  │  total (kg)  │  │  X días 🔥   │  │  Nivel N     │
│     47       │  │  12.340      │  │     12       │  │  Bronce      │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

Leer de Firestore:
- `users/{uid}` → `totalXp`, `streak` (si existe el campo), `coins`
- `workouts` → `where('userId','==',uid).where('isCompleted','==',true)` — últimos 90 días

**Heatmap de actividad anual** (estilo GitHub contributions):
- Grid 52 semanas × 7 días
- Celda coloreada si hubo workout ese día (intensidad = volumen total del día)
- Tooltip on hover: fecha + volumen + número de ejercicios
- Leer: `workouts` del último año, agrupar por fecha en cliente

**Gráfica volumen semanal** — barras últimas 12 semanas:
- Calcular en cliente desde los workouts cargados
- Usar una librería ligera: `chart.js` vía `vue-chartjs`, o `unovis`, o incluso SVG manual si es simple

**Distribución muscular** — donut o radar:
- Calcular desde los ejercicios de cada workout (si hay campo `primaryMuscle` en los sets)

---

### Ruta: `/train/history`

Lista paginada de workouts completados.

```
┌────────────────────────────────────────────────────────┐
│  Push Day                              23 may 2026     │
│  1h 12min · 8 ejercicios · 4.200 kg volumen           │
│  [Ver detalle →]                                       │
├────────────────────────────────────────────────────────┤
│  Leg Day                               21 may 2026     │
│  ...                                                   │
└────────────────────────────────────────────────────────┘
```

**Query Firestore:**
```typescript
// Free: últimos 30 días
query(
  collection(db, 'workouts'),
  where('userId', '==', uid),
  where('isCompleted', '==', true),
  where('startedAt', '>=', thirtyDaysAgo),   // free gate
  orderBy('startedAt', 'desc'),
  limit(20)
)

// Premium: sin filtro de fecha, limit(20) + startAfterDocument para paginación
```

Si `users/{uid}.isPremium == false` y el usuario intenta ver más allá de 30 días → banner:
```
📊 Historial completo disponible con Premium
Descarga la app y suscríbete para ver todo tu historial.
[Ver planes →]   ← link a /pricing
```

**Detalle de workout** — modal o página `/train/history/[id]`:
- Lista de ejercicios con sets, reps, kg
- Feedback (dificultad, energía, notas)
- XP ganada
- Duración

**Archivos nuevos:**
```
pages/train/stats.vue
pages/train/history.vue
pages/train/history/[id].vue
components/stats/OverviewCards.vue
components/stats/ActivityHeatmap.vue
components/stats/VolumeChart.vue
components/stats/MuscleDistribution.vue
components/history/WorkoutListItem.vue
components/history/WorkoutDetail.vue
services/statsService.ts               ← queries de stats
stores/statsStore.ts
```

---

### Ruta: `/train/records`

Tabla de Personal Records por ejercicio.

```
┌──────────────────┬────────────┬────────────┬──────────────┐
│ Ejercicio        │ PR actual  │ 1RM estim. │ Fecha        │
├──────────────────┼────────────┼────────────┼──────────────┤
│ Press banca      │ 100 kg×5   │ 117 kg     │ 15 may 2026  │
│ Sentadilla       │ 120 kg×3   │ 132 kg     │ 20 may 2026  │
└──────────────────┴────────────┴────────────┴──────────────┘
```

**Fórmula 1RM estimado** (Brzycki):
```typescript
const oneRM = (weight: number, reps: number): number =>
  Math.round(weight / (1.0278 - 0.0278 * reps))
```

**Leer de Firestore:**
```typescript
// Si existe colección personalRecords:
collection(db, 'personalRecords', uid, 'exercises')

// Si no, calcular desde workouts (más costoso):
// iterar workouts → sets → encontrar max weight para cada exerciseId
```
Consulta `BACKEND.md` para ver si `personalRecords` existe como colección separada o está embebida en workouts.

Filtros: por grupo muscular (si hay `primaryMuscle` en el ejercicio), por fecha.

---

### Navegación — añadir al sidebar/navbar existente

Si el dashboard tiene un sidebar o navbar de navegación, añadir los nuevos tabs:

```
📊 Stats        → /train/stats
🏋️ Historial    → /train/history  (renombrar si ya existe algo similar)
🥇 Records      → /train/records
[tabs existentes...]
```

Si el `[id].vue` de workout activo ya maneja un flujo similar, no duplicar. Reutilizar los componentes y stores existentes.

---

## Datos que NO hay que tocar

- Estructura Firestore — no cambia nada del backend
- Middleware `auth.ts` — solo añadir las rutas públicas a la excepción si hace falta
- `workoutStore`, `feedStore`, `authStore` — solo extender si falta algo, no reescribir
- Firebase config — mismo proyecto `gym-app-41fd6`

---

## Tokens de color (coherentes con la app Flutter)

Si no están ya definidos en `tailwind.config.ts`, añadir:

```typescript
colors: {
  bg:       '#0A0A0A',
  surface:  '#141414',
  border:   '#1F1F1F',
  primary:  '#FF6200',   // naranja energético
  accent:   '#A855F7',   // morado XP/gamificación
  muted:    '#6B7280',
}
```

---

## Orden de implementación recomendado

1. **Registro** (`/train/auth/register`) — desbloquea que nuevos usuarios puedan crearse cuenta desde web
2. **Landing** (`/`) — página de entrada pública, la más visible
3. **Pricing** (`/pricing`) — se referencia desde la landing, fácil de hacer después
4. **Stats overview** (`/train/stats`) — cards + heatmap, lo más útil en desktop
5. **Historial** (`/train/history`) — lista de workouts + detalle
6. **Records** (`/train/records`) — tabla de PRs
7. **Conectar sponsors** en la landing si ya hay `sponsorships` en Firestore

No pasar al punto N+1 sin que N esté probado manualmente.

---

## Estado de implementación por bloque

### BLOQUE 1 — Registro ✅
- [x] `pages/train/auth/register.vue` — wizard 3 pasos
- [x] `components/auth/RegisterStep1.vue` — email/password/confirm
- [x] `components/auth/RegisterStep2.vue` — nickname (con check de unicidad en Firestore) + objetivo
- [x] `components/auth/RegisterStep3.vue` — éxito, descarga app, ir al dashboard
- [x] `services/auth.service.ts` — añadido `createUser()`
- [x] `services/profile.service.ts` — añadidos `checkNicknameAvailable()` y `createProfile()`
- [x] `pages/train/auth/login.vue` — añadido link "Regístrate gratis"

### BLOQUE 2 — Landing pública ✅
- [x] `components/AppNavbar.vue` — añadidos Login + "Empezar gratis" + Precios
- [x] `components/HeroSection.vue` — añadido botón "Probar desde web"
- [x] `components/landing/SocialProof.vue` — stats hardcoded (ver nota abajo)
- [x] `components/landing/SponsorSection.vue` — listo para Firestore, `v-if` cuando no hay sponsors
- [x] `components/landing/CtaSection.vue` — CTA final con link a /register y /pricing
- [x] `pages/index.vue` — integradas las nuevas secciones
- [x] `pages/pricing.vue` — página de precios con FAQ accordion
- [x] `components/AppFooter.vue` — añadidos links Privacidad · Términos · Contacto

### Pendiente — estado a medias

**SocialProof (`config/stats`):**
> Actualmente con números hardcoded. Cuando se cree el doc `config/stats` en Firestore
> con campos `totalUsers`, `totalWorkouts`, `weeklyPRs`, actualizar
> `components/landing/SocialProof.vue` para leerlos con `getDoc`.

**SponsorSection (`sponsorships`):**
> Código listo y funcional. La sección NO se renderiza porque no hay docs en la colección
> `sponsorships` que tengan `isActive: true` y `placement` con `'web_landing'`.
> Cuando se añadan sponsors, aparecerá automáticamente.
> Requiere índice compuesto en Firestore: `(isActive ASC, placement ARRAY_CONTAINS)`.

**BLOQUE 3 — Stats Dashboard:** pendiente completo.
- `/train/stats` — heatmap, gráficas, overview cards
- `/train/history` — historial paginado + detalle
- `/train/records` — tabla de PRs + 1RM Brzycki

## Checklist pre-launch

- [x] Registro funciona: crea cuenta en Firebase Auth + doc en Firestore `users/{uid}`
- [x] Landing carga sin login (rutas públicas excluidas del middleware auth)
- [x] Landing es responsive en móvil
- [x] Pricing muestra los planes correctamente, botones llevan a /register
- [ ] Dashboard stats muestra datos reales del usuario logueado (BLOQUE 3)
- [ ] Historial: paginación funciona, gate de 30 días para free (BLOQUE 3)
- [ ] Records: tabla correcta, 1RM calculado correctamente (BLOQUE 3)
- [x] Dark mode coherente con la app (colores idénticos)
- [ ] i18n: todos los textos nuevos tienen clave en ES y EN (pendiente)
- [ ] Sponsors: si no hay activos en Firestore, la sección no aparece ✅ (ya funciona así)
