# Notificaciones push desde el CMS — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El CMS puede enviar una notificación push real (título/cuerpo libres) a un usuario específico o a todos, reutilizando la Cloud Function `sendNotificationPush` ya desplegada — solo se le añade un tipo nuevo (`admin_broadcast`). Ajuste mínimo en la app móvil para que ese tipo se muestre bien en la lista in-app.

**Architecture:** CMS — `services → stores → components/pages`, igual que Usuarios/FAQ/Legal. Cloud Function — una entrada nueva en un objeto ya existente, sin tocar el resto del archivo. App móvil — dos campos nuevos en una entity ya existente + un caso nuevo en un switch ya existente, sin arquitectura nueva.

**Tech Stack:** Nuxt 4/Pinia/Firebase JS SDK (CMS). Cloud Functions Node 20 (`forge/functions`). Flutter (`forge`). Cero dependencias nuevas en ningún repo.

**Spec:** `docs/superpowers/specs/2026-08-08-notificaciones-design.md`

---

## Nota sobre este plan

- Commits en `forge_web`: autorizados, uno al final de la sección CMS
  (Task 6). Commits en `forge` (Cloud Function ni Flutter): **no
  autorizados**.
- Deploy de la Cloud Function: autorizado sin pausa de confirmación
  adicional (mismo criterio ya usado para Firestore rules en los planes
  anteriores) — dry-run primero de todas formas.
- **No hace falta tocar `firestore.rules`** — verificado en el spec, la
  regla de `notifications` ya permite exactamente lo que este plan necesita.
- Sin tests en ningún repo.

---

### Task 1: Nuevo tipo `admin_broadcast` en la Cloud Function + deploy

**Files:**
- Modify: `/Users/cris/Desktop/forge/functions/src/notifications.functions.ts`

- [ ] **Step 1**: Añadir una entrada al objeto `COPY` (líneas 7-36 del
archivo actual), sin tocar nada más:

```typescript
  admin_broadcast: (n) => ({
    title: n.title as string,
    body: n.body as string,
  }),
```

Insertar dentro del objeto `COPY`, por ejemplo como última entrada antes del
cierre `};`.

- [ ] **Step 2**: Verificar tipos localmente antes de desplegar. Run (desde
`/Users/cris/Desktop/forge/functions`):
```bash
npm run build
```
(o el comando de compilación TypeScript que use este subproyecto —
verificar `package.json` de `functions/` si `build` no existe). Expected:
compila sin errores.

- [ ] **Step 3**: Dry-run del deploy. Run (desde `/Users/cris/Desktop/forge`):
```bash
firebase deploy --only functions:sendNotificationPush --dry-run
```
Si `--dry-run` no aplica a `functions` en la versión de CLI instalada (a
diferencia de `firestore:rules`, confirmar soporte), usar en su lugar
`npm run build` (Step 2) como única verificación pre-deploy y proceder
directo al Step 4 con precaución.

- [ ] **Step 4**: Deploy real.
```bash
firebase deploy --only functions:sendNotificationPush
```
Expected: `Deploy complete!`, sin errores de compilación ni de permisos.

- [ ] **Step 5**: Verificar manualmente escribiendo un documento de prueba
directo en Firestore (vía REST, con las credenciales OAuth ya usadas en
tareas anteriores de este proyecto) en `notifications/{id-nuevo}` con:
```json
{
  "toUid": "<uid de un usuario de prueba con fcmToken válido>",
  "fromUid": "<uid del admin>",
  "fromNickname": "Forge",
  "type": "admin_broadcast",
  "title": "Prueba de despliegue",
  "body": "Si ves esto, la Cloud Function funciona.",
  "isRead": false,
  "createdAt": "<timestamp actual>"
}
```
Expected: el dispositivo del usuario de prueba recibe el push. Revisar
`firebase functions:log --only sendNotificationPush` si no llega, para
confirmar si el problema es la función o la ausencia de `fcmToken`. Borrar
el documento de prueba después (`deleteDoc` o vía REST `DELETE`) — no debe
quedar como notificación real visible en la app del usuario de prueba.

---

### Task 2: Tipos CMS

**Files:**
- Create: `app/types/cms/notification.ts`

- [ ] **Step 1**:

```typescript
// app/types/cms/notification.ts
export interface CmsNotificationPayload {
  title: string
  body: string
}
```

- [ ] **Step 2**: Typecheck (`npx vue-tsc --noEmit --project .nuxt/tsconfig.json`,
`npx nuxi prepare` antes si hace falta). Sin errores nuevos.

---

### Task 3: Servicio `notifications.service.ts`

**Files:**
- Create: `app/services/cms/notifications.service.ts`

- [ ] **Step 1**:

```typescript
// app/services/cms/notifications.service.ts
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import type { CmsNotificationPayload } from '~/types/cms/notification'

async function writeNotification(adminUid: string, toUid: string, payload: CmsNotificationPayload): Promise<void> {
  const db = getFirestore()
  await addDoc(collection(db, 'notifications'), {
    toUid,
    fromUid: adminUid,
    fromNickname: 'Forge',
    fromPhotoUrl: null,
    type: 'admin_broadcast',
    title: payload.title,
    body: payload.body,
    isRead: false,
    createdAt: serverTimestamp(),
  })
}

export async function sendToUser(adminUid: string, toUid: string, payload: CmsNotificationPayload): Promise<void> {
  await writeNotification(adminUid, toUid, payload)
}

export async function sendToAll(adminUid: string, userUids: string[], payload: CmsNotificationPayload): Promise<number> {
  const targets = userUids.filter((uid) => uid !== adminUid)
  await Promise.all(targets.map((uid) => writeNotification(adminUid, uid, payload)))
  return targets.length
}
```

- [ ] **Step 2**: Typecheck. Sin errores nuevos.

---

### Task 4: Store `notifications.store.ts`

**Files:**
- Create: `app/stores/cms/notifications.store.ts`

- [ ] **Step 1**:

```typescript
// app/stores/cms/notifications.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CmsUser } from '~/types/cms/user'
import type { CmsNotificationPayload } from '~/types/cms/notification'
import { getUsers } from '~/services/cms/users.service'
import { sendToUser, sendToAll } from '~/services/cms/notifications.service'
import { useCmsAuthStore } from '~/stores/cms/auth.store'

export const useCmsNotificationsStore = defineStore('cmsNotifications', () => {
  const users = ref<CmsUser[]>([])
  const usersLoading = ref(false)
  const usersError = ref<string | null>(null)

  const sending = ref(false)
  const sendError = ref<string | null>(null)
  const lastSentCount = ref<number | null>(null)

  async function fetchUsers(): Promise<void> {
    usersLoading.value = true
    usersError.value = null
    try {
      users.value = await getUsers()
    } catch {
      usersError.value = 'No se pudieron cargar los usuarios.'
    } finally {
      usersLoading.value = false
    }
  }

  async function sendToOne(toUid: string, payload: CmsNotificationPayload): Promise<boolean> {
    const authStore = useCmsAuthStore()
    if (!authStore.user) return false
    sending.value = true
    sendError.value = null
    lastSentCount.value = null
    try {
      await sendToUser(authStore.user.uid, toUid, payload)
      lastSentCount.value = 1
      return true
    } catch {
      sendError.value = 'No se pudo enviar la notificación.'
      return false
    } finally {
      sending.value = false
    }
  }

  async function sendToEveryone(payload: CmsNotificationPayload): Promise<boolean> {
    const authStore = useCmsAuthStore()
    if (!authStore.user) return false
    sending.value = true
    sendError.value = null
    lastSentCount.value = null
    try {
      if (users.value.length === 0) {
        await fetchUsers()
      }
      const count = await sendToAll(authStore.user.uid, users.value.map((u) => u.uid), payload)
      lastSentCount.value = count
      return true
    } catch {
      sendError.value = 'No se pudo enviar la notificación a todos.'
      return false
    } finally {
      sending.value = false
    }
  }

  return {
    users,
    usersLoading,
    usersError,
    sending,
    sendError,
    lastSentCount,
    fetchUsers,
    sendToOne,
    sendToEveryone,
  }
})
```

- [ ] **Step 2**: Typecheck. Sin errores nuevos.

---

### Task 5: Componente `NotificationForm.vue` + página + sidebar

**Files:**
- Create: `app/components/cms/notifications/NotificationForm.vue`
- Create: `app/pages/cms/notificaciones/index.vue`
- Modify: `app/components/cms/layout/CmsSidebar.vue`

- [ ] **Step 1**: `NotificationForm.vue`

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCmsNotificationsStore } from '~/stores/cms/notifications.store'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'

const notificationsStore = useCmsNotificationsStore()

const title = ref('')
const body = ref('')
const search = ref('')
const selectedUid = ref<string | null>(null)

const showConfirm = ref(false)
const confirmTarget = ref<'user' | 'all' | null>(null)

onMounted(() => {
  notificationsStore.fetchUsers()
})

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return notificationsStore.users
  return notificationsStore.users.filter((u) => u.nickname.toLowerCase().includes(term))
})

const selectedUser = computed(() =>
  notificationsStore.users.find((u) => u.uid === selectedUid.value) ?? null,
)

const canSend = computed(() => title.value.trim() !== '' && body.value.trim() !== '')

function openConfirm(target: 'user' | 'all') {
  if (!canSend.value) return
  if (target === 'user' && !selectedUid.value) return
  confirmTarget.value = target
  showConfirm.value = true
}

async function handleConfirm() {
  const payload = { title: title.value.trim(), body: body.value.trim() }
  let ok = false
  if (confirmTarget.value === 'user' && selectedUid.value) {
    ok = await notificationsStore.sendToOne(selectedUid.value, payload)
  } else if (confirmTarget.value === 'all') {
    ok = await notificationsStore.sendToEveryone(payload)
  }
  showConfirm.value = false
  if (ok) {
    title.value = ''
    body.value = ''
    selectedUid.value = null
    search.value = ''
  }
}

const confirmMessage = computed(() => {
  if (confirmTarget.value === 'user') {
    return `¿Enviar esta notificación a ${selectedUser.value?.nickname ?? 'este usuario'}?`
  }
  return `¿Enviar esta notificación a los ${notificationsStore.users.length - 1} usuarios (excluyéndote a ti)?`
})
</script>

<template>
  <div class="max-w-xl">
    <div class="space-y-4">
      <div>
        <label for="notif-title" class="mb-1.5 block text-xs font-medium text-forge-textSec">
          Título
        </label>
        <input
          id="notif-title"
          v-model="title"
          type="text"
          class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
        >
      </div>

      <div>
        <label for="notif-body" class="mb-1.5 block text-xs font-medium text-forge-textSec">
          Cuerpo
        </label>
        <textarea
          id="notif-body"
          v-model="body"
          rows="3"
          class="w-full resize-none rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
        />
      </div>

      <div>
        <label for="notif-search" class="mb-1.5 block text-xs font-medium text-forge-textSec">
          Buscar usuario (opcional — para enviar a uno solo)
        </label>
        <input
          id="notif-search"
          v-model="search"
          type="text"
          placeholder="Nombre de usuario…"
          class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-primary"
        >
        <div v-if="search" class="mt-2 max-h-40 overflow-y-auto rounded-lg border border-forge-divider">
          <button
            v-for="user in filteredUsers"
            :key="user.uid"
            type="button"
            class="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-forge-surfaceAlt"
            :class="selectedUid === user.uid ? 'bg-forge-primary/10 text-forge-primary' : 'text-forge-text'"
            @click="selectedUid = user.uid; search = user.nickname"
          >
            {{ user.nickname }}
          </button>
        </div>
      </div>
    </div>

    <p v-if="notificationsStore.sendError" class="mt-4 text-sm text-forge-danger">
      {{ notificationsStore.sendError }}
    </p>
    <p v-if="notificationsStore.lastSentCount !== null" class="mt-4 text-sm text-forge-success">
      Enviado a {{ notificationsStore.lastSentCount }} usuario(s).
    </p>

    <div class="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        :disabled="!canSend || !selectedUid || notificationsStore.sending"
        class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
        @click="openConfirm('user')"
      >
        Enviar a usuario seleccionado
      </button>
      <button
        type="button"
        :disabled="!canSend || notificationsStore.sending"
        class="rounded-lg border border-forge-divider px-4 py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt disabled:opacity-60"
        @click="openConfirm('all')"
      >
        Enviar a todos
      </button>
    </div>

    <ConfirmModal
      :open="showConfirm"
      title="Confirmar envío"
      :message="confirmMessage"
      confirm-label="Enviar"
      :loading="notificationsStore.sending"
      @confirm="handleConfirm"
      @cancel="showConfirm = false"
    />
  </div>
</template>
```

- [ ] **Step 2**: `app/pages/cms/notificaciones/index.vue`

```vue
<script setup lang="ts">
import NotificationForm from '~/components/cms/notifications/NotificationForm.vue'

definePageMeta({ layout: 'cms' })
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-forge-text">Notificaciones</h1>
    <NotificationForm />
  </div>
</template>
```

- [ ] **Step 3**: Activar "Notificaciones" en el sidebar. En
`app/components/cms/layout/CmsSidebar.vue`, quitar "Notificaciones" de
`comingSoon`:

```typescript
const comingSoon = [
  { label: 'Ejercicios', icon: Dumbbell },
  { label: 'Moderación', icon: ShieldAlert },
  { label: 'Configuración', icon: Settings },
]
```

Y añadir un `NuxtLink` real, después del de "Legal":

```vue
      <NuxtLink
        to="/cms/notificaciones"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forge-textSec transition-all duration-150 ease-out hover:bg-forge-surfaceAlt hover:text-forge-text"
        active-class="!bg-forge-primary/10 !text-forge-primary border-l-2 border-forge-primary"
      >
        <Bell class="h-4 w-4" />
        Notificaciones
      </NuxtLink>
```

(El import de `Bell` desde `lucide-vue-next` ya existe en el archivo.)

- [ ] **Step 4**: Typecheck + `npm run dev` + `curl http://localhost:3000/cms/notificaciones` → 200. Matar el proceso dev al terminar.

---

### Task 6: Verificación funcional + commit

**Files:** ninguno nuevo.

- [ ] **Step 1**: `npm run generate`. Expected: sin errores, prerenderiza
`/cms/notificaciones`.

- [ ] **Step 2**: Recorrido manual (navegador, `npm run dev`):
1. `/cms/notificaciones` → formulario vacío, botones deshabilitados sin
   título/cuerpo.
2. Escribir título + cuerpo, buscar un usuario, seleccionarlo → botón
   "Enviar a usuario seleccionado" se habilita.
3. Confirmar → mensaje "Enviado a 1 usuario(s)".
4. Confirmar en Firestore que se creó el documento correcto en
   `notifications` con `type: 'admin_broadcast'`.
5. Probar "Enviar a todos" → el modal de confirmación muestra el conteo
   correcto (total de usuarios − 1, excluyendo al admin); tras confirmar,
   "Enviado a N usuario(s)".
6. Si el usuario de prueba del Task 1 tiene la app abierta o en background
   con `fcmToken` válido: confirmar que recibe el push real.

- [ ] **Step 3**: Commit.

```bash
git add app/types/cms/notification.ts app/services/cms/notifications.service.ts app/stores/cms/notifications.store.ts app/components/cms/notifications/ app/pages/cms/notificaciones/ app/components/cms/layout/CmsSidebar.vue docs/superpowers/plans/2026-08-08-notificaciones.md docs/superpowers/specs/2026-08-08-notificaciones-design.md
git commit -m "$(cat <<'EOF'
feat: añadir módulo Notificaciones al CMS

Envío de push reales a un usuario o a todos, reutilizando la Cloud
Function sendNotificationPush ya desplegada (nuevo tipo admin_broadcast
con título/cuerpo libres).
EOF
)"
```

---

### Task 7: Ajustes en la app móvil (Flutter)

**Files:**
- Modify: `/Users/cris/Desktop/forge/lib/features/friends/domain/entities/app_notification.dart`
- Modify: `/Users/cris/Desktop/forge/lib/features/friends/data/datasources/friends_firestore_datasource.dart`
- Modify: `/Users/cris/Desktop/forge/lib/features/friends/presentation/screens/notifications_screen.dart`

- [ ] **Step 1**: En `app_notification.dart`, añadir la constante nueva
junto a las existentes y dos campos nuevos:

```dart
class AppNotification {
  static const typeFriendRequest = 'friend_request';
  static const typeFollowRequest = 'follow_request';
  static const typeNewFollower = 'new_follower';
  static const typeFollowAccepted = 'follow_accepted';
  static const typePostLike = 'post_like';
  static const typePostReaction = 'post_reaction';
  static const typePostComment = 'post_comment';
  static const typeAdminBroadcast = 'admin_broadcast';

  final String id;
  final String toUid;
  final String fromUid;
  final String fromNickname;
  final String? fromPhotoUrl;
  final String type;
  final String status; // 'pending' | 'accepted' | 'declined'
  final DateTime createdAt;
  final String? followId;
  final String? postId;
  final String? emoji;
  final String? title;
  final String? body;
  final bool isRead;

  const AppNotification({
    required this.id,
    required this.toUid,
    required this.fromUid,
    required this.fromNickname,
    this.fromPhotoUrl,
    required this.type,
    required this.status,
    required this.createdAt,
    this.followId,
    this.postId,
    this.emoji,
    this.title,
    this.body,
    this.isRead = false,
  });

  bool get isPending => status == 'pending';
  bool get isAccepted => status == 'accepted';

  bool get isPostNotification =>
      type == typePostLike || type == typePostReaction || type == typePostComment;
}
```

(Solo se añaden `typeAdminBroadcast`, `title`, `body` — todo lo demás queda
igual.)

- [ ] **Step 2**: En `friends_firestore_datasource.dart`, dentro de
`watchNotifications`, añadir el parsing de los dos campos nuevos junto a
`postId`/`emoji` (línea ~32-33 actual):

```dart
                postId: data['postId'] as String?,
                emoji: data['emoji'] as String?,
                title: data['title'] as String?,
                body: data['body'] as String?,
```

- [ ] **Step 3**: En `notifications_screen.dart`, añadir un caso nuevo en
`_notifText` (dentro del switch, antes del caso `_ =>` por defecto):

```dart
      AppNotification.typeAdminBroadcast => n.title ?? '',
```

- [ ] **Step 4**: `flutter analyze` sobre los tres archivos modificados:
```bash
flutter analyze lib/features/friends/domain/entities/app_notification.dart lib/features/friends/data/datasources/friends_firestore_datasource.dart lib/features/friends/presentation/screens/notifications_screen.dart
```
Expected: sin errores nuevos.

---

### Task 8: Verificación final Flutter

**Files:** ninguno — solo verificación.

- [ ] **Step 1**: `flutter analyze` completo desde `/Users/cris/Desktop/forge`.
Expected: sin errores nuevos respecto al estado antes de este plan (23
issues preexistentes ajenos ya documentados en planes anteriores no
cuentan).

- [ ] **Step 2**: Recorrido manual (`flutter run`, dispositivo/emulador, con
un envío real ya hecho desde el CMS en la Task 6): abrir la pantalla de
Notificaciones in-app → la notificación `admin_broadcast` se ve con el
`title` correcto, sin caer en el texto por defecto de "solicitud de
amistad".

No se crea ningún commit en `forge`.
