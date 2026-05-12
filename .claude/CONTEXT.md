# 🧠 CLAUDE CONTEXT — FITNESS APP

## 🎯 Objetivo

Estoy desarrollando una aplicación fitness tipo Hevy con funcionalidades sociales, estadísticas y competición entre amigos.

La app NO debe generarse de golpe. Trabajaremos por partes (feature a feature).

---

## 🏗️ Stack & Arquitectura

### Flutter

- State management: Riverpod
- Arquitectura: Clean Architecture
- Estructura: Feature-first

### Reglas de arquitectura

Cada feature debe tener:

- `data/`
  - models
  - datasources
  - repositories (implementación)

- `domain/`
  - entities
  - repositories (interfaces)
  - usecases

- `presentation/`
  - screens
  - widgets
  - providers (Riverpod)

---

## 🎨 UI / UX (MUY IMPORTANTE)

Usa la filosofía de la skill **UI UX Pro Max** con este estilo:

- Energetic fitness app
- Dark mode
- Workout preview cards
- Progress tracking demo
- Trainer profiles
- Colores: bold, motivadores

### Guidelines

- UI moderna estilo app startup fitness
- Mucho uso de cards
- Tipografías grandes y claras
- Feedback visual (progreso, pesos, stats)
- Animaciones suaves (si aplica)

---

---

## 🎬 ANIMACIONES Y EXPERIENCIA (MUY IMPORTANTE)

La app debe sentirse moderna, fluida y premium.

### 🎯 Objetivo

- Animaciones suaves, rápidas y naturales
- Sensación de app fitness de alta calidad
- Nada de UI estática

---

## ✨ Tipos de animaciones a usar

### 1. Transiciones de pantalla

- Fade + slide
- Duración corta (200–300ms)
- No usar transiciones por defecto básicas

---

### 2. Microinteracciones

- Botones con feedback (scale / ripple mejorado)
- Cards con hover/tap animation
- Inputs con focus animado

---

### 3. Listas

- Aparición progresiva (staggered)
- Animaciones al añadir/eliminar ejercicios

---

### 4. Progreso y stats

- Barras animadas
- Contadores incrementales
- Gráficas con animación de entrada

---

### 5. Fitness feeling

- Sensación “energética”
- Elementos que reaccionan (no UI muerta)

---

## 🧰 Implementación en Flutter

Priorizar:

- IMPORTANTE: Utilizar flutter_animate si así evitamos sobrecargas respecto a animaciones propias
- AnimatedContainer
- AnimatedOpacity
- TweenAnimationBuilder
- Hero (cuando tenga sentido)
- Custom animations si aporta valor
- lottie
- TODOS los textos deben estar traducidos con el localizations

---

## ⚠️ Reglas

- NO sobrecargar la UI
- Animaciones rápidas (no lentas)
- No usar animaciones innecesarias
- Siempre coherentes con UX

---

## 🚫 PROHIBIDO

- UI estática sin animaciones
- Transiciones bruscas
- Animaciones largas (>400ms sin motivo)
- Usar animaciones por defecto sin personalizar

---

## ⚠️ FORMA DE TRABAJAR (CRÍTICO)

NO generes toda la app.

SIEMPRE:

- Espera a que te pida una feature concreta
- Genera SOLO lo necesario para esa feature
- Mantén coherencia con la arquitectura existente
- Si falta contexto → pide aclaración

Cuando generes código:

- Explica brevemente qué haces
- Luego da el código limpio
- Evita sobreingeniería

---

## 🧩 FEATURES PRINCIPALES (WIP)

### 🏋️ Entrenamientos

- Crear rutinas
- Registrar ejercicios
- Guardar pesos y reps
- Historial

### 📊 Estadísticas

- Progreso por ejercicio
- Evolución de pesos
- Visualización clara

### 👥 Social / Feed

- Añadir amigos
- Subir “historia” al terminar entrenamiento
- Ver actividad de contactos

### 🥇 Ranked Mode

- Competir con 1 amigo
- Entrenamiento sincronizado
- Comparación de pesos en tiempo real
- Resultado final comparativo

---

### 🤖 Generador de entrenamientos con IA

El usuario podrá generar rutinas automáticamente introduciendo:

- Objetivo (ganar músculo, perder grasa, mantenimiento, etc.)
- Edad
- Peso
- Nivel (principiante, intermedio, avanzado)
- Días disponibles por semana
- Tiempo por sesión (opcional)

### Comportamiento esperado

- Generar un plan semanal estructurado
- Dividir por días (ej: Push / Pull / Legs o similar)
- Incluir ejercicios, sets, reps y pesos orientativos
- Adaptar dificultad según nivel

### UX

- Pantalla tipo formulario paso a paso (wizard)
- Vista previa del plan generado (cards por día)
- Posibilidad de:
  - Guardar como rutina
  - Editar antes de guardar

### Reglas IMPORTANTES

- NO usar respuestas genéricas
- El entrenamiento debe tener estructura realista
- Mantener coherencia con el resto de la app (workouts existentes)

---

## 🚫 TESTING (REGLA GLOBAL)

NO quiero ningún tipo de tests en el proyecto.

Prohibido:

- Tests unitarios
- Tests de integración
- Tests de widgets
- Archivos \*\_test.dart
- Mocks para testing

Nunca generes código de testing aunque sea una buena práctica.

Si en algún momento se necesitan tests, los pediré explícitamente.

### Notas técnicas (para cuando se implemente)

- Inicialmente puede ser mock o basado en lógica simple
- Más adelante se podrá conectar con:
  - OpenAI API
  - Modelos locales
  - Backend propio

## 🧠 Cómo debes responder

Cuando te pida algo tipo:

> "Hazme el login con Firebase"

Debes:

1. Crear estructura de feature `auth`
2. Seguir Clean Architecture
3. Usar Riverpod
4. UI acorde al diseño definido
5. No implementar cosas no pedidas (ej: registro si no lo pido)

---

## 🚫 NO HACER

- No inventar features
- No mezclar capas
- No meter lógica en UI
- No usar setState
- No hacer todo en un solo archivo

---

## 📌 NOTAS

Iré ampliando este archivo con nuevas reglas, features o decisiones técnicas.
Debes tenerlo siempre en cuenta como fuente de verdad.

---

## 📚 DOCUMENTACIÓN OBLIGATORIA (REGLA GLOBAL)

Cada vez que implementes o modifiques una feature **debes**:

### 1. Actualizar `.claude/BACKEND.md`
Si la feature toca Firestore (nuevas colecciones, subcollecciones, campos, índices o reglas de seguridad), actualiza el esquema correspondiente en `BACKEND.md`. Marca con ✅ lo que ya está implementado.

### 2. Actualizar `.claude/FUNCTIONS.md`
Si la feature añade, modifica o elimina una Cloud Function, actualiza `FUNCTIONS.md` con:
- Nombre de la función
- Tipo de trigger (Firestore, Scheduled, HTTPS callable…)
- Descripción de qué hace
- Campos que lee/escribe

### 3. Crear o actualizar `/docs/{feature}.md`
Para cada feature nueva o modificación relevante, crea o actualiza el archivo de documentación en `/docs/`. Sigue esta estructura:

```markdown
# Feature: {Nombre}

## Qué hace
Descripción breve.

## Archivos principales
- `lib/features/{feature}/...`

## Firestore
Colecciones/campos que usa.

## Cloud Functions
Funciones relacionadas (si aplica).

## Decisiones técnicas
Por qué se hizo así.

## Pendientes / TODOs
```

### 4. Actualizar este CLAUDE.md
Si se toma una decisión técnica relevante (nueva librería, cambio de arquitectura, nueva regla de producto), añádela en la sección correspondiente de este archivo.

### ⚠️ Cuándo aplica
- Feature nueva → documentación nueva obligatoria
- Modificación de feature existente → actualizar doc existente
- Bugfix menor (sin cambios de arquitectura) → no requiere doc nueva, pero sí actualizar si hay impacto en esquema o funciones

---

## 🏋️ EJERCICIOS — DECISIONES TÉCNICAS

- `all_exercises` usa `slug` (kebab-case) como base para rutas de assets
- Assets en Firebase Storage: `exercises/{slug}/thumb.webp` y `exercises/{slug}/anim.webp`
- Formato animaciones: **animated WebP** (no GIF)
- URL de assets generada en cliente desde `AppConstants.storageBaseUrl` (fácil migración a CDN)
- Carga lazy con `cached_network_image` + shimmer placeholder
- Animaciones solo se cargan on-demand (tap en detalle), nunca en listas
- `isActive: false` = soft delete (nunca hard-delete ejercicios referenciados en workouts)

---

## 🎮 GAMIFICATION — DECISIONES TÉCNICAS

- Definiciones de badges: JSON estático en cliente (no Firestore)
- XP fórmula nivel: `floor(sqrt(totalXp / 50))`
- PRs calculados en cliente al guardar workout (escritura atómica)
- Streaks y weekly goal reset: Cloud Functions (midnight por timezone del usuario)
- Fatigue score: Cloud Function semanal, heurístico simple (no ML)
- XP writes validados por Cloud Function (verificar que workout existe antes de otorgar XP)

## 🏅 SISTEMA DE RANGOS — DECISIONES TÉCNICAS

- 8 rangos: `madera(0-4) | hierro(5-9) | bronce(10-14) | plata(15-19) | oro(20-24) | platino(25-34) | diamante(35-49) | esmeralda(50+)`
- Los rangos se calculan en cliente a partir del nivel XP (`RankDefinition.fromLevel(level)`)
- Sin persistencia en Firestore — el rango se deriva siempre del `totalXp`
- `XpLevel.rank` getter devuelve el `RankDefinition` actual
- Badges en `rank_badge.dart` usando `CustomPainter` (sin flutter_svg), formas distintas por rango:
  - Madera: rounded rect, Hierro: pentagon shield, Bronce/Plata: classic shield
  - Oro/Platino: hexagon, Diamante: rhombus, Esmeralda: crown shield
- `XpAwardResult` incluye `oldRankIndex`/`newRankIndex` + getter `rankChanged`
- `LevelUpOverlay` tiene dos modos: level-up (mismo rango) y rank-up (nuevo rango con badge animado)
- `l10n.rankName(RankTier tier)` para nombres traducidos (ES/EN)
- `XpLevelBar` muestra badge de rango + nombre del rango + "Nivel X" secundario
- La barra de progreso usa el color del rango actual (en lugar del morado fijo)

---

## 🏆 IDENTITY SYSTEM — DECISIONES TÉCNICAS

- `UserBuildType` enum: `powerlifter | bodybuilder | hybrid | athlete`
- `TitleCatalog` es static const en cliente — mismo patrón que `BadgeCatalog` (sin Firestore)
- Unlock de títulos usa badges como proxy para PRs (badge `pr_first` = 1+ PR), evita query extra
- `users.buildType` y `users.activeTitle` guardados via `SetOptions(merge: true)`
- `UserTitleWidget(compact: bool)` — chip en header del perfil
- Build type afecta `ProgressionAnalyzer` (weight suggestion bias)

---

## 📈 PROGRESSION SYSTEM — DECISIONES TÉCNICAS

- Análisis 100% en cliente (`ProgressionAnalyzer` — Dart puro, sin side effects)
- Lookback: 8 sesiones por ejercicio
- Stagnation: 3+ sesiones al mismo peso ±0.25kg
- Deload trigger: 2+ feedbacks `hard` + avg energyLevel ≤2.5 en últimas 4 sesiones
- Sugerencia de peso por `UserBuildType`: powerlifter +2.5kg, bodybuilder +3% (clamp 2.5–5kg), hybrid/null +2.5%; deload = 80%; todos redondeados a 0.5kg
- `ProgressionInsightCard` se inyecta en `exercise_progress_screen.dart` entre PR card y chart
- Card oculta si `trend == insufficient` (< 2 sesiones)

---

## 🏋️ QUICK WORKOUT — DECISIONES TÉCNICAS

- `QuickWorkoutGenerator.generate()` es Dart puro (no async) — respuesta instantánea
- Exercise count: 15min=3, 30min=4, 45min=6, 60min=8
- Fatiga afecta sets (tired=-1, fresh=+1) y rango de reps
- Exercise pools inline por muscle group (nombres en español, coherentes con AI generator)
- Navegación: `pushReplacement` → `ActiveWorkoutScreen` (back button vuelve al workout hub)
- L10n: prefijo `quickWorkout` en ARB files

---

## 💪 RECOVERY SYSTEM — DECISIONES TÉCNICAS

- Ventana de recuperación fija: 48h
- Mapeo ejercicio→músculo: dict estático 50+ patrones (lowercase partial match)
- Fetch: últimos 7 días de workouts (suficiente para recovery de 48h, rápido)
- Sin datos → `RecoveryStatus.ready` (estado conservador)
- `recoveryStatusProvider` es `autoDispose` (evita estado obsoleto)
- Widget colapsable en `WorkoutScreen` (header siempre visible, lista expandible)

---

## 🎨 THEME SYSTEM — DECISIONES TÉCNICAS

- `AppColorsTheme` es un `ThemeExtension<AppColorsTheme>` con 19 tokens semánticos
- Cada tema vive en su propio `_theme.dart` bajo `lib/core/theme/themes/`
- Para añadir un tema: extender `AppThemeData`, declarar `unlockCondition`, añadir a `AppThemeData.all`
- `AppThemeId` enum: `dark, neo, emerald, ember, arctic, midnight, neonrush, shadow, volcanic, golden, phantom, bloodpact, titan, lightning`
- Persisting tema seleccionado: `SharedPreferences` via `ThemeNotifier`
- `unlockedThemesProvider` calcula qué temas desbloqueados en tiempo real: stats OR `purchasedItemsProvider` (shop)
- `ThemeUnlockCondition` sealed class: `free | level(n) | streak(n) | workouts(n) | shop()`
- `_Shop` condition: `isMet` siempre false (requiere compra), tap en locked → navega a `ShopScreen`
- Métricas de desbloqueo: `xpLevelProvider` (nivel) + `gamificationStatsProvider` (streak, totalWorkouts)
- Temas gratuitos: Iron Dark, Cyber Neo. Resto por logros o tienda
- Settings screen: shop locked → navega a ShopScreen; otros locked → snackbar con hint
- XP label configurable por tema (cada tema puede cambiar "XP" por su propio término)

---

## 🛒 TIENDA — DECISIONES TÉCNICAS

- Moneda: **mancuernitas** (coins). Campo `coins` en `users` doc, actualizado atómicamente con XP
- Coin rates: 10 por entreno completado + 5 si nuevo PR ese día (una vez por día con XP)
- `ShopItem` entity estática en cliente (`ShopCatalog`-style) — sin Firestore para el catálogo
- Item IDs para temas: `'theme_{themeId.key}'` (ej: `'theme_lightning'`)
- `purchasedItems: string[]` en `users` doc — `FieldValue.arrayUnion` al comprar
- `unlockedThemesProvider` lee `purchasedItemsProvider` para temas shop
- `ThemeUnlockCondition.shop()` → locked en picker → tap navega a `ShopScreen`
- `buyShopItem(WidgetRef, ShopItem)` → deduct coins (atomic) → addPurchasedItem → BuyResult enum
- Bottom navbar: tab "Tienda" (5º tab, icono `storefront`) entre Rutinas y Perfil
- SVG mancuernita: `assets/icons/mancuernita.svg`, teñido con `c.primary` en runtime

---

## 🏋️ TIPOS DE EJERCICIO — DECISIONES TÉCNICAS

- `ExerciseType` enum en `exercise_entity.dart`: `standard | assistedBody | timed`
- `standard` = peso + reps (20kg × 10). Modo por defecto.
- `assistedBody` = asistencia negativa + reps. Row muestra badge "−" antes del campo de peso. Se almacena con valor positivo; la UI añade el signo visual.
- `timed` = duración en segundos. Row muestra timer count-up con Play/Pause/Reset + botón "Manual" para CupertinoPicker de min/seg.
- `ExerciseType` propagado a `PlannedExercise.exerciseType` y `WorkoutDraftExercise.exerciseType`
- `WorkoutSet.durationSeconds` añadido (nullable int) — solo se persiste si no es null
- `SetEntry.durationSeconds` se actualiza en tiempo real mientras corre el timer
- `ActiveWorkoutSetRow` es ahora `StatefulWidget` (gestiona el Timer interno)
- Ejercicios asistidos en mock: `assisted_pull_up`, `assisted_chest_dips`, `assisted_tricep_dips`
- Ejercicios con tiempo en mock: `plank`, `side_plank`, `wall_sit`, `l_sit`, `running`, `cycling`, `jump_rope`, `rowing_machine`, `elliptical`

---

## 👤 PERFIL — DECISIONES TÉCNICAS

- Foto de perfil: `image_picker` (galería/cámara) → Firebase Storage `users/{uid}/profile.jpg` → URL guardada en `users.photoUrl`
- Banner "PERFIL" eliminado del AppBar de `ProfileScreen`
- Avatar tappable: badge de cámara superpuesto, bottom sheet con opciones galería/cámara/eliminar
- Upload con `SettableMetadata(contentType: 'image/jpeg')`, max 512px, quality 80

---

## 👥 SISTEMA DE SEGUIDORES — DECISIONES TÉCNICAS

- `follows/{followerId}_{followingId}` — doc ID compuesto; status: `pending` | `accepted`
- Perfil **público**: follow crea el doc como `accepted` + incrementa contadores inmediatamente
- Perfil **privado**: follow crea el doc como `pending` + envía `follow_request` notification
- Contadores `followersCount` / `followingCount` en `users` doc via `FieldValue.increment(±1)`
- `AppNotification` extendido con `fromPhotoUrl` y `followId` (nullable)
- Nuevos tipos de notificación: `follow_request`, `new_follower`, `follow_accepted`
- `watchFollowStatus({followerUid, followingUid})` stream para el botón follow en `FriendProfileScreen`
- `isPrivate` guardado en `users.isPrivate` via `saveIsPrivate()` en `ProfileFirestoreDatasource`
- Toggle de privacidad en `AccountScreen` → sección "Privacidad"
- `FriendProfileScreen`: privacy gate si `isPrivate && !isFollowing` — muestra lock card, oculta contenido
- Followers/following counts visibles en `FriendProfileScreen` header y `ProfileScreen` header

---

## 🔧 CUENTA — DECISIONES TÉCNICAS

- `AccountScreen` en `lib/features/profile/presentation/screens/account_screen.dart`
- Cambio de username: `saveNickname()` en `ProfileFirestoreDatasource`
- Cambio de email: reauth + `user.verifyBeforeUpdateEmail()` + actualiza Firestore
- Cambio de contraseña: reauth + `user.updatePassword()`
- Eliminar cuenta: confirmación doble (dialog + reauth) + `user.delete()`
- Reauth prompt reutilizable (`_promptReauth`) para operaciones sensibles

---

## 🤖 AI CHAT — DECISIONES TÉCNICAS

- **Modelo**: `gpt-4o-mini` vía HTTP directo (Dio). API key en `.env` como `OPENAI_API_KEY`.
- **Guardrails**: system prompt (no n8n). El modelo rechaza off-topic con mensaje fijo.
- **Formato respuesta**: texto libre + bloque JSON delimitado por `---WORKOUT---` / `---END---`. `OpenAiDatasource._parse()` extrae el workout si existe.
- **User context**: `ChatNotifier._cachedSystemPrompt` — construido una vez al abrir el chat leyendo `userProfileProvider`, `gamificationStatsProvider`, `xpLevelProvider`. Se cachea para no repetir en cada mensaje.
- **Historial**: últimos 20 mensajes como contexto por llamada API.
- **Pesos pre-cargados**: `AiWorkoutPlan.toDraft()` genera `WorkoutDraft` con `suggestedWeightKg` como `weight` en cada `WorkoutDraftSet`. Se pasa como `resumeDraft` a `ActiveWorkoutScreen`.
- **`ChatMessage.workoutPlan`**: campo nullable `AiWorkoutPlan?`. Si no es null, `_MessageBubble` renderiza `WorkoutPlanBubble` en lugar del bubble normal.
- `WorkoutPlanBubble` llama `createWorkout()` al pulsar "Comenzar" — mismo flujo que el resto de la app.
