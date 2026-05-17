<template>
  <!-- Row: completed = green tint -->
  <div
    class="grid items-center gap-1.5 py-2 rounded-lg px-1 transition-colors"
    :class="[gridClass, set.completed ? 'bg-green-500/8' : '']"
  >
    <!-- SET TYPE badge -->
    <WorkoutSetTypeSelector
      :model-value="set.setType"
      @update:model-value="update({ setType: $event })"
    />

    <!-- GHOST (PREV) — standard / assistedBody / timed only -->
    <button
      v-if="exerciseType !== 'cardioDistance'"
      @click="autofill"
      class="text-xs text-forge-muted hover:text-forge-accent transition-colors text-center truncate"
      :title="ghostLabel ? 'Tap para autorellenar' : ''"
    >
      {{ ghostLabel || '—' }}
    </button>

    <!-- ── STANDARD / ASSISTED BODY ── -->
    <template v-if="exerciseType === 'standard' || exerciseType === 'assistedBody'">
      <input
        type="number"
        inputmode="decimal"
        :value="set.weight"
        @input="update({ weight: ($event.target as HTMLInputElement).value })"
        @focus="($event.target as HTMLInputElement).select()"
        placeholder="0"
        class="input-cell"
        :class="set.completed ? 'text-forge-success' : ''"
      />
      <input
        type="number"
        inputmode="numeric"
        :value="set.reps"
        @input="update({ reps: ($event.target as HTMLInputElement).value })"
        @focus="($event.target as HTMLInputElement).select()"
        placeholder="0"
        class="input-cell"
        :class="set.completed ? 'text-forge-success' : ''"
      />
    </template>

    <!-- ── TIMED ── -->
    <template v-else-if="exerciseType === 'timed'">
      <input
        type="number"
        inputmode="numeric"
        :value="set.durationSeconds ?? ''"
        @input="update({ durationSeconds: parseInt(($event.target as HTMLInputElement).value) || null })"
        placeholder="0"
        class="input-cell col-span-2"
        :class="set.completed ? 'text-forge-success' : ''"
      />
    </template>

    <!-- ── CARDIO DISTANCE ── -->
    <template v-else-if="exerciseType === 'cardioDistance'">
      <input
        type="number"
        inputmode="decimal"
        :value="set.distanceKm"
        @input="update({ distanceKm: ($event.target as HTMLInputElement).value })"
        placeholder="0"
        class="input-cell"
      />
      <input
        type="number"
        inputmode="numeric"
        :value="set.reps"
        @input="update({ reps: ($event.target as HTMLInputElement).value })"
        placeholder="0"
        class="input-cell"
      />
      <input
        type="number"
        inputmode="decimal"
        :value="set.inclinationPercent"
        @input="update({ inclinationPercent: ($event.target as HTMLInputElement).value })"
        placeholder="0"
        class="input-cell"
      />
    </template>

    <!-- COMPLETE checkbox -->
    <button
      @click="toggle"
      class="w-7 h-7 rounded-lg border flex items-center justify-center transition-all mx-auto"
      :class="set.completed
        ? 'bg-forge-success border-forge-success text-white'
        : 'border-forge-divider text-transparent hover:border-forge-success/50'"
    >
      <Check :size="14" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { DraftSet, ExerciseType, WorkoutSet } from '~/types/workout'

const props = defineProps<{
  exerciseOrder: number
  setIndex: number
  set: DraftSet
  ghostSet: WorkoutSet | undefined
  exerciseType: ExerciseType
}>()

const workoutStore = useActiveWorkoutStore()

const gridClass = computed(() => {
  switch (props.exerciseType) {
    case 'cardioDistance':
      return 'grid-cols-[1.75rem_1fr_1fr_1fr_1.75rem]'
    default:
      return 'grid-cols-[1.75rem_3rem_1fr_1fr_1.75rem]'
  }
})

const ghostLabel = computed(() => {
  const g = props.ghostSet
  if (!g) return ''
  if (props.exerciseType === 'timed') return g.durationSeconds ? `${g.durationSeconds}s` : ''
  if (g.weight !== null && g.reps !== null) return `${g.weight}×${g.reps}`
  if (g.reps !== null) return `${g.reps}r`
  return ''
})

function update(patch: Partial<DraftSet>) {
  workoutStore.updateSet(props.exerciseOrder, props.setIndex, patch)
}

function toggle() {
  workoutStore.toggleSetCompleted(props.exerciseOrder, props.setIndex)
}

function autofill() {
  const g = props.ghostSet
  if (!g) return
  if (props.exerciseType === 'standard' || props.exerciseType === 'assistedBody') {
    update({
      weight: g.weight !== null ? String(g.weight) : props.set.weight,
      reps: g.reps !== null ? String(g.reps) : props.set.reps,
    })
  } else if (props.exerciseType === 'timed') {
    update({ durationSeconds: g.durationSeconds })
  }
}
</script>

<style scoped>
.input-cell {
  @apply w-full bg-forge-surfaceAlt border border-forge-divider rounded-lg px-1.5 py-1.5
    text-center text-sm text-forge-text
    focus:outline-none focus:border-forge-primary
    transition-colors;
}
</style>
