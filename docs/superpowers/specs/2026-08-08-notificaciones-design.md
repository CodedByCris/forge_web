# Notificaciones push desde el CMS — CMS + Cloud Function + App móvil

## Contexto

Sexto sub-proyecto del CMS. A diferencia de FAQ/Legal (colecciones nuevas),
este reutiliza infraestructura ya real y desplegada: la colección
`notifications` y la Cloud Function `sendNotificationPush`
(`forge/functions/src/notifications.functions.ts`, confirmada desplegada en
producción vía `firebase functions:list`) que envía un push FCM de verdad a
cualquier documento nuevo en `notifications/{id}`, leyendo
`users/{toUid}.fcmToken`.

El obstáculo: `sendNotificationPush` solo conoce tipos fijos con plantillas
predefinidas (`post_like`, `follow_request`, etc., ver `COPY` en el archivo).
No hay ningún tipo para "mensaje libre escrito por un admin". Este spec
añade uno.

## Decisiones (confirmadas con el usuario)

- **Destinatarios: usuario individual (búsqueda por nickname) o "todos".**
  Sin segmentación fina (inactivos N días, nivel mínimo, etc.) — no pedida,
  YAGNI. El envío a "todos" escribe un documento de notificación **por cada
  usuario** (fan-out desde el cliente, sin Admin SDK) — viable al volumen
  actual (18 usuarios), revisar si el volumen crece mucho.
- **Sin historial de campañas.** No se guarda una colección aparte de qué se
  envió y cuándo. Riesgo aceptado dado que hay un único admin.
- **Nuevo tipo `admin_broadcast`** en la Cloud Function, con `title`/`body`
  **libres** (tal cual los escribe el admin), a diferencia de los demás
  tipos que arman el texto a partir de una plantilla + `fromNickname`.
- **`fromNickname: 'Forge'` fijo** en los documentos que escribe el CMS — el
  mensaje se percibe como "de la app", no de una persona con nickname real.
- **El admin no se autonotifica.** Al enviar a "todos", se excluye al propio
  uid del admin de la lista de destinatarios — mismo criterio que ya aplica
  la lógica existente de la app ("no auto-notificarse").
- **En la lista in-app (`NotificationsScreen`) solo se muestra `title`**,
  no `body` — mismo patrón de una sola línea de texto que ya usan todos los
  demás tipos (el card no tiene espacio para un cuerpo largo). El `body`
  completo sí se ve en el push real del sistema operativo, que es lo
  importante — la Cloud Function ya lo envía completo.
- **Redeploy de la Cloud Function**: requiere confirmación explícita del
  usuario antes de `firebase deploy --only functions:sendNotificationPush`,
  mismo criterio que las Firestore rules.
- **Commits**: autorizados en `forge_web`. No autorizados en `forge`
  (Cloud Function ni Flutter).

## Cloud Function (`forge/functions/src/notifications.functions.ts`)

Añadir una entrada al objeto `COPY` existente (no se toca nada más del
archivo):

```typescript
admin_broadcast: (n) => ({
  title: n.title as string,
  body: n.body as string,
}),
```

El resto de la función (lectura de `fcmToken`, envío, limpieza de tokens
inválidos) ya funciona sin cambios para cualquier `type` nuevo que aparezca
en `COPY` — no hace falta tocar el resto del archivo.

## Esquema del documento (`notifications/{id}`, colección existente)

```typescript
{
  toUid: string
  fromUid: string           // uid del admin autenticado en el CMS
  fromNickname: 'Forge'      // fijo
  fromPhotoUrl: null
  type: 'admin_broadcast'
  title: string               // libre, escrito en el CMS
  body: string                 // libre, escrito en el CMS
  isRead: false
  createdAt: Timestamp
}
```

**No requiere ningún cambio en `forge/firestore.rules`** — verificado el
bloque real (`firestore.rules:149-161`):

```javascript
allow create: if isSignedIn() &&
  request.auth.uid == request.resource.data.fromUid &&
  request.resource.data.toUid != request.auth.uid;
```

Esta regla ya permite exactamente lo que necesita el CMS: el admin
autenticado escribe con `fromUid` igual a su propio uid (se cumple
naturalmente, es quien está logueado) y `toUid` distinto al suyo — que
resulta ser la misma regla de "el admin no se autonotifica" ya decidida más
arriba, aquí forzada además a nivel de Firestore, no solo como criterio de
UX en el CMS.

## CMS (`forge_web`) — `/cms/notificaciones`

```
app/
  types/cms/notification.ts       # payload de envío
  services/cms/notifications.service.ts  # sendToUser, sendToAll (reutiliza getUsers() de users.service.ts)
  stores/cms/notifications.store.ts
  components/cms/notifications/
    NotificationForm.vue
  pages/cms/notificaciones/
    index.vue
```

- Formulario: input de búsqueda de usuario por nickname (reutiliza el
  patrón de filtro ya usado en `/cms/usuarios`, o un select simple dado el
  volumen bajo) **o** botón "Enviar a todos"; campo título; campo cuerpo.
- `ConfirmModal` (ya existe, reutilizado) obligatorio antes de enviar,
  mostrando explícitamente a cuántos destinatarios llegará.
- Tras confirmar: escribe el/los documento(s) en `notifications` con
  `addDoc` (uno por destinatario si es "todos").
- Feedback: "Enviado a {N} usuario(s)" o mensaje de error inline si algo
  falla a mitad del fan-out (se reporta cuántos se enviaron con éxito antes
  del fallo, no se revierte lo ya escrito — no hay transacción posible con
  N documentos independientes de esta forma, y no hace falta: cada
  documento es independiente, un fallo aislado no invalida los demás).
- Sidebar: "Notificaciones" deja de estar en `comingSoon`, pasa a `NuxtLink`
  real a `/cms/notificaciones`.

## App móvil (Flutter) — ajustes mínimos, sin feature nueva

- `AppNotification` (`lib/features/friends/domain/entities/app_notification.dart`):
  añadir `static const typeAdminBroadcast = 'admin_broadcast';` y dos campos
  nuevos `final String? title; final String? body;`.
- `friends_firestore_datasource.dart` (`watchNotifications`): parsear
  `title`/`body` igual que ya se hace con `postId`/`emoji`
  (`data['title'] as String?`, `data['body'] as String?`).
- `notifications_screen.dart` (`_notifText`): añadir un caso explícito
  `AppNotification.typeAdminBroadcast => n.title ?? '',` en el switch —
  **importante**: sin este caso, el `type` desconocido caería en el `_ =>`
  por defecto actual y mostraría incorrectamente el texto de "solicitud de
  amistad".
- Sin cambios de tap-to-navigate (no hay a dónde navegar desde un anuncio
  genérico) ni de claves i18n nuevas (`title` es contenido dinámico, no un
  string de UI).

## Manejo de errores

- **CMS**: fallo al cargar la lista de usuarios (para "todos" o para la
  búsqueda) → mismo `EmptyState` + reintentar que ya usa `/cms/usuarios`.
  Fallo durante el envío → mensaje inline en el formulario, con el conteo
  parcial si aplica.
- **App móvil**: sin cambios de manejo de errores — el flujo de
  `watchNotifications` y la Cloud Function ya tienen su propio manejo (token
  inválido se borra automáticamente, sin `fcmToken` no hace nada).

## Fuera de alcance

- Segmentación fina (inactivos, nivel mínimo, gimnasio).
- Historial de campañas enviadas.
- Programar envío para una fecha/hora futura.
- Mostrar `body` completo en la lista in-app (solo `title`, ver Decisiones).
- Rate limiting de envíos masivos (riesgo bajo con un único admin y 18
  usuarios; se revisa si hace falta más adelante).

## Verificación

- `forge`: `firebase deploy --only functions:sendNotificationPush --dry-run`
  antes de desplegar de verdad; tras el deploy, un doc de prueba con
  `type: 'admin_broadcast'` en `notifications` dispara un push real a un
  dispositivo con `fcmToken` válido.
- `forge_web`: `npm run generate` sin errores; `/cms/notificaciones` envía
  correctamente a un usuario individual y a "todos" (verificar en Firestore
  que se crean N-1 documentos, excluyendo al admin).
- `forge` (Flutter): `flutter analyze` sin errores nuevos; una notificación
  `admin_broadcast` recibida se ve correctamente en `NotificationsScreen`
  (título correcto, sin caer en el texto por defecto de "solicitud de
  amistad").
