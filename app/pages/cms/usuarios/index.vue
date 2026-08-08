<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCmsUsersStore } from '~/stores/cms/users.store'
import UserRow from '~/components/cms/users/UserRow.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'

definePageMeta({ layout: 'cms' })

const usersStore = useCmsUsersStore()

const search = ref('')
type SortKey = 'totalXp' | 'coins' | 'createdAt'
const sortKey = ref<SortKey>('createdAt')
const sortDesc = ref(true)

onMounted(() => {
  usersStore.fetchUsers()
})

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortKey.value = key
    sortDesc.value = true
  }
}

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase()
  let list = usersStore.users
  if (term) {
    list = list.filter(
      (u) => u.nickname.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
    )
  }
  return [...list].sort((a, b) => {
    const key = sortKey.value
    const aVal = key === 'createdAt' ? (a.createdAt?.getTime() ?? 0) : a[key]
    const bVal = key === 'createdAt' ? (b.createdAt?.getTime() ?? 0) : b[key]
    return sortDesc.value ? bVal - aVal : aVal - bVal
  })
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-forge-text">Usuarios</h1>
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por nombre o email…"
        class="w-64 rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-primary"
      >
    </div>

    <EmptyState
      v-if="usersStore.error"
      title="No se pudieron cargar los usuarios"
      :description="usersStore.error"
    />

    <div v-else-if="usersStore.loading" class="text-sm text-forge-muted">
      Cargando usuarios…
    </div>

    <EmptyState
      v-else-if="filteredUsers.length === 0"
      title="Sin resultados"
      description="Ningún usuario coincide con la búsqueda."
    />

    <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
      <div class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 border-b border-forge-divider bg-forge-surfaceAlt px-4 py-2 text-xs uppercase tracking-wide text-forge-muted">
        <span />
        <span>Usuario</span>
        <button type="button" class="text-left hover:text-forge-text" @click="toggleSort('totalXp')">XP</button>
        <button type="button" class="text-left hover:text-forge-text" @click="toggleSort('coins')">Coins</button>
        <span>Tipo</span>
        <button type="button" class="text-left hover:text-forge-text" @click="toggleSort('createdAt')">Registro</button>
      </div>
      <UserRow v-for="user in filteredUsers" :key="user.uid" :user="user" />
    </div>
  </div>
</template>
