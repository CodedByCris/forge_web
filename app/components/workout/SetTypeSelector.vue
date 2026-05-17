<template>
  <div class="relative inline-block" ref="rootRef">
    <!-- Trigger badge -->
    <button
      @click.stop="open = !open"
      class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
      :class="badgeClass"
      :title="SET_TYPE_LABELS[modelValue]"
    >
      {{ SET_TYPE_BADGES[modelValue] }}
    </button>

    <!-- Popover -->
    <Transition name="pop">
      <div
        v-if="open"
        class="absolute left-0 top-9 bg-forge-surfaceAlt border border-forge-divider rounded-xl shadow-xl overflow-hidden z-30 w-36"
      >
        <button
          v-for="type in SET_TYPES"
          :key="type"
          @click="select(type)"
          class="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors hover:bg-forge-surface"
          :class="modelValue === type ? 'text-forge-text font-semibold' : 'text-forge-muted'"
        >
          <span
            class="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
            :class="BADGE_CLASSES[type]"
          >
            {{ SET_TYPE_BADGES[type] }}
          </span>
          {{ SET_TYPE_LABELS[type] }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { SetType } from '~/types/workout'

const props = defineProps<{ modelValue: SetType }>()
const emit = defineEmits<{ 'update:modelValue': [value: SetType] }>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const SET_TYPES: SetType[] = ['regular', 'warmup', 'dropset', 'failed']

const SET_TYPE_LABELS: Record<SetType, string> = {
  regular: 'Regular',
  warmup: 'Calentamiento',
  dropset: 'Drop Set',
  failed: 'Fallido',
}

const SET_TYPE_BADGES: Record<SetType, string> = {
  regular: '●',
  warmup: 'W',
  dropset: 'D',
  failed: 'F',
}

const BADGE_CLASSES: Record<SetType, string> = {
  regular: 'text-forge-muted',
  warmup: 'bg-amber-500/20 text-amber-400',
  dropset: 'bg-blue-500/20 text-blue-400',
  failed: 'bg-red-500/20 text-red-400',
}

const badgeClass = computed(() => {
  const base = 'border '
  const map: Record<SetType, string> = {
    regular: base + 'border-forge-divider text-forge-muted hover:border-forge-primary/50',
    warmup: base + 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    dropset: base + 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    failed: base + 'bg-red-500/20 border-red-500/30 text-red-400',
  }
  return map[props.modelValue]
})

function select(type: SetType) {
  emit('update:modelValue', type)
  open.value = false
}

function closeOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', closeOutside))
onUnmounted(() => document.removeEventListener('click', closeOutside))
</script>

<style scoped>
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.12s, transform 0.12s;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>
