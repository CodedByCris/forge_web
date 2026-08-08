# Ejercicios — CMS + Storage + Limpieza de datos + App móvil

## Contexto

Noveno y último sub-proyecto planificado del CMS — el más grande: la
colección `exercises` tiene **~1396 documentos** (1324 del dataset + 72
legacy), frente a los volúmenes bajos manejados hasta ahora (18 usuarios,
pocas FAQ/rutinas). Esto obliga a paginación real, a diferencia del patrón
"fetch todo + filtra en cliente" usado en Usuarios.

Esquema real verificado en `forge/.claude/BACKEND.md` (fuente de verdad,
código fuente): `id`, `slug`, `numericId`, `name`, `bodyParts`,
`primaryMuscle`, `secondaryMuscles`, `equipment`, `category`,
`exerciseType`, `isActive`, `instructionSteps`. El `forge_web/BACKEND.md`
mencionaba un campo `imageUrl` que **no existe realmente** — divergencia de
documentación detectada y corregida en este spec (se añade de verdad, no
solo se documenta).

Hallazgo clave: `ExerciseEntity` (Flutter) **ya tiene el campo `imageUrl`**
en el modelo de dominio, y `ExerciseModel.fromJson`/`toJson` ya lo
serializan — el modelo de datos está listo, solo falta (a) que Firestore
tenga el campo de verdad y (b) un widget que lo muestre.

## Decisiones (confirmadas con el usuario)

- **Limpieza de datos**: se borran `primaryMuscle` y `secondaryMuscles` de
  los ~1396 documentos — campos en inglés, explícitamente documentados como
  "sin traducir, no se muestra en UI", nunca usados. Operación de un solo
  uso, ejecutada directamente con las credenciales de nivel de proyecto ya
  usadas en este trabajo (mismo mecanismo que la carga de FAQ), **con
  confirmación explícita del usuario justo antes de ejecutarla** (dato
  masivo en producción).
- **Campos editables en el CMS**: `name`, `bodyParts`, `exerciseType`,
  `isActive`, `instructionSteps`, `equipment`, `category`, más la imagen
  nueva. `id`/`slug`/`numericId` son identificadores, no se editan.
- **Solo editar, no crear.** ~1396 ejercicios ya cubren prácticamente todo
  lo común — crear uno nuevo desde cero queda fuera de alcance, se añade
  después si hace falta.
- **Imagen: una por ejercicio**, no el pipeline original de
  thumb+animación webp (`admin_dashboard.md`/`storage.rules` lo mencionaban,
  nunca se implementó) — se simplifica a una sola imagen (`imageUrl`),
  coherente con lo pedido.
- **La app móvil sí debe mostrar la imagen** una vez subida — no se deja
  como campo "solo en Firestore sin usar" (mismo criterio que motivó borrar
  `primaryMuscle`/`secondaryMuscles`). Cambio mínimo y localizado en
  `ExercisePickerItem` (Flutter), con fallback al icono actual si no hay
  imagen.
- **Bump de caché tras editar**: recordatorio/atajo hacia el módulo
  Configuración ya construido (`exercisesCacheKey`) — los cambios no se ven
  en los dispositivos hasta que se invalida la caché local.
- **Búsqueda por nombre**: prefix-match (`where('name', '>=', term)`), no
  full-text — Firestore no lo soporta nativamente. Filtros por `bodyParts`
  (array-contains), `exerciseType`, `isActive` sí son eficientes con
  `where`.
- **Commits**: autorizados en `forge_web`. No autorizados en `forge`
  (Storage rules ni Flutter).

## Limpieza de datos (ejecución única, no forma parte del CMS)

Script que recorre `exercises`, y para cada documento que tenga
`primaryMuscle` o `secondaryMuscles`, los borra con `FieldValue.delete()` (
`updateMask.fieldPaths` vía REST, mismo mecanismo ya usado en este
proyecto). Se ejecuta una vez, se descarta después — no se documenta como
parte del código del CMS.

## Storage rules (`forge/storage.rules`) — habilitar subida desde el CMS

Bloque existente (`exercises/{slug}/{fileName}`), cambio acotado a la
condición de `write`:

```javascript
match /exercises/{slug}/{fileName} {
  allow read: if true;
  allow write: if request.auth != null &&
    firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true &&
    request.resource.size < 5 * 1024 * 1024 &&
    request.resource.contentType.matches('image/.*');
}
```

Convención de path: `exercises/{exerciseId}/photo.jpg` — una imagen por
ejercicio, se sobrescribe al reemplazar.

## Esquema — campo nuevo `exercises/{id}.imageUrl`

```typescript
imageUrl: string | null   // Storage download URL, null hasta que se suba
```

Se añade al escribir desde el CMS (no requiere backfill de los ~1396 docs
existentes — `null`/ausente se trata igual que `null` explícito, ya
contemplado por `ExerciseModel.fromJson` en Flutter).

## CMS (`forge_web`) — `/cms/ejercicios` (listado) + `/cms/ejercicios/[id]` (detalle)

```
app/
  types/cms/exercise.ts
  services/cms/exercises.service.ts   # getExercisesPage, getExercise, updateExercise, uploadExerciseImage
  stores/cms/exercises.store.ts
  components/cms/exercises/
    ExerciseRow.vue
    ExerciseFiltersBar.vue
  pages/cms/ejercicios/
    index.vue
    [id].vue
```

### Listado (`index.vue`)

- Paginación cursor-based: `orderBy('name'), limit(25), startAfter(cursor)`
  — botón "Cargar más" (más simple que paginación numerada con este patrón
  de cursor).
- Filtros: `bodyParts` (select de los 16 grupos musculares fijos,
  `array-contains`), `exerciseType` (select de 4 valores), `isActive`
  (toggle todos/activos/inactivos).
- Búsqueda por nombre: input con prefix-match, combinable con los filtros
  (Firestore permite un solo `where` de rango por query — si el usuario
  busca por nombre Y filtra, la búsqueda de nombre tiene prioridad y los
  filtros se aplican en cliente sobre esa página; documentar esta
  limitación en el propio formulario, no ocultarla).
- Cada fila: nombre, `bodyParts` (chips), `exerciseType`, badge
  activo/inactivo, miniatura si tiene `imageUrl`. Click → detalle.

### Detalle (`[id].vue`)

- Formulario con los 7 campos editables + imagen.
- `bodyParts`: multiselect de los 16 valores fijos (`chest`, `back`,
  `shoulders`, `biceps`, `triceps`, `forearms`, `abs`, `glutes`, `quads`,
  `hamstrings`, `adductors`, `abductors`, `calves`, `cardio`, `neck`,
  `other`).
- `exerciseType`: select (`std`/`ab`/`tim`/`tyd`, con su etiqueta legible —
  Estándar / Asistido / Tiempo / Tiempo y distancia).
- `instructionSteps`: lista editable (textarea, un paso por línea → array
  al guardar).
- Imagen: preview de la actual (si existe), input de archivo, sube a
  `exercises/{id}/photo.jpg`, guarda la download URL en `imageUrl` al
  confirmar el formulario completo (no sube automáticamente al elegir
  archivo).
- Guardar: `updateDoc` con los campos cambiados. Tras guardar con éxito,
  aviso con link directo a `/cms/configuracion` recordando el bump de
  `exercisesCacheKey`.

## App móvil (Flutter) — cambio mínimo

- `ExercisePickerItem` (`lib/features/exercises/presentation/widgets/exercise_picker_item.dart`,
  líneas 57-65): el `Container` 40×40 que hoy siempre muestra un icono por
  grupo muscular pasa a mostrar `Image.network(exercise.imageUrl!)`
  (recortada en círculo/rounded, mismo tamaño) cuando `exercise.imageUrl !=
  null`, y mantiene el icono actual como fallback en cualquier otro caso
  (incluye fallo de carga de red — usar `errorBuilder`).
- Sin cambios en el modelo (`ExerciseEntity`/`ExerciseModel` ya soportan
  `imageUrl` de punta a punta) ni en el datasource.

## Manejo de errores

- CMS: fetch de página falla → `EmptyState` + reintentar. Guardar falla →
  mensaje inline con código real de Firebase (mismo patrón ya aplicado en
  Notificaciones/Configuración). Subida de imagen falla → mensaje inline,
  no bloquea guardar el resto de campos si la imagen falla (se sube por
  separado, no en la misma transacción que el resto del formulario).
- App móvil: `errorBuilder` de `Image.network` cae al icono de fallback sin
  romper la UI ni mostrar un ícono de imagen rota.

## Fuera de alcance

- Crear ejercicios nuevos.
- Pipeline de thumbnail/animación (solo una imagen simple).
- Full-text search real (prefix-match es la limitación aceptada).
- Mostrar la imagen en más sitios de la app además de
  `ExercisePickerItem` (se añade si hace falta más adelante).
- Backfill/migración de imágenes para los ejercicios existentes — se suben
  progresivamente desde el CMS, no hay proceso automático.

## Verificación

- Limpieza de datos: confirmar en una muestra de documentos que
  `primaryMuscle`/`secondaryMuscles` ya no existen.
- `forge/storage.rules`: dry-run + deploy; confirmar que una subida desde
  el CMS autenticado como admin funciona, y que una subida sin auth (o sin
  `isAdmin`) es rechazada.
- `forge_web`: `npm run generate` sin errores; listado pagina
  correctamente (cargar más), filtros funcionan, detalle edita y guarda
  todos los campos, sube una imagen de prueba y la preview se actualiza.
- `forge` (Flutter): `flutter analyze` sin errores nuevos; un ejercicio con
  imagen subida desde el CMS se ve con su foto real en
  `ExercisePickerItem`; uno sin imagen sigue mostrando el icono de siempre.
