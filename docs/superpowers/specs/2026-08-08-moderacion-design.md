# Moderación (Posts + Rutinas públicas) — CMS + Firestore rules

## Contexto

Séptimo sub-proyecto del CMS. El planteamiento original en
`forge/docs/admin_dashboard.md` describía "Moderación" como una cola de
contenido *reportado* por usuarios, con acciones "ignorar / eliminar /
banear". Verificado: **no existe ningún mecanismo de reportar contenido en
la app móvil** (sin botón, sin campo `isReported`/`reportsCount`, sin
colección `reports`) — esa cola estaría permanentemente vacía tal como se
planteó originalmente.

## Decisiones (confirmadas con el usuario)

- **Moderación proactiva sobre contenido existente**, no cola de reportes.
  El CMS lista posts y rutinas públicas recientes y permite eliminar
  cualquiera directamente, sin depender de que un usuario lo reporte
  primero. Construir el sistema de reportes en la app es su propio
  sub-proyecto (cross-repo, como "banear" en el spec de Usuarios) — no
  incluido aquí.
- **Dos secciones: Posts y Rutinas públicas** (tabs simples dentro de
  `/cms/moderacion`, sin rutas separadas).
- **Solo eliminar** — sin editar contenido ajeno, sin "ignorar" (no aplica
  sin sistema de reportes).
- **Subcolecciones huérfanas al borrar, aceptado.** `posts/{id}/likes`,
  `posts/{id}/reactions`, `routines/{id}/comments` no se borran en cascada
  (Firestore no lo hace automáticamente). Datos inaccesibles sin impacto
  visible tras borrar el doc padre — no se complica el diseño con borrado
  recursivo para un caso de uso de moderación ocasional.
- **Sin paginación cursor**, fetch de los más recientes con límite (a
  definir el número exacto en el plan, orden `createdAt desc`) — se amplía
  si hace falta más adelante.
- **Commits**: autorizados en `forge_web`. No autorizados en `forge`
  (Firestore rules).

## Firestore rules (`forge/firestore.rules`) — dos reglas ampliadas

Ambos bloques (`posts`, `routines`) ya existen — solo se amplía la condición
de `allow delete`, sin tocar nada más de cada bloque:

```javascript
// posts/{postId} (línea 173 actual)
allow delete: if isOwner(resource.data.userId) || isAdmin();

// routines/{routineId} (línea 207 actual)
allow delete: if isOwner(resource.data.userId) || isAdmin();
```

Verificado que ninguna otra regla de esos bloques (`read`, `create`,
`update`, ni las subcolecciones `likes`/`reactions`/`comments`) necesita
cambios — el admin solo necesita poder invocar `deleteDoc` sobre el
documento principal.

## CMS (`forge_web`) — `/cms/moderacion`

```
app/
  types/cms/moderation.ts        # CmsModeratedPost, CmsModeratedRoutine
  services/cms/moderation.service.ts  # getRecentPosts, getRecentRoutines, deletePost, deleteRoutine
  stores/cms/moderation.store.ts
  components/cms/moderation/
    PostModerationRow.vue
    RoutineModerationRow.vue
  pages/cms/moderacion/
    index.vue
```

- Página con dos tabs: "Posts" / "Rutinas públicas" (estado local, sin
  rutas separadas).
- **Posts**: lista los 50 más recientes (`orderBy('createdAt', 'desc'),
  limit(50)`) — avatar + nickname del autor, nombre del workout
  (`workoutName`), `likesCount`/`commentsCount`, fecha, botón eliminar.
- **Rutinas**: lista las 50 más recientes con `visibility == 'public'`
  (`where('visibility', '==', 'public'), orderBy('createdAt', 'desc'),
  limit(50)`) — avatar + nickname del autor, nombre de la rutina,
  `likesCount`/`commentsCount`, fecha, botón eliminar.
- Eliminar: `ConfirmModal` (ya existe, reutilizado) antes de `deleteDoc`,
  con el nombre del contenido en el mensaje de confirmación.
- Sidebar: "Moderación" deja de estar en `comingSoon`, pasa a `NuxtLink`
  real a `/cms/moderacion`.

## Manejo de errores

- Fetch de posts/rutinas falla → `EmptyState` con mensaje + reintentar
  (mismo patrón que el resto del CMS).
- Sin contenido → `EmptyState` "No hay posts/rutinas que mostrar" (no un
  listado vacío silencioso).
- Eliminar falla → mensaje inline (mismo patrón que Usuarios/FAQ/Legal), con
  el código real de Firebase si es `permission-denied` (mismo enfoque de
  diagnóstico ya aplicado tras el bug de Notificaciones).

## Fuera de alcance

- Sistema de reportes en la app móvil (botón "reportar", colección
  `reports`) — su propio sub-proyecto si se pide.
- Editar contenido ajeno.
- Banear al autor desde este módulo (ya fuera de alcance del módulo
  Usuarios, se mantiene igual aquí).
- Borrado en cascada de subcolecciones.
- Paginación cursor-based (revisar si el volumen de posts/rutinas crece
  mucho más allá de 50 recientes).

## Verificación

- `forge/firestore.rules`: dry-run limpio, deploy, confirmar que el admin
  puede borrar un post/rutina de OTRO usuario (antes del deploy, un intento
  de borrado ajeno debe fallar con `permission-denied`; después, debe
  funcionar). Confirmar que un usuario no-admin sigue sin poder borrar
  contenido ajeno (la rama `isOwner` no cambia).
- `forge_web`: `npm run generate` sin errores; `/cms/moderacion` lista
  posts y rutinas reales, elimina correctamente en ambas pestañas,
  confirmado en Firestore que el documento desaparece.
