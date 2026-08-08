# Configuración global — CMS

## Contexto

Octavo y último sub-proyecto planificado del CMS antes de Ejercicios. El
planteamiento original en `admin_dashboard.md` describía varios campos
(`minVersion`, `maintenanceMode`, `weeklyEventActive`, `exercisesCacheKey`)
para `config/appConfig`. Verificado en el código real de `forge`: **solo
`exercisesCacheKey` existe y se lee de verdad**
(`exercises_firestore_datasource.dart` / `exercises_local_datasource.dart`)
— el resto nunca se implementó.

## Decisiones (confirmadas con el usuario)

- **Solo `exercisesCacheKey`.** Sin `maintenanceMode` ni otros campos
  especulativos — se añaden como su propio sub-proyecto (cross-repo, la app
  tendría que leerlos) si algún día hacen falta de verdad.
- **Sin cambios en Firestore rules** — `config/{docId}` ya permite lectura a
  cualquier autenticado y escritura solo admin (`firestore.rules:248-251`),
  exactamente lo que este módulo necesita.
- **Commits**: autorizados en `forge_web`. No aplica a `forge` (no hay
  cambios ahí en este módulo).

## CMS (`forge_web`) — `/cms/configuracion`

```
app/
  types/cms/config.ts             # CmsAppConfig
  services/cms/config.service.ts  # getAppConfig, updateExercisesCacheKey
  stores/cms/config.store.ts
  pages/cms/configuracion/
    index.vue
```

- Muestra el valor actual de `exercisesCacheKey` (fetch de
  `config/appConfig`, puede no existir el doc todavía — tratar como string
  vacío).
- Input de texto editable + botón "Usar fecha de hoy" que rellena el input
  con `YYYY-MM-DD` (convención ya usada para este campo).
- `ConfirmModal` (ya existe, reutilizado) antes de guardar, explicando el
  impacto: "Todos los dispositivos recargarán el catálogo de ejercicios
  la próxima vez que abran la app."
- `setDoc` con `merge: true` sobre `config/appConfig` (el documento puede no
  existir aún — mismo patrón que `legal_documents`).
- Sidebar: "Configuración" deja de estar en `comingSoon`, pasa a `NuxtLink`
  real a `/cms/configuracion`.

## Manejo de errores

- Fetch falla → `EmptyState` con mensaje + reintentar.
- Guardar falla → mensaje inline (mismo patrón que el resto del CMS, con
  código real de Firebase si es `FirebaseError`).

## Fuera de alcance

- `maintenanceMode`, `minVersion`, `weeklyEventActive` — no implementados en
  la app, no se añaden aquí.

## Verificación

- `npm run generate` sin errores; `/cms/configuracion` muestra el valor
  actual, permite editarlo, pide confirmación, guarda correctamente
  (confirmar en Firestore que `config/appConfig.exercisesCacheKey` cambió).
