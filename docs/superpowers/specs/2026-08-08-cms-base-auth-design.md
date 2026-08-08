# CMS — Base, autenticación y layout

## Contexto

`/cms` existe hoy como placeholder ("Hola mundo", ver spec
`2026-08-08-remove-train-add-cms-design.md`). El objetivo final es un panel de
administración que cubra todos los datos del ecosistema (usuarios, ejercicios,
contenido legal/FAQ, moderación, notificaciones push, configuración global) —
demasiado grande para un único spec. Se descompone en sub-proyectos
independientes, cada uno con su propio spec/plan:

1. **Este spec** — Base: autenticación de admin, layout, sidebar, arquitectura
   de capas para todo lo que vendrá después.
2. Ejercicios (edición completa + imagen)
3. Legal (política de privacidad, términos)
4. FAQ
5. Usuarios (listado, detalle, acciones)
6. Moderación
7. Notificaciones push
8. Configuración global

El orden 2-8 es una propuesta, no una decisión cerrada — se confirma antes de
cada uno. Analytics y Gimnasios/Patrocinios/Premium (del planteamiento
original en `forge/docs/admin_dashboard.md`) quedan explícitamente **fuera de
scope** por ahora: Analytics no fue seleccionado por el usuario; Gimnasios y
Patrocinios dependen de colecciones Firestore que no existen todavía en
`forge` (features de la app aún no implementadas).

`forge/docs/admin_dashboard.md` y `admin_roadmap.md` (mayo 2026) planteaban
este panel como repo separado (`gym-app-admin`) con Clean Architecture
completa (domain/data/presentation, casos de uso, DI), Nuxt UI v2 y Firebase
Admin SDK server-side. Esas tres decisiones se **descartan explícitamente**
para este proyecto — ver Decisiones.

**Corrección 2026-08-08, tras diseñar la primera versión de este spec:** se
había acordado inicialmente escritura server-side con Firebase Admin SDK
(`server/api/cms/**` + sesión SSR). Se descubrió que `nuxt.config.ts` tiene
`nitro: { preset: 'static' }` — el sitio se genera estático y se sube por FTP
a Hostinger shared hosting, **sin runtime de Node en producción**. Esas rutas
`server/api/**` no existirían fuera de `npm run dev`. Se revisó el patrón ya
usado en producción en `Huby-CMS` (mismo Hostinger, mismo tipo de proyecto:
panel de admin sobre Firebase) y se adopta el mismo enfoque: **100%
client-side**, sin servidor propio. Ver Decisiones actualizadas.

## Decisiones (confirmadas con el usuario)

- **Client-side puro, sin servidor propio — mismo patrón que `Huby-CMS`.**
  El CMS usa el Firebase SDK modular client-side (el mismo que ya usa la
  portada), igual que el resto del repo. No hay `server/`, no hay Firebase
  Admin SDK, no hay sesión SSR — coherente con que el sitio se genera estático
  (`nitro.preset: 'static'`) y se despliega por FTP a Hostinger sin Node.
  `Huby-CMS` (Vite + Vue, mismo hosting) ya resuelve exactamente este problema
  así, en producción, hoy. Ver Flujo de autenticación para el detalle
  replicado de `Huby-CMS/src/features/auth/stores/authStore.ts`.
- **Un único admin por ahora, extensible a más.** Se añade un campo nuevo
  `users/{uid}.isAdmin: boolean` (no `role: string` como proponía el plan
  antiguo). Solo el usuario actual lo tendrá en `true`. Pensado para poder dar
  acceso a un ayudante en el futuro sin cambiar el modelo.
- **Sin Clean Architecture de casos de uso.** Se sigue el patrón de capas ya
  definido en `CLAUDE.md` para todo el repo: `services/` (Firebase client SDK)
  → `stores/` (Pinia) → `composables/` → `pages/` (solo layout) →
  `components/` (UI pura). Sin entities/repositories-como-interfaces/casos-de-uso
  separados — ceremonia
  innecesaria para un panel de un único desarrollador.
- **Sin Nuxt UI.** Tailwind puro + componentes propios (`DataTable`,
  `ConfirmModal`, `StatCard`, etc., construidos según hagan falta en cada
  sub-proyecto de contenido) + Lucide/Heroicons para iconos, tal como ya
  define `CLAUDE.md` para el resto del repo. Cero dependencias de UI nuevas.
- **Sin i18n, texto en español hardcodeado.** `CLAUDE.md` documenta
  `@nuxtjs/i18n` como parte del stack y "todos los textos mediante i18n" como
  regla, pero no está instalado ni usado en ningún punto del repo actual
  (tampoco en la portada). Montar i18n desde cero es su propia pieza de
  infraestructura — no algo a colar dentro de este sub-proyecto. El CMS sigue
  el patrón real del repo (texto directo en los componentes) hasta que se
  aborde i18n como proyecto propio, aplicado a todo el sitio.
- **Cero dependencias nuevas.** Firebase client SDK y Pinia ya están
  instalados; no hace falta nada más para este sub-proyecto.
- **Sidebar completo desde ya, contenido incremental.** Los 7 módulos de
  contenido (lista de la sección Contexto) aparecen en el sidebar desde este
  sub-proyecto, marcados "Próximamente" hasta que se implementen uno a uno.
  Da visibilidad del mapa completo del CMS sin fingir que ya existen datos.

## Arquitectura y estructura de carpetas

```
app/
  middleware/
    cms-auth.global.ts     # protege /cms/** (excepto /cms/login), client-side
  pages/
    cms/
      login.vue
      index.vue            # dashboard mínimo, sustituye el placeholder actual
  components/
    cms/
      layout/
        CmsSidebar.vue
        CmsTopbar.vue
      shared/
        StatCard.vue
        ConfirmModal.vue
        EmptyState.vue
  composables/
    cms/
      useCmsAuth.ts         # wrapper fino sobre el store para usar desde páginas/componentes
  stores/
    cms/
      auth.store.ts          # Pinia: login/logout/checkAdminStatus/waitForAuth (ver abajo)
```

Sin variables de entorno nuevas — reutiliza la config de Firebase ya presente
en `app/plugins/01.firebase.client.ts`.

## Flujo de autenticación

Réplica directa del patrón de
`Huby-CMS/src/features/auth/stores/authStore.ts`, adaptado a Nuxt/Pinia (el
store ya es Pinia en ambos proyectos, cambia poco):

1. `/cms/login`: formulario email + contraseña. Mismo patrón visual que la
   referencia de Huby CMS (logo centrado, campos email/contraseña, botón
   primario ancho), adaptado a la paleta dark fitness de este proyecto.
2. `stores/cms/auth.store.ts` expone `login(email, password)`:
   - `signInWithEmailAndPassword(auth, email, password)` (Firebase Auth
     client-side, mismo SDK ya usado en el resto del repo).
   - Lee `users/{uid}` en Firestore (client SDK) y comprueba
     `data.isAdmin === true`.
   - Si no es admin: `signOut(auth)` inmediato + `error.value` con mensaje
     claro — nunca deja una sesión de Firebase Auth "a medias" en un usuario
     no-admin.
   - Si es admin: guarda `user` e `isAdmin` en el store; el login se
     considera completo.
3. `isAuthenticated` es un computed `user !== null && isAdmin === true` — la
   fuente de verdad para el middleware, nunca solo "hay un `currentUser` de
   Firebase Auth".
4. `waitForAuth()`: envuelve `onAuthStateChanged` en una promesa que resuelve
   una sola vez, para el primer render (recarga de página con sesión ya
   iniciada) — evita el parpadeo de "no autenticado" mientras Firebase Auth
   restaura la sesión desde `localStorage`.
5. `init()`: se llama en un plugin `app/plugins/02.cms-auth.client.ts`,
   suscribe `onAuthStateChanged` de forma continua (detecta login/logout en
   otra pestaña, expiración de token, etc.), aplicando la misma verificación
   de `isAdmin` que `login()`.
6. `cms-auth.global.ts` (middleware Nuxt, se ejecuta client-side —
   coherente con `nitro.preset: 'static'`, sin proceso servidor en
   producción): en cualquier ruta bajo `/cms/**` excepto `/cms/login`, si
   `!authStore.initialized` espera `waitForAuth()`; si
   `!authStore.isAuthenticated`, redirige a `/cms/login`.
7. Logout: botón en `CmsSidebar.vue` → `authStore.logout()` →
   `signOut(auth)` + limpia estado del store → redirige a `/cms/login`.

**Nota de seguridad explícita**: este flujo protege el acceso a la interfaz
del CMS (gate de login + gate de UI). No cierra las Firestore/Storage rules
públicas de `gym-app-41fd6` — sigue siendo la decisión pendiente ya marcada
en `CLAUDE.md`, fuera de alcance de este spec. A diferencia del proyecto
Firebase de `Huby-CMS` (que sí tiene rules cerradas reales), aquí las rules
siguen en `allow read, write: if true`: cualquiera con la config pública de
Firebase (siempre expuesta en cualquier bundle client-side, en cualquier
proyecto) podría en teoría leer/escribir Firestore directo sin pasar por el
CMS en absoluto. El login del CMS no cambia esa exposición — solo evita que
alguien sin la contraseña de admin use la interfaz cómoda del panel. Cerrar
esa brecha real requiere cerrar las rules (con reglas basadas en
`isAdmin`, análogas a las de `Huby`), decisión explícita pendiente y fuera de
este sub-proyecto.

## Layout y sidebar

Paleta: `tailwind.config.ts` ya define un token `forge.*` (usado en toda la
portada) prácticamente idéntico al propuesto en `admin_dashboard.md` — se
reutiliza en vez de duplicar:

```
forge-bg (#0F0F0F) · forge-surface (#1A1A1A) · forge-surfaceAlt (#242424)
forge-divider (#2A2A2A) · forge-primary (#FF6200) · forge-accent (#FF9A3C)
forge-text (#EEEEEE) · forge-textSec (#CCCCCC) · forge-muted (#666666)
forge-success (#10B981) · forge-xp (#8B5CF6)
```

Solo faltan dos tokens (estados de moderación/config que vendrán en
sub-proyectos futuros, pero se añaden ya para no tocar el config dos veces):
`forge-warning: #F59E0B` y `forge-danger: #EF4444`, añadidos a la sección
`colors.forge` de `tailwind.config.ts`.

- `CmsSidebar.vue`: 240px, colapsable en móvil (mobile-first). Items: Dashboard,
  Ejercicios, Legal, FAQ, Usuarios, Moderación, Notificaciones, Configuración.
  Los módulos sin página implementada aún se muestran deshabilitados con badge
  "Próximamente" en vez de ocultarse. Pie: email del admin + botón cerrar
  sesión.
- `CmsTopbar.vue`: breadcrumb simple, nada más (sin búsqueda global ni
  notificaciones — YAGNI hasta que haga falta).
- `pages/cms/index.vue`: dashboard mínimo. Sin KPIs falsos — mientras no haya
  módulos con datos reales, muestra un estado vacío honesto ("Aún no hay
  módulos con datos — empieza por Ejercicios") en vez de StatCards con ceros
  que parecen datos reales.
- Microinteracciones (según `CLAUDE.md`): sidebar item activo fade +
  translateX 150ms ease-out; transición de página 300ms.

## Manejo de errores

- Login fallido (credenciales inválidas Firebase Auth, red, usuario sin
  `isAdmin`): mensaje inline en el formulario vía `error.value` del store
  (mapeo de códigos `auth/*` a texto en español, igual que
  `Huby-CMS/authStore.ts::mapFirebaseError`), sin redirección — no se pierde
  el email ya escrito.
- Sesión de Firebase Auth expira / usuario pierde `isAdmin` mientras navega:
  `onAuthStateChanged` en `init()` lo detecta y el middleware redirige a
  `/cms/login` en la siguiente navegación.
- Firestore inalcanzable al comprobar `isAdmin` en login: mismo tratamiento
  que un login fallido — mensaje inline, no crashea la página.
- Sin tests (regla del proyecto). Verificación manual del flujo
  login/logout/redirect antes de cerrar este sub-proyecto.

## Esquema Firestore — campo nuevo

`users/{uid}.isAdmin: boolean` — nuevo campo, no existe hoy. Igual que en
`Huby-CMS`, **nadie lo escribe desde código** — se asigna a mano en la
consola de Firebase. Al implementar, hay que:
1. Añadir `isAdmin: true` manualmente al usuario admin en Firestore (el
   propio usuario) desde la consola de Firebase.
2. Reflejarlo en `BACKEND.md` de este repo **y** en `forge/.claude/BACKEND.md`
   (regla de sincronización ya definida en `CLAUDE.md` — los campos
   compartidos no pueden divergir entre repos).

## Fuera de alcance de este spec

- Contenido real de cualquier módulo (Ejercicios, Legal, FAQ, Usuarios,
  Moderación, Notificaciones, Configuración) — cada uno es su propio
  sub-proyecto con su propio spec.
- Analytics, Gimnasios, Patrocinios, Premium — no seleccionados / dependen de
  features de `forge` aún no implementadas.
- Cierre de las Firestore/Storage security rules.
- Múltiples admins simultáneos, roles granulares, audit log (`admin_logs/`),
  rate limiting — se revisan si/cuando se necesiten, no ahora.

## Verificación

- `npm run build` (o `npm run generate`, el comando real de este repo)
  completa sin errores de tipos ni imports rotos.
- Login con el usuario admin (`isAdmin: true`) → entra a `/cms`, ve el
  sidebar completo, los 7 módulos aparecen como "Próximamente".
- Login con un usuario sin `isAdmin` (o sin cuenta) → error inline claro, no
  entra, no queda sesión de Firebase Auth colgada (verificar en devtools →
  Application → que no hay usuario autenticado tras el intento fallido).
- Acceder a `/cms` sin sesión → redirige a `/cms/login`.
- Cerrar sesión → vuelve a `/cms/login`, y volver a entrar a `/cms`
  directamente por URL también redirige a login.
- Sesión persiste tras recargar la página (Firebase Auth restaura desde
  `localStorage`, sin parpadeo de "no autenticado" gracias a `waitForAuth()`).
