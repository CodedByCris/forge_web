<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex flex-col justify-end" @click.self="emit('close')">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />

      <div class="relative bg-forge-surface rounded-t-3xl border-t border-forge-divider flex flex-col max-h-[92dvh] animate-fade-in-up">
        <!-- Handle -->
        <div class="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div class="w-10 h-1 rounded-full bg-forge-divider" />
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-5 pb-3 border-b border-forge-divider flex-shrink-0">
          <h3 class="font-semibold text-forge-text">Editar perfil</h3>
          <button @click="emit('close')" class="text-forge-muted hover:text-forge-text transition-colors p-1">
            <X :size="20" />
          </button>
        </div>

        <!-- Form -->
        <div class="flex-1 overflow-y-auto px-5 py-5 space-y-5 min-h-0">
          <!-- Nickname -->
          <div>
            <label class="block text-forge-muted text-xs font-medium uppercase tracking-widest mb-1.5">Nickname *</label>
            <input
              v-model="form.nickname"
              type="text"
              maxlength="30"
              class="w-full bg-forge-surfaceAlt border border-forge-divider rounded-xl px-4 py-3 text-forge-text text-sm focus:outline-none focus:border-forge-primary/60 transition-colors"
              placeholder="tu_nickname"
            />
          </div>

          <!-- First / Last name -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-forge-muted text-xs font-medium uppercase tracking-widest mb-1.5">Nombre</label>
              <input
                v-model="form.firstName"
                type="text"
                maxlength="30"
                class="w-full bg-forge-surfaceAlt border border-forge-divider rounded-xl px-4 py-3 text-forge-text text-sm focus:outline-none focus:border-forge-primary/60 transition-colors"
                placeholder="Nombre"
              />
            </div>
            <div>
              <label class="block text-forge-muted text-xs font-medium uppercase tracking-widest mb-1.5">Apellido</label>
              <input
                v-model="form.lastName"
                type="text"
                maxlength="30"
                class="w-full bg-forge-surfaceAlt border border-forge-divider rounded-xl px-4 py-3 text-forge-text text-sm focus:outline-none focus:border-forge-primary/60 transition-colors"
                placeholder="Apellido"
              />
            </div>
          </div>

          <!-- Height / Weight -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-forge-muted text-xs font-medium uppercase tracking-widest mb-1.5">Altura (cm)</label>
              <input
                v-model.number="form.heightCm"
                type="number"
                min="100"
                max="250"
                class="w-full bg-forge-surfaceAlt border border-forge-divider rounded-xl px-4 py-3 text-forge-text text-sm focus:outline-none focus:border-forge-primary/60 transition-colors"
                placeholder="175"
              />
            </div>
            <div>
              <label class="block text-forge-muted text-xs font-medium uppercase tracking-widest mb-1.5">Peso (kg)</label>
              <input
                v-model.number="form.weightKg"
                type="number"
                min="30"
                max="300"
                step="0.5"
                class="w-full bg-forge-surfaceAlt border border-forge-divider rounded-xl px-4 py-3 text-forge-text text-sm focus:outline-none focus:border-forge-primary/60 transition-colors"
                placeholder="75"
              />
            </div>
          </div>

          <!-- Build type -->
          <div>
            <label class="block text-forge-muted text-xs font-medium uppercase tracking-widest mb-2">Tipo de entrenamiento</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="bt in BUILD_TYPES"
                :key="bt.value"
                @click="form.buildType = bt.value"
                class="px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors text-left"
                :class="form.buildType === bt.value
                  ? 'border-forge-primary bg-forge-primary/10 text-forge-primary'
                  : 'border-forge-divider bg-forge-surfaceAlt text-forge-muted hover:text-forge-text'"
              >
                <span class="mr-1.5">{{ bt.emoji }}</span>{{ bt.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Save button -->
        <div class="px-5 py-4 border-t border-forge-divider flex-shrink-0 bg-forge-surface" style="padding-bottom: max(16px, env(safe-area-inset-bottom))">
          <button
            @click="handleSave"
            :disabled="saving || !form.nickname.trim()"
            class="w-full gradient-orange text-white font-bold py-3.5 rounded-2xl disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            <Loader2 v-if="saving" :size="18" class="animate-spin" />
            <span>{{ saving ? 'Guardando…' : 'Guardar cambios' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Loader2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import type { UserBuildType } from '~/types/user'

const BUILD_TYPES: { value: UserBuildType; label: string; emoji: string }[] = [
  { value: 'powerlifter', label: 'Powerlifter', emoji: '🏋️' },
  { value: 'bodybuilder', label: 'Bodybuilder', emoji: '💪' },
  { value: 'hybrid', label: 'Híbrido', emoji: '⚡' },
  { value: 'athlete', label: 'Atleta', emoji: '🏃' },
]

const emit = defineEmits<{ close: []; saved: [] }>()

const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)

const form = reactive({
  nickname: profile.value?.nickname ?? '',
  firstName: profile.value?.firstName ?? '',
  lastName: profile.value?.lastName ?? '',
  heightCm: profile.value?.heightCm ?? (null as number | null),
  weightKg: profile.value?.weightKg ?? (null as number | null),
  buildType: profile.value?.buildType ?? (null as UserBuildType | null),
})

const saving = ref(false)

async function handleSave() {
  if (!form.nickname.trim() || saving.value) return
  saving.value = true
  try {
    await authStore.updateProfile({
      nickname: form.nickname.trim(),
      firstName: form.firstName?.trim() || null,
      lastName: form.lastName?.trim() || null,
      heightCm: form.heightCm || null,
      weightKg: form.weightKg || null,
      buildType: form.buildType,
    })
    emit('saved')
    emit('close')
  } finally {
    saving.value = false
  }
}
</script>
