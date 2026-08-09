# Novedades — CMS + Backend + App móvil

## Contexto

Primera de tres sub-features pedidas en la misma sesión (Novedades, Tienda
en el CMS, Guía de inicio → CMS) — se aborda esta primera, feature a
feature, según pide `forge_web/.claude/CLAUDE.md`.

Hallazgo relevante (repo `forge`, Flutter): hoy existe un carrusel de
bienvenida hardcodeado, `lib/features/onboarding/presentation/screens/introduction_screen.dart`
(4 páginas: FORGE/Workouts/Compete/Progress, título+subtítulo+imagen
opcional), disparado desde `splash_screen.dart` mediante una key booleana
`intro_viewed` en `SharedPreferences`. Este mecanismo es **exclusivo de
usuarios nuevos, antes de login** — el propio código lo bloquea
explícitamente para cualquier usuario ya autenticado (`alreadySignedIn`
fuerza `intro_viewed = true` sin mostrar nada). Por diseño no puede servir
para "forzar reaparición a todos" ni para avisos post-actualización a
usuarios existentes.

No existe ninguna otra feature de tipo "what's new"/"release notes" en el
código (confirmado por búsqueda exhaustiva). "Guía de inicio" —
`getting_started_screen.dart`, accesible desde Settings → Soporte — es una
feature **distinta** (5 secciones hardcodeadas con ilustraciones
custom-painted) y queda fuera de este spec (siguiente sub-feature).

## Decisiones (confirmadas con el usuario)

- **Se implementan las tres capas**: schema/rules (Firestore, repo `forge`),
  CMS (`forge_web`), y app móvil (`forge`, Flutter/Riverpod) — en la misma
  sesión.
- **Lista única vigente**, sin historial de tandas versionadas. Se edita
  libremente (crear/editar/borrar/activar/desactivar), igual que
  Ejercicios/FAQ.
- **Reordenamiento manual con botones subir/bajar** (a diferencia de FAQ,
  donde el orden de creación basta — aquí el orden de las pantallas del
  carrusel importa).
- **Imagen opcional** por pantalla (fallback visual si no hay imagen, igual
  que ya pasa con la página de bienvenida actual sin imagen real).
- **Sin vídeo en esta ronda.** No se añade `video_player` ni campos de
  vídeo — puede añadirse más adelante si hace falta (YAGNI).
- **Forzado de reaparición vía contador de versión**
  (`config/appConfig.whatsNewVersion`, bump manual desde un botón del CMS),
  mismo patrón ya usado para `exercisesCacheKey`. Cubre a la vez "primera
  vez" (contador local inexistente cuenta como `0`) y "forzar tras una
  actualización" (el admin edita contenido + pulsa el botón como parte de
  su proceso de release) — **sin** lógica de detección automática de
  versión de app instalada.
- **Se reemplaza por completo el mecanismo actual.** `introduction_screen.dart`
  y su gate en `splash_screen.dart` (incluida la key `intro_viewed`) se
  retiran — código muerto tras el cambio, no se dejan huérfanos. El nuevo
  disparo vive en Home, después de login, y aplica igual a usuarios nuevos
  y existentes.
- **Nuevo ajuste "Novedades"** en Settings → Soporte (junto a "Guía de
  inicio"): reabre el carrusel en modo repaso, sin condición de versión.
- **Lectura solo autenticado, escritura solo admin** — igual que
  `exercises`/`shop_items`/`shop_collections`/`config` (no como `faq`, que
  es de lectura pública; aquí no hay necesidad de mostrarlo en la portada).
- **Commits**: el trabajo en ambos repos queda en el working tree sin
  commitear — el usuario decide cuándo y qué commitear (regla vigente de
  `forge_web/.claude/CLAUDE.md`, aplicada también a `forge` en esta
  sesión).

## Esquema Firestore y rules

```typescript
// whats_new_items/{itemId}
{
  title: string
  description: string
  imageUrl: string | null
  isActive: boolean
  order: number          // = Date.now() al crear; editable con mover arriba/abajo (swap de order con el vecino)
  createdAt: Timestamp
  updatedAt: Timestamp
}

// config/appConfig (documento ya existente, se añade un campo)
{
  exercisesCacheKey: string   // ya existente, sin cambios
  whatsNewVersion: number     // nuevo, default 0
}
```

Storage: `whats_new/{itemId}/photo.jpg` (mismo patrón que
`exercises/{id}/photo.jpg`, subida/borrado desde el CMS).

Bloque nuevo en `forge/firestore.rules` (no modifica ningún bloque
existente; `config` ya está cubierto por su regla actual, no requiere
cambio):

```javascript
match /whats_new_items/{itemId} {
  allow read: if request.auth != null;
  allow write: if isAdmin();
}
```

Actualizar en paralelo `forge/.claude/BACKEND.md` y
`forge_web/.claude/BACKEND.md` con la colección nueva y el campo nuevo de
`config/appConfig`, para mantener ambos documentos sincronizados según
exige `forge_web/.claude/CLAUDE.md`.

## CMS (`forge_web`) — `/cms/novedades`

Mismo patrón de capas que Ejercicios (imagen opcional con subir/cambiar/
eliminar) + FAQ (listado simple con modal):

```
app/
  types/cms/whatsNew.ts               # CmsWhatsNewItem
  services/cms/whatsNew.service.ts    # getWhatsNewItems, createWhatsNewItem,
                                       # updateWhatsNewItem, deleteWhatsNewItem,
                                       # toggleActive, moveItem(id, 'up'|'down'),
                                       # uploadImage, deleteImage,
                                       # getWhatsNewVersion, bumpWhatsNewVersion
  stores/cms/whatsNew.store.ts
  components/cms/whatsNew/
    WhatsNewRow.vue                   # miniatura, título, badge activo/inactivo,
                                       # mover arriba/abajo, editar, eliminar
    WhatsNewFormModal.vue             # título, descripción, imagen (subir/cambiar/
                                       # eliminar, mismo widget que ejercicios/[id].vue)
  pages/cms/novedades/
    index.vue
```

- **Listado**: igual estructura visual que `/cms/faq`, con miniatura de
  imagen a la izquierda de cada fila (o icono fallback si no hay imagen) y
  flechas subir/bajar junto a editar/eliminar.
- **`WhatsNewFormModal.vue`**: input de texto (título) + textarea
  (descripción) + el mismo widget de imagen ya construido en
  `ejercicios/[id].vue` (preview 32×32, botones "Subir/Cambiar imagen" y
  "Eliminar imagen", input file oculto). Un único modal sirve para crear y
  editar.
- **`moveItem`**: intercambia el campo `order` con el ítem adyacente (según
  el array ya ordenado en memoria) y persiste ambos documentos.
- Eliminar: reutiliza `ConfirmModal.vue`. Toggle activo/inactivo: inline,
  sin confirmación.
- **Botón "Forzar reaparición"** en la cabecera de `index.vue`, junto al de
  "Nueva pantalla": abre `ConfirmModal` mostrando la versión actual y la
  siguiente ("Todos los usuarios volverán a ver las Novedades la próxima
  vez que abran la app. ¿Continuar?"); al confirmar, incrementa
  `whatsNewVersion` en 1.
- Sidebar: nueva entrada "Novedades" en `CmsSidebar.vue` → `/cms/novedades`.

## App móvil (`forge`, Flutter) — Clean Architecture + Riverpod

Mismo patrón que `features/faq` (lectura pura, sin escritura desde la
app):

```
lib/features/whats_new/
  data/
    datasources/
      whats_new_firestore_datasource.dart  # fetchActiveItems(): List<WhatsNewItemEntity>
                                            # fetchVersion(): int  (config/appConfig.whatsNewVersion)
    repositories/
      whats_new_repository_impl.dart
  domain/
    entities/
      whats_new_item_entity.dart           # id, title, description, imageUrl
    repositories/
      whats_new_repository.dart
  presentation/
    providers/
      whats_new_providers.dart             # whatsNewListProvider, whatsNewRemoteVersionProvider,
                                            # whatsNewShouldShowProvider (compara remoto vs SharedPreferences local)
    screens/
      whats_new_screen.dart                # carrusel rediseñado
```

- `WhatsNewFirestoreDatasource.fetchActiveItems()`: query
  `whats_new_items` con `where('isActive', isEqualTo: true).orderBy('order')`.
- `whats_new_screen.dart`: rediseño del carrusel actual (título +
  descripción + imagen con `Image.network`, o el mismo tipo de fallback
  visual con icono/gradiente que ya usa `introduction_screen.dart` cuando
  no hay imagen) — estética siguiendo el sistema de diseño ya existente de
  `forge`, sin inventar uno nuevo. Recibe un flag `isReplay` (para el
  disparo desde Settings, sin actualizar el contador local si se decide
  así, o actualizándolo igualmente — es indistinto, se actualiza siempre
  para simplicidad).
- **Disparo**: se retira el gate de `introduction_screen.dart` en
  `splash_screen.dart` (y la key `intro_viewed`, código muerto). El check
  se mueve al primer build de la pantalla Home (post-login, incluye
  usuarios recién registrados tras completar el wizard de onboarding y
  usuarios existentes que abren la app tras un "Forzar reaparición"): si
  `whatsNewSeenVersion` local `< whatsNewVersion` remoto y hay ítems
  activos, se empuja `WhatsNewScreen`; al cerrarla se persiste el nuevo
  valor visto en `SharedPreferences`.
- **Limpieza**: se elimina por completo
  `lib/features/onboarding/presentation/screens/introduction_screen.dart` y
  sus claves de localización exclusivas (`intro*` en
  `app_localizations_es.dart`/`_en.dart` y sus `.arb`) — código muerto tras
  el cambio, no se dejan huérfanas. `onboarding_wizard_screen.dart` (wizard
  de perfil: objetivo/nivel/frecuencia/username) no se toca, es una feature
  distinta.
- **Nuevo ajuste en Settings**: tile "Novedades" en la sección Soporte
  (`settings_screen.dart`, junto a "Guía de inicio"), nueva clave i10n
  `settingsSupportWhatsNew` en `app_localizations_es.dart`/`_en.dart`, abre
  `WhatsNewScreen` en modo repaso (sin condición de versión, siempre
  muestra los ítems activos actuales).

## Manejo de errores

- **CMS**: fetch de Novedades falla → `EmptyState` con mensaje + reintentar
  (mismo patrón que Ejercicios/FAQ). Crear/editar/eliminar/mover/forzar
  falla → mensaje inline (mismo patrón que el resto de módulos).
- **App móvil**: si `whatsNewListProvider` falla o devuelve lista vacía, no
  se muestra el carrusel (falla silenciosa — no debe bloquear la entrada a
  Home). El check de versión solo dispara la pantalla si hay datos
  cargados correctamente.
- Sin tests en ningún repo (regla ya establecida).

## Fuera de alcance

- Tandas versionadas con historial.
- Vídeo (imagen únicamente).
- Detección automática de versión de app instalada.
- Guía de inicio y Tienda del CMS (siguientes sub-features, specs propios).

## Verificación

- `forge_web`: `npm run generate`/type-check sin errores; `/cms/novedades`
  lista, crea, edita, reordena, activa/desactiva, elimina y sube/quita
  imagen correctamente contra la colección real; "Forzar reaparición"
  incrementa `whatsNewVersion` en Firestore.
- `forge/firestore.rules`: dry-run limpio antes de desplegar; lectura
  autenticada a `whats_new_items` funciona, lectura anónima falla, escritura
  sin `isAdmin` falla.
- `forge` (Flutter): `flutter analyze` sin errores nuevos; un usuario nuevo
  ve "Novedades" al entrar por primera vez a Home; un usuario existente no
  la ve de nuevo hasta que se pulse "Forzar reaparición" desde el CMS, tras
  lo cual vuelve a aparecer al reabrir la app; el ajuste "Novedades" en
  Settings reabre el carrusel bajo demanda; `introduction_screen.dart` y
  `intro_viewed` quedan eliminados sin referencias colgantes.
