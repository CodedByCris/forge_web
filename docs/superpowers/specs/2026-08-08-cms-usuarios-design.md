# CMS — Módulo Usuarios

## Contexto

Segundo sub-proyecto del CMS (el primero, Base + Auth, ya está construido:
login, layout, sidebar con los 7 módulos marcados "Próximamente"). Este spec
cubre el módulo **Usuarios**: listado, detalle, y un conjunto acotado de
acciones de moderación.

Volumen real en producción (`gym-app-41fd6`, verificado 2026-08-08): **18
usuarios**. Esto condiciona el diseño — no hace falta paginación
cursor-based ni virtualización de tabla; un fetch completo con filtro/orden
en cliente es más simple y perfectamente suficiente hasta que el volumen
crezca varios órdenes de magnitud.

## Decisiones (confirmadas con el usuario)

- **Borrado GDPR real queda fuera de alcance, permanentemente para este
  proyecto tal como está arquitecturado.** El SDK de Firebase Auth
  client-side solo permite borrar la sesión propia (`auth.currentUser`),
  nunca la cuenta de otro usuario — eso requiere Admin SDK, y este CMS es
  100% client-side (decisión ya tomada en el spec de Base+Auth). Borrar solo
  el documento de Firestore dejaría la cuenta de Auth huérfana (el usuario
  seguiría pudiendo loguearse, sin datos) — peor que no ofrecer la acción.
  Si se necesita en el futuro, es su propio sub-proyecto con backend.
- **Banear/desbanear queda fuera de este sub-proyecto.** Requeriría no solo
  un campo `isBanned` nuevo, sino que la app móvil (`forge`) chequee ese
  campo en su `AuthGate` para que el baneo tenga efecto real — coordinación
  de producto cruzada con `forge`, no solo una regla de Firestore. Se
  revisa como sub-proyecto propio si hace falta.
- **Acciones de moderación incluidas: ajustar XP/coins y resetear racha.**
  Ambas son escrituras acotadas a campos concretos de `users/{uid}` de otro
  usuario, viables una vez ampliadas las Firestore rules (ver más abajo).
- **Ajuste de XP/coins por delta, no valor absoluto.** El admin escribe
  cuánto sumar/restar (puede ser negativo), usando `FieldValue.increment` —
  coherente con el patrón ya documentado en `BACKEND.md` para XP/coins, más
  seguro que fijar un valor absoluto sin ver el estado actual exacto.
- **Detalle de usuario: perfil + acciones + historial de workouts.** Sin
  PRs, sin badges, sin plantillas, sin objetivos — quedan fuera por ahora,
  se añaden si hace falta más adelante como extensión de este módulo.
- **Mismo patrón de capas y de UI que Base+Auth**: `services → stores →
  composables → pages → components`, Tailwind puro (paleta `forge.*` ya
  existente), sin Nuxt UI, sin i18n, sin tests, sin commits automáticos.

## Cambio de Firestore rules (repo `forge`, fuera de este repo)

Las rules actuales (`forge/firestore.rules`, desplegadas 2026-08-08) permiten
que un usuario con `isAdmin == true` escriba en `exercises`, `shop_items`,
`shop_collections`, `config` — pero no mencionan `users`. Sin un cambio ahí,
las dos acciones de moderación de este módulo fallarán con
`permission-denied`.

**Regla nueva a añadir** (acotada — el admin solo puede tocar estos tres
campos del documento de *otro* usuario, nunca `isAdmin`, `email`, ni
cualquier otro):

```javascript
match /users/{userId} {
  // ... reglas existentes (lectura autenticada, escritura propia, etc.) ...

  // Admin del CMS puede ajustar XP/coins/racha de cualquier usuario,
  // pero solo esos tres campos — nunca isAdmin ni datos de perfil.
  allow update: if isAdmin() &&
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['totalXp', 'coins', 'currentStreak']);
}
```

**Proceso de despliegue**: yo preparo el diff exacto sobre
`forge/firestore.rules`; el usuario revisa y ejecuta
`firebase deploy --only firestore:rules` desde el repo `forge` (o confirma
explícitamente para que lo haga otra sesión) — mismo patrón de confirmación
ya usado para escribir `isAdmin: true` en producción. No se despliega nada
sin esa confirmación explícita.

## Arquitectura y estructura de carpetas

```
app/
  services/
    cms/
      users.service.ts
      # getUsers(): Promise<CmsUser[]>
      # getUserWorkouts(uid: string, limitCount?: number): Promise<CmsWorkoutSummary[]>
      # adjustUserXp(uid: string, deltaXp: number): Promise<void>
      # adjustUserCoins(uid: string, deltaCoins: number): Promise<void>
      # resetUserStreak(uid: string): Promise<void>
  stores/
    cms/
      users.store.ts
      # lista de usuarios, usuario seleccionado, loading/error, acciones que llaman a users.service.ts
  pages/
    cms/
      usuarios/
        index.vue      # listado
        [uid].vue       # detalle
  components/
    cms/
      users/
        UserRow.vue
        UserDetailHeader.vue
        AdjustXpCoinsModal.vue
        ResetStreakModal.vue
      shared/
        StatCard.vue    # se crea aquí — primer módulo que lo necesita de verdad
        ConfirmModal.vue
```

`StatCard.vue`/`ConfirmModal.vue` estaban mencionados como estructura
compartida en el spec de Base+Auth pero no se construyeron ahí por YAGNI (no
tenían caso de uso real todavía). Este es el primer módulo que sí los
necesita, así que se crean aquí.

## Listado de usuarios (`/cms/usuarios`)

- Fetch completo de la colección `users` (18 docs — sin cursor, sin
  paginación) al entrar a la página.
- **Columnas**: avatar (`photoUrl`, fallback iniciales de `nickname`) +
  `nickname`, `email`, `totalXp`, `coins`, `buildType` (chip), fecha de
  registro (`createdAt`), badge `isAdmin` si aplica.
- **Búsqueda**: input de texto que filtra client-side por `nickname` o
  `email` (sin debounce — volumen trivial).
- **Orden**: click en cabecera de columna (XP, coins, fecha de registro),
  toggle asc/desc.
- Click en fila → `navigateTo('/cms/usuarios/' + uid)`.

## Detalle de usuario (`/cms/usuarios/[uid]`)

- **Header** (`UserDetailHeader.vue`): avatar grande, `nickname`, `email`,
  fecha de registro, `buildType`, `activeTitle`, badges `isAdmin`/`isPrivate`
  si aplican.
- **Stats** (`StatCard.vue` × N): `totalXp`, `coins`, `currentStreak`,
  `followersCount`, `followingCount`.
- **Historial de workouts**: últimos 10 completados —
  `query(collection(db, 'workouts'), where('userId', '==', uid),
  where('isCompleted', '==', true), orderBy('startedAt', 'desc'),
  limit(10))`. Tabla: nombre, fecha, duración (`endedAt - startedAt` en
  minutos).
- Botones de acción (ver siguiente sección) en la cabecera o junto a los
  stats correspondientes.

## Acciones de moderación

### Ajustar XP / coins

`AdjustXpCoinsModal.vue`: dos inputs numéricos de delta (`deltaXp`,
`deltaCoins`), ambos opcionales/pueden quedar en 0. Al confirmar (con
`ConfirmModal.vue` obligatorio antes de aplicar):

```typescript
// services/cms/users.service.ts
import { doc, updateDoc, increment } from 'firebase/firestore'

export async function adjustUserXpCoins(
  uid: string,
  deltaXp: number,
  deltaCoins: number,
): Promise<void> {
  const updates: Record<string, ReturnType<typeof increment>> = {}
  if (deltaXp !== 0) updates.totalXp = increment(deltaXp)
  if (deltaCoins !== 0) updates.coins = increment(deltaCoins)
  if (Object.keys(updates).length === 0) return
  await updateDoc(doc(db, 'users', uid), updates)
}
```

Toast de éxito ("XP/coins actualizados") o error tras completar.

### Resetear racha

`ResetStreakModal.vue`: confirmación simple → `updateDoc(doc(db, 'users',
uid), { currentStreak: 0 })`. Toast de éxito/error.

## Manejo de errores

- Fetch de usuarios o del historial de workouts falla (red, permisos):
  `EmptyState` con mensaje de error + botón "Reintentar".
- Cualquier acción de moderación falla: toast de error con el código crudo
  de Firestore (`permission-denied` es el caso esperado mientras las rules
  nuevas no estén desplegadas en `forge` — no se oculta, ayuda a diagnosticar
  si el deploy ya se aplicó).
- Sin tests (regla del proyecto). Verificación manual antes de cerrar.

## Esquema Firestore — corrección de documentación

`users/{userId}.currentStreak: number` existe realmente en producción (mismo
documento Firestore que usa la app móvil) pero no estaba listado en
`forge_web/.claude/BACKEND.md` (sí en `forge/.claude/BACKEND.md`). Se añade
aquí para cerrar la divergencia de documentación entre repos (regla de
sincronización de `CLAUDE.md`).

## Fuera de alcance de este spec

- Borrado GDPR real (requiere backend, ver Decisiones).
- Banear/desbanear (requiere coordinación de producto con `forge`, ver
  Decisiones).
- PRs, badges, plantillas, objetivos en el detalle de usuario.
- Paginación cursor-based (innecesaria al volumen actual; revisar si el
  número de usuarios crece significativamente).
- Exportar CSV, filtros avanzados (nivel mínimo/máximo, con racha activa,
  etc.) — no pedidos, se añaden si hacen falta.

## Verificación

- `npm run generate` completa sin errores.
- Listado `/cms/usuarios` muestra los 18 usuarios reales, búsqueda y orden
  por columna funcionan.
- Click en un usuario → detalle muestra perfil, stats y últimos workouts
  reales de ese usuario.
- Antes de que las rules nuevas estén desplegadas en `forge`: ajustar
  XP/coins o resetear racha falla con `permission-denied`, mostrado como
  toast de error (comportamiento esperado, confirma que las rules viejas
  siguen protegiendo correctamente).
- Después del deploy de rules (confirmado explícitamente por el usuario):
  ajustar XP/coins con delta positivo y negativo funciona y se refleja en
  Firestore; resetear racha pone `currentStreak` a 0.
- La escritura de moderación **nunca** puede tocar `isAdmin`, `email` u
  otros campos fuera de `totalXp`/`coins`/`currentStreak` — verificar que
  las rules realmente lo bloquean (intentar, vía consola o script, escribir
  otro campo con el usuario admin autenticado y confirmar que las rules lo
  rechazan).
