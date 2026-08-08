# Eliminar /train y crear placeholder /cms

## Contexto

La web va a dejar de ofrecer la funcionalidad de entrenar (hacer ejercicio) desde el navegador. Esa zona privada (`/train`) se elimina por completo — dashboard, entrenamiento activo, historial, plantillas, feed social, settings, login/registro. En su lugar se construirá un CMS (diseños pendientes). Este spec cubre únicamente:

1. Eliminar toda la funcionalidad de `/train`.
2. Crear una ruta `/cms` placeholder con el texto "Hola mundo".

Queda fuera de alcance: diseño real del CMS, autenticación de administradores, cualquier gestión de contenido Firestore. Eso se abordará en un spec propio cuando lleguen los diseños.

## Decisiones (confirmadas con el usuario)

- Se elimina **todo** `/train`, no solo el flujo de "hacer ejercicio". Incluye login/registro, plantillas, feed y settings.
- Se elimina también la capa de datos asociada (stores Pinia, servicios Firebase, tipos TS) — no se conserva nada "por si acaso". Si el CMS necesita acceder a las mismas colecciones de Firestore, esa capa se recreará desde cero con su propio spec.
- Los CTA de login/registro en la landing y en pricing se **quitan**, no se dejan como enlaces muertos.
- `/cms` se crea sin protección (sin middleware de auth) y sin layout especial — usa el layout `default`.

## Alcance de la eliminación

### Páginas
- `app/pages/train/` (completo): `index.vue`, `auth/login.vue`, `auth/register.vue`, `workout/active.vue`, `workout/[id].vue`, `workout/history.vue`, `templates/index.vue`, `feed/index.vue`, `settings/index.vue`

### Layouts y middleware
- `app/layouts/train.vue`
- `app/middleware/auth.ts`

### Componentes
- `app/components/workout/` (completo)
- `app/components/feed/` (completo)
- `app/components/settings/` (completo)
- `app/components/shared/ToastContainer.vue` (solo se usaba dentro de `/train`)

### Composables
- `app/composables/useToast.ts` (solo se usaba dentro de `/train`)

### Stores (Pinia)
- `app/stores/active-workout.store.ts`
- `app/stores/auth.store.ts`
- `app/stores/feed.store.ts`
- `app/stores/template.store.ts`

### Servicios (Firebase)
- `app/services/auth.service.ts`
- `app/services/exercise.service.ts`
- `app/services/feed.service.ts`
- `app/services/profile.service.ts`
- `app/services/template.service.ts`
- `app/services/workout.service.ts`
- `app/services/xp.service.ts`

### Types
- `app/types/auth.ts`
- `app/types/exercise.ts`
- `app/types/feed.ts`
- `app/types/template.ts`
- `app/types/user.ts`
- `app/types/workout.ts`

### Plugins
- `app/plugins/02.auth.client.ts` (inicializa `authStore`, que desaparece)
- Se conserva `app/plugins/01.firebase.client.ts` — solo inicializa la app de Firebase, sin dependencias de lo anterior, y lo reutilizará el CMS.

### Referencias a actualizar (no borrar el archivo, quitar el enlace)
- `app/components/AppNavbar.vue` — quitar links a `/train/auth/login` y `/train/auth/register`
- `app/components/HeroSection.vue` — quitar link a `/train/auth/login`
- `app/components/landing/CtaSection.vue` — quitar link a `/train/auth/register`
- `app/pages/pricing.vue` — quitar los dos links a `/train/auth/register`
- `nuxt.config.ts` — quitar la `routeRule` `'/train/**': { ssr: false }` (ya no aplica a nada)

## Nueva ruta /cms

- Archivo: `app/pages/cms/index.vue`
- Contenido: texto "Hola mundo", estilo dark mode consistente con el resto del sitio (fondo `forge-bg`, texto `forge-text`), sin lógica.
- Sin middleware de auth, sin layout custom (usa `default`).
- Placeholder puro — el diseño real llegará después en un spec propio.

## Verificación

- `npm run build` (o el comando de generate configurado) debe completar sin errores de tipos ni imports rotos.
- Navegar a `/` y `/pricing` y confirmar que no quedan botones de login/registro ni enlaces rotos.
- Navegar a `/cms` y confirmar que muestra "Hola mundo".
- Confirmar que ninguna ruta bajo `/train` sigue existiendo.
