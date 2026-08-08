<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCmsUsersStore } from '~/stores/cms/users.store'
import StatCard from '~/components/cms/shared/StatCard.vue'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import UserDetailHeader from '~/components/cms/users/UserDetailHeader.vue'
import AdjustXpCoinsModal from '~/components/cms/users/AdjustXpCoinsModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'

definePageMeta({ layout: 'cms' })

const route = useRoute()
const uid = computed(() => route.params.uid as string)

const usersStore = useCmsUsersStore()

const showAdjustModal = ref(false)
const showResetConfirm = ref(false)
const resettingStreak = ref(false)
const resetFeedback = ref<string | null>(null)

onMounted(() => {
  usersStore.fetchUserDetail(uid.value)
})

async function handleResetStreak() {
  resettingStreak.value = true
  const ok = await usersStore.resetStreak(uid.value)
  resettingStreak.value = false
  showResetConfirm.value = false
  resetFeedback.value = ok ? 'Racha reseteada.' : 'No se pudo resetear la racha.'
  setTimeout(() => { resetFeedback.value = null }, 3000)
}

function formatDuration(start: Date | null, end: Date | null): string {
  if (!start || !end) return '—'
  const minutes = Math.round((end.getTime() - start.getTime()) / 60000)
  return `${minutes} min`
}
</script>

<template>
  <div>
    <EmptyState
      v-if="usersStore.detailError"
      title="No se pudo cargar el usuario"
      :description="usersStore.detailError"
    />

    <div v-else-if="usersStore.detailLoading" class="text-sm text-forge-muted">
      Cargando usuario…
    </div>

    <EmptyState
      v-else-if="!usersStore.selectedUser"
      title="Usuario no encontrado"
    />

    <template v-else>
      <UserDetailHeader :user="usersStore.selectedUser" />

      <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="XP total" :value="usersStore.selectedUser.totalXp" />
        <StatCard label="Coins" :value="usersStore.selectedUser.coins" />
        <StatCard label="Racha" :value="usersStore.selectedUser.currentStreak" />
        <StatCard label="Seguidores" :value="usersStore.selectedUser.followersCount" />
        <StatCard label="Siguiendo" :value="usersStore.selectedUser.followingCount" />
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent"
          @click="showAdjustModal = true"
        >
          Ajustar XP / coins
        </button>
        <button
          type="button"
          class="rounded-lg border border-forge-divider px-4 py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt"
          @click="showResetConfirm = true"
        >
          Resetear racha
        </button>
      </div>

      <p
        v-if="resetFeedback"
        class="mt-3 text-sm"
        :class="resetFeedback.includes('No se pudo') ? 'text-forge-danger' : 'text-forge-success'"
      >
        {{ resetFeedback }}
      </p>

      <h2 class="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-forge-muted">
        Últimos entrenamientos
      </h2>

      <EmptyState
        v-if="usersStore.selectedUserWorkouts.length === 0"
        title="Sin entrenamientos"
        description="Este usuario todavía no ha completado ningún workout."
      />

      <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
        <div
          v-for="workout in usersStore.selectedUserWorkouts"
          :key="workout.id"
          class="flex items-center justify-between border-b border-forge-divider px-4 py-3 text-sm last:border-b-0"
        >
          <span class="text-forge-text">{{ workout.name }}</span>
          <span class="text-forge-muted">
            {{ workout.startedAt ? workout.startedAt.toLocaleDateString('es-ES') : '—' }}
          </span>
          <span class="text-forge-muted">{{ formatDuration(workout.startedAt, workout.endedAt) }}</span>
        </div>
      </div>
    </template>

    <AdjustXpCoinsModal
      :open="showAdjustModal"
      :uid="uid"
      @close="showAdjustModal = false"
    />

    <ConfirmModal
      :open="showResetConfirm"
      title="Resetear racha"
      :message="`¿Seguro que quieres poner la racha de ${usersStore.selectedUser?.nickname ?? 'este usuario'} a 0?`"
      confirm-label="Resetear"
      :loading="resettingStreak"
      @confirm="handleResetStreak"
      @cancel="showResetConfirm = false"
    />
  </div>
</template>
