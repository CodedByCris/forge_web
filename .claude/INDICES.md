# Índices de Firestore

Mismo backend que la app móvil (`gym-app-41fd6`) → mismos índices compuestos. La fuente de verdad y el despliegue viven en `forge` (`firestore.indexes.json`, `firebase deploy --only firestore:indexes`) — este repo no declara ni despliega índices propios, solo documenta aquí una copia sincronizada para saber qué queries están soportadas antes de escribir una nueva pantalla en `/cms`.

Ver `forge/.claude/INDICES.md` para el detalle completo y el proceso de añadir uno nuevo.

Última sincronización: 2026-08-09 (añadidos `getting_started_items` y `whats_new_items`).

---

## Índices activos (resumen)

| Colección | Campos | Para qué |
|---|---|---|
| `workouts` | `userId ASC, startedAt DESC, __name__ DESC` | Historial de un usuario, más reciente primero |
| `workouts` | `isCompleted ASC, userId ASC, startedAt DESC, __name__ DESC` | Historial filtrando completados |
| `workouts` | `userId ASC, isCompleted ASC, startedAt ASC, __name__ ASC` | Detectar draft/entreno en curso |
| `workouts` | `userId ASC, startedAt ASC, __name__ ASC` | Orden cronológico ascendente (progresión) |
| `posts` | `userId ASC, createdAt DESC, __name__ DESC` | Posts de un usuario, más reciente primero |
| `workout_duels` | `code ASC, status ASC` | Unirse a duelo por código |
| `notifications` | `toUid ASC, createdAt DESC, __name__ DESC` | Bandeja de notificaciones |
| `notifications` | `fromUid ASC, toUid ASC, type ASC, status ASC` | Comprobar notificación duplicada |
| `routines` | `visibility ASC, createdAt DESC, __name__ DESC` | Rutinas públicas |
| `routines` | `visibility ASC, userId ASC, createdAt DESC, __name__ DESC` | Rutinas públicas de un usuario |
| `follows` | `followerId ASC, status ASC` | Listar seguidos por estado |
| `shop_items` | `isActive ASC, sortOrder ASC, __name__ ASC` | Catálogo activo ordenado |
| `faq` | `isActive ASC, order ASC, __name__ ASC` | Requerido por la app móvil (`where(isActive) + orderBy(order)`). El listado de `/cms/faq` (`getFaqs()`) solo hace `orderBy('order')` sin filtro, así que no lo necesita, pero comparte colección — no lo borres. |
| `getting_started_items` | `isActive ASC, order ASC, __name__ ASC` | Requerido por la app móvil (guía de inicio). `/cms` (`getGettingStartedItems()`) solo hace `orderBy('order')` sin filtro, así que no lo necesita, pero comparte colección — no lo borres. |
| `whats_new_items` | `isActive ASC, order ASC, __name__ ASC` | Requerido por la app móvil (pantalla de novedades). `/cms` (`getWhatsNewItems()`) solo hace `orderBy('order')` sin filtro, así que no lo necesita, pero comparte colección — no lo borres. |

---

## Al implementar `/cms`

El panel de admin va a necesitar listados/paginación/filtros que la app móvil nunca hace (ej. `users` paginado por `createdAt`, `gyms` filtrado por estado de moderación, `posts` reportados). Cuando una query de `/cms` falle con `FAILED_PRECONDITION`:

1. No crear el índice solo desde el link de error de la consola de Firebase.
2. Añadirlo a `forge/firestore.indexes.json` y desplegarlo desde ahí (`firebase deploy --only firestore:indexes`).
3. Actualizar `forge/.claude/INDICES.md` (fuente de verdad) y replicar la fila aquí.
