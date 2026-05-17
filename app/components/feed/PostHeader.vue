<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <!-- Avatar -->
      <div class="w-10 h-10 rounded-full bg-forge-surfaceAlt border border-forge-divider overflow-hidden flex items-center justify-center flex-shrink-0">
        <img v-if="photoUrl" :src="photoUrl" :alt="nickname" class="w-full h-full object-cover" />
        <span v-else class="text-forge-muted font-bold text-sm uppercase">
          {{ nickname.charAt(0) }}
        </span>
      </div>
      <!-- Name + time -->
      <div>
        <p class="text-forge-text font-semibold text-sm leading-tight">{{ nickname }}</p>
        <p class="text-forge-muted text-xs mt-0.5">{{ timeAgo(createdAt) }}</p>
      </div>
    </div>

    <!-- Options menu (own post) -->
    <div v-if="isOwn" class="relative" ref="menuRef">
      <button
        @click="menuOpen = !menuOpen"
        class="p-1.5 rounded-lg text-forge-muted hover:text-forge-text hover:bg-forge-surfaceAlt transition-colors"
      >
        <MoreHorizontal :size="18" />
      </button>
      <div
        v-if="menuOpen"
        class="absolute right-0 top-8 bg-forge-surface border border-forge-divider rounded-xl shadow-lg z-10 overflow-hidden min-w-36"
      >
        <button
          @click="emit('delete'); menuOpen = false"
          class="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-forge-surfaceAlt transition-colors"
        >
          <Trash2 :size="15" />
          Eliminar post
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MoreHorizontal, Trash2 } from 'lucide-vue-next'
import { timeAgo } from '~/utils/time'

defineProps<{
  nickname: string
  photoUrl: string | null
  createdAt: Date
  isOwn: boolean
}>()

const emit = defineEmits<{ delete: [] }>()

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})
onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

function handleOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}
</script>
