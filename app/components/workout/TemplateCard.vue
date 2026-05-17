<template>
  <div class="bg-forge-surface border border-forge-divider rounded-2xl overflow-hidden relative">
    <!-- Color accent bar -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1"
      :style="{ background: accentColor }"
    />

    <div class="pl-5 pr-4 py-4">
      <!-- Header: name + menu -->
      <div class="flex items-start justify-between mb-2">
        <h3 class="font-bold text-forge-text text-base leading-tight flex-1 pr-2">
          {{ template.name }}
        </h3>
        <div class="relative" ref="menuRef">
          <button
            @click.stop="showMenu = !showMenu"
            class="text-forge-muted hover:text-forge-text transition-colors p-1 -mr-1 rounded-lg hover:bg-forge-surfaceAlt"
          >
            <MoreHorizontal :size="18" />
          </button>
          <Transition name="dropdown">
            <div
              v-if="showMenu"
              class="absolute right-0 top-8 bg-forge-surfaceAlt border border-forge-divider rounded-xl shadow-xl overflow-hidden z-20 min-w-[140px]"
            >
              <button
                @click="onEdit"
                class="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-forge-text hover:bg-forge-surface transition-colors"
              >
                <Pencil :size="14" />
                Editar
              </button>
              <button
                @click="onDelete"
                class="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 :size="14" />
                Eliminar
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Exercise preview -->
      <p class="text-forge-muted text-sm mb-3 leading-snug min-h-[20px]">
        <span v-if="template.exercises.length > 0">{{ exercisePreview }}</span>
        <span v-else class="italic">Sin ejercicios</span>
      </p>

      <!-- Footer: count + start button -->
      <div class="flex items-center justify-between">
        <span class="text-forge-muted text-xs">
          {{ template.exercises.length }}
          {{ template.exercises.length === 1 ? 'ejercicio' : 'ejercicios' }}
        </span>
        <button
          @click="$emit('start', template)"
          class="flex items-center gap-1 text-sm font-semibold transition-all hover:gap-2"
          :style="{ color: accentColor }"
        >
          Iniciar
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MoreHorizontal, Pencil, Trash2, ChevronRight } from 'lucide-vue-next'
import type { WorkoutTemplate } from '~/types/template'
import { argbToHex } from '~/utils/colors'

const props = defineProps<{ template: WorkoutTemplate }>()
const emit = defineEmits<{
  edit: [template: WorkoutTemplate]
  delete: [id: string]
  start: [template: WorkoutTemplate]
}>()

const showMenu = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const accentColor = computed(() => argbToHex(props.template.color))

const exercisePreview = computed(() => {
  const names = props.template.exercises
    .slice(0, 3)
    .map((e) => e.nameEs ?? e.name)
  const remaining = props.template.exercises.length - 3
  if (remaining > 0) names.push(`+${remaining} más`)
  return names.join(' · ')
})

function onEdit() {
  showMenu.value = false
  emit('edit', props.template)
}

function onDelete() {
  showMenu.value = false
  emit('delete', props.template.id)
}

function closeOnOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', closeOnOutside))
onUnmounted(() => document.removeEventListener('click', closeOnOutside))
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
