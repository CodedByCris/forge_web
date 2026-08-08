<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCmsModerationStore } from '~/stores/cms/moderation.store'
import PostModerationRow from '~/components/cms/moderation/PostModerationRow.vue'
import RoutineModerationRow from '~/components/cms/moderation/RoutineModerationRow.vue'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'

definePageMeta({ layout: 'cms' })

const moderationStore = useCmsModerationStore()

const activeTab = ref<'posts' | 'routines'>('posts')

const showConfirm = ref(false)
const deleting = ref(false)
const pendingDelete = ref<{ type: 'post' | 'routine'; id: string; label: string } | null>(null)

onMounted(() => {
  moderationStore.fetchPosts()
  moderationStore.fetchRoutines()
})

function askDeletePost(id: string, label: string) {
  pendingDelete.value = { type: 'post', id, label }
  showConfirm.value = true
}

function askDeleteRoutine(id: string, label: string) {
  pendingDelete.value = { type: 'routine', id, label }
  showConfirm.value = true
}

async function handleConfirm() {
  if (!pendingDelete.value) return
  deleting.value = true
  if (pendingDelete.value.type === 'post') {
    await moderationStore.removePost(pendingDelete.value.id)
  } else {
    await moderationStore.removeRoutine(pendingDelete.value.id)
  }
  deleting.value = false
  showConfirm.value = false
  pendingDelete.value = null
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-forge-text">Moderación</h1>

    <div class="mb-4 flex gap-2 border-b border-forge-divider">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium"
        :class="activeTab === 'posts' ? 'border-b-2 border-forge-primary text-forge-primary' : 'text-forge-muted'"
        @click="activeTab = 'posts'"
      >
        Posts
      </button>
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium"
        :class="activeTab === 'routines' ? 'border-b-2 border-forge-primary text-forge-primary' : 'text-forge-muted'"
        @click="activeTab = 'routines'"
      >
        Rutinas públicas
      </button>
    </div>

    <template v-if="activeTab === 'posts'">
      <EmptyState
        v-if="moderationStore.postsError"
        title="No se pudieron cargar los posts"
        :description="moderationStore.postsError"
      />
      <div v-else-if="moderationStore.postsLoading" class="text-sm text-forge-muted">
        Cargando…
      </div>
      <EmptyState
        v-else-if="moderationStore.posts.length === 0"
        title="No hay posts que mostrar"
      />
      <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
        <PostModerationRow
          v-for="post in moderationStore.posts"
          :key="post.id"
          :post="post"
          @delete="askDeletePost(post.id, post.workoutName)"
        />
      </div>
    </template>

    <template v-else>
      <EmptyState
        v-if="moderationStore.routinesError"
        title="No se pudieron cargar las rutinas"
        :description="moderationStore.routinesError"
      />
      <div v-else-if="moderationStore.routinesLoading" class="text-sm text-forge-muted">
        Cargando…
      </div>
      <EmptyState
        v-else-if="moderationStore.routines.length === 0"
        title="No hay rutinas públicas que mostrar"
      />
      <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
        <RoutineModerationRow
          v-for="routine in moderationStore.routines"
          :key="routine.id"
          :routine="routine"
          @delete="askDeleteRoutine(routine.id, routine.name)"
        />
      </div>
    </template>

    <ConfirmModal
      :open="showConfirm"
      title="Eliminar contenido"
      :message="`¿Seguro que quieres eliminar «${pendingDelete?.label ?? ''}»? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      :loading="deleting"
      @confirm="handleConfirm"
      @cancel="showConfirm = false"
    />
  </div>
</template>
