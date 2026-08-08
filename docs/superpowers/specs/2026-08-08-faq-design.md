# FAQ — CMS + Backend + App móvil

## Contexto

Tercer sub-proyecto del CMS, pero a diferencia de Base+Auth y Usuarios, este
toca tres repos: `forge_web` (CMS, gestión de contenido), `forge` (app
móvil, Flutter — consumo de contenido) y las Firestore rules compartidas
(en `forge`).

Hallazgo relevante: la app móvil **ya tiene** una pantalla FAQ
(`forge/lib/features/profile/presentation/screens/faq_screen.dart`), pero
con 3 preguntas fijas vía i18n (`app_localizations_es.dart`/`_en.dart`,
claves `faqTitle`/`faqQ1`/`faqA1`/`faqQ2`/`faqA2`/`faqQ3`/`faqA3`) — no lee
de Firestore. Este spec reemplaza ese contenido fijo por lectura real de una
colección nueva, gestionable desde el CMS.

`Huby-CMS` tiene un módulo FAQ real (`faqStore.ts` + `faq.model.ts`) usado
como referencia de patrón (colección con `order`, `isActive`, timestamps) —
simplificado aquí porque el suyo incluye adjuntos multimedia no pedidos.

## Decisiones (confirmadas con el usuario)

- **Se implementan las tres capas**: schema/rules (Firestore, repo `forge`),
  CMS (`forge_web`), y app móvil (`forge`, Flutter/Riverpod).
- **Campos `question`/`answer`** (no `title`/`description` literal — más
  preciso semánticamente, mismo patrón que `Huby-CMS`).
- **Sin reordenamiento manual (drag-and-drop)**. Se muestran por orden de
  creación. Se añade reordenamiento si hace falta más adelante (YAGNI).
- **Solo español.** Coherente con la migración "es-only" ya hecha en
  `exercises` (`forge/docs/exercises_es_only_migration.md`). Un único par
  `question`/`answer` por documento, no `questionEs`/`questionEn`. Las
  claves `faqQ1`/`faqA1`/etc. de los `.arb` se eliminan (código muerto tras
  el cambio, no se dejan huérfanas).
- **`isActive` para ocultar sin borrar** + **borrado definitivo** también
  disponible en el CMS. A diferencia de "eliminar usuario" (bloqueado por
  Firebase Auth, ver spec de Usuarios), aquí es solo un documento de
  contenido — borrar es simple y seguro, sin las limitaciones de aquel caso.
- **Lectura pública** (`allow read: if true`), sin requerir login. Distinto
  del resto de colecciones (`users`, `exercises`, etc., que exigen usuario
  autenticado) — decisión explícita para dejar la puerta abierta a mostrar
  FAQ en la portada pública de `forge_web` en el futuro, aunque no se
  construye esa vista pública en este spec.
- **Escritura solo admin** (`allow write: if isAdmin()`), igual que
  `exercises`/`shop_items`/`shop_collections`/`config`.
- **Commits**: el usuario autorizó explícitamente hacer `git commit` en
  `forge_web` (CMS) a partir de ahora. **En `forge` (app móvil) sigue sin
  autorizarse** — ese trabajo queda en el working tree sin commitear, igual
  que hasta ahora.

## Esquema Firestore y rules

```typescript
// faq/{faqId}
{
  question: string
  answer: string
  isActive: boolean
  order: number        // = Date.now() en el momento de creación, solo para ordenar sin índice compuesto adicional
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

Bloque nuevo en `forge/firestore.rules` (no modifica ningún bloque
existente):

```javascript
match /faq/{faqId} {
  allow read: if true;
  allow write: if isAdmin();
}
```

## CMS (`forge_web`) — `/cms/faq`

Mismo patrón de capas que Usuarios (`services → store → components/pages`),
sin página de detalle separada — todo en una sola vista con modal:

```
app/
  types/cms/faq.ts               # CmsFaq
  services/cms/faq.service.ts    # getFaqs, createFaq, updateFaq, deleteFaq, toggleFaqActive
  stores/cms/faq.store.ts
  components/cms/faq/
    FaqRow.vue
    FaqFormModal.vue             # crear y editar, mismo modal
  pages/cms/faq/
    index.vue
```

- **Listado**: lista simple (sin tabla de columnas complejas — pocas FAQ
  esperadas), cada fila muestra `question` truncada + badge activo/inactivo
  + botones editar / activar-desactivar / eliminar.
- **`FaqFormModal.vue`**: dos `textarea` (pregunta, respuesta). Mismo modal
  sirve para crear (sin `faqId`) y editar (con `faqId`, precarga valores).
- Eliminar: reutiliza `ConfirmModal.vue` (ya existe, del módulo Usuarios)
  antes de `deleteDoc`.
- Toggle activo/inactivo: inline, sin confirmación (acción reversible con un
  click, no es destructiva).
- Sidebar: "FAQ" deja de estar en `comingSoon`, se convierte en `NuxtLink`
  real a `/cms/faq` (mismo patrón que se hizo con "Usuarios").

## App móvil (`forge`, Flutter) — Clean Architecture + Riverpod

Sigue exactamente el patrón ya usado en `features/goals` (comparado y
verificado contra el código real de ese feature — mismo estilo de
datasource/repository/entity/provider):

```
lib/features/faq/
  data/
    datasources/
      faq_firestore_datasource.dart   # fetchActiveFaqs(): List<FaqEntity>
    repositories/
      faq_repository_impl.dart
  domain/
    entities/
      faq_entity.dart                  # id, question, answer (sin isActive/order — ya filtrado/ordenado en el datasource)
    repositories/
      faq_repository.dart              # interfaz abstracta
  presentation/
    providers/
      faq_providers.dart                # faqListProvider: FutureProvider.autoDispose<List<FaqEntity>>
```

- `FaqFirestoreDatasource.fetchActiveFaqs()`: query `faq` con
  `where('isActive', isEqualTo: true).orderBy('order')`.
- Sin escritura desde la app — solo lectura, así que no hace falta
  `StateNotifier` (a diferencia de `goals`, que sí escribe). Un
  `FutureProvider.autoDispose` es suficiente, mismo patrón que
  `allGoalsProvider`.
- **No requiere estar autenticado** (rules públicas) — a diferencia de
  `goalsProvider`, que depende de `authStateChangesProvider`, este provider
  no necesita `ref.watch(authStateChangesProvider)` en absoluto.
- `FaqScreen` (`presentation/screens/faq_screen.dart`, existente): se
  convierte en `ConsumerWidget`/`ConsumerStatefulWidget`, consume
  `faqListProvider` con un `.when(data: ..., loading: ..., error: ...)`.
  Misma UI visual (`_FaqCard`, animaciones `flutter_animate`) — solo cambia
  la fuente de los datos (`items` pasa de una lista fija de 3 a la lista
  real del provider).
- Estados: loading (spinner centrado, simple — no hace falta skeleton
  elaborado para una lista corta), error (mensaje + reintentar), vacío (si
  no hay ninguna FAQ activa, mensaje "No hay preguntas frecuentes
  disponibles" en vez de una lista vacía silenciosa).
- **Limpieza**: eliminar solo `faqQ1`/`faqA1`/`faqQ2`/`faqA2`/`faqQ3`/`faqA3`
  de `app_es.arb` y `app_en.arb` (código muerto — ese contenido pasa a
  Firestore). **`faqTitle` se mantiene** en ambos `.arb`: es un string de UI
  (título de `AppBar`), no contenido dinámico, y el resto de la app sí
  mantiene ES/EN real (a diferencia de `forge_web`, que no tiene i18n) — no
  hay razón para romper esa consistencia solo porque el contenido de las
  preguntas en sí es solo-español.

## Manejo de errores

- **CMS**: fetch de FAQ falla → `EmptyState` con mensaje + reintentar (mismo
  patrón que Usuarios). Crear/editar/eliminar falla → mensaje inline en el
  modal (mismo patrón que `AdjustXpCoinsModal`).
- **App móvil**: `faqListProvider` en estado `error` → texto de error simple
  con botón "Reintentar" (`ref.invalidate(faqListProvider)`). Estado vacío
  (`data` con lista vacía) → mensaje informativo, no una pantalla en blanco.
- Sin tests en ningún repo (regla ya establecida para `forge_web`; se aplica
  el mismo criterio a este cambio en `forge` salvo que el usuario indique lo
  contrario para Flutter específicamente — no se ha pedido).

## Fuera de alcance

- Vista pública de FAQ en la portada de `forge_web` (la regla de lectura
  pública lo deja preparado, pero construir esa vista es su propio
  sub-proyecto si se pide).
- Reordenamiento manual (drag-and-drop).
- Multi-idioma (solo español).
- Adjuntos multimedia (a diferencia de `Huby-CMS`).
- Tests en Flutter.

## Verificación

- `forge_web`: `npm run generate` sin errores; `/cms/faq` lista, crea, edita,
  activa/desactiva y elimina correctamente contra la colección real
  (verificar en Firestore que los cambios se reflejan).
- `forge/firestore.rules`: dry-run limpio antes de desplegar; tras desplegar,
  una lectura anónima (sin auth) a `faq` debe funcionar (a diferencia de
  `users`, que la bloquea); una escritura sin `isAdmin` debe fallar.
- `forge` (Flutter): `flutter analyze` sin errores nuevos; `FaqScreen`
  muestra las FAQ reales creadas desde el CMS, con el mismo diseño visual
  que antes; desactivar una FAQ desde el CMS hace que desaparezca de la app
  (tras refrescar el provider); estado vacío y de error se comportan como
  se espera (probar apagando red o con la colección vacía).
