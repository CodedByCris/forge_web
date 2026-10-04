<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useCmsChallengesStore } from '~/stores/cms/challenges.store'
import ChallengeRow from '~/components/cms/challenges/ChallengeRow.vue'
import ChallengeFormModal from '~/components/cms/challenges/ChallengeFormModal.vue'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import type { CmsChallenge } from '~/types/cms/challenge'

definePageMeta({ layout: 'cms' })

const store = useCmsChallengesStore()

const showFormModal = ref(false)
const editingChallenge = ref<CmsChallenge | null>(null)

const showDeleteConfirm = ref(false)
const deletingChallenge = ref<CmsChallenge | null>(null)
const deleting = ref(false)

onMounted(() => {
  store.fetchChallenges()
})

function openCreateModal() {
  editingChallenge.value = null
  showFormModal.value = true
}

function openEditModal(challenge: CmsChallenge) {
  editingChallenge.value = challenge
  showFormModal.value = true
}

function openDeleteConfirm(challenge: CmsChallenge) {
  deletingChallenge.value = challenge
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingChallenge.value) return
  deleting.value = true
  await store.removeChallenge(deletingChallenge.value.id)
  deleting.value = false
  showDeleteConfirm.value = false
  deletingChallenge.value = null
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-forge-text">Retos</h1>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Nuevo reto
      </button>
    </div>

    <EmptyState
      v-if="store.error"
      title="No se pudieron cargar los retos"
      :description="store.error"
    />

    <div v-else-if="store.loading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <EmptyState
      v-else-if="store.challenges.length === 0"
      title="Todavía no hay retos"
      description="Crea el primero con el botón de arriba."
    />

    <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
      <ChallengeRow
        v-for="challenge in store.challenges"
        :key="challenge.id"
        :challenge="challenge"
        @edit="openEditModal(challenge)"
        @delete="openDeleteConfirm(challenge)"
        @toggle="(isActive) => store.toggleActive(challenge.id, isActive)"
      />
    </div>

    <ChallengeFormModal
      :open="showFormModal"
      :editing-challenge="editingChallenge"
      @close="showFormModal = false"
    />

    <ConfirmModal
      :open="showDeleteConfirm"
      title="Eliminar reto"
      :message="`¿Seguro que quieres eliminar «${deletingChallenge?.question ?? ''}»? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
