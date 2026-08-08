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
