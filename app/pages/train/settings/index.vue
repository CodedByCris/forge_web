<template>
  <div class="animate-fade-in space-y-5">
    <h1 class="text-xl font-bold">Ajustes</h1>

    <!-- Profile card -->
    <div v-if="profile" class="bg-forge-surface border border-forge-divider rounded-2xl p-5">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-forge-surfaceAlt border border-forge-divider flex items-center justify-center flex-shrink-0">
          <img v-if="profile.photoUrl" :src="profile.photoUrl" :alt="profile.nickname" class="w-full h-full rounded-full object-cover" />
          <span v-else class="text-forge-muted font-black text-xl uppercase select-none">{{ profile.nickname.charAt(0) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-forge-text font-bold text-lg leading-tight truncate">{{ profile.nickname }}</p>
          <p class="text-forge-muted text-sm mt-0.5 truncate">{{ user?.email }}</p>
          <p v-if="profile.activeTitle" class="text-forge-accent text-xs font-medium mt-1">{{ profile.activeTitle }}</p>
        </div>
        <button
          @click="profileSheetOpen = true"
          class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forge-surfaceAlt text-forge-muted hover:text-forge-text text-xs font-medium transition-colors"
        >
          <Pencil :size="13" />
          Editar
        </button>
      </div>

      <div class="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-forge-divider">
        <div class="text-center">
          <p class="text-forge-text font-bold text-lg">{{ profile.totalXp.toLocaleString() }}</p>
          <p class="text-forge-muted text-xs">XP</p>
        </div>
        <div class="text-center">
          <p class="text-forge-text font-bold text-lg">{{ profile.followersCount }}</p>
          <p class="text-forge-muted text-xs">Seguidores</p>
        </div>
        <div class="text-center">
          <p class="text-forge-text font-bold text-lg">{{ profile.followingCount }}</p>
          <p class="text-forge-muted text-xs">Siguiendo</p>
        </div>
      </div>
    </div>

    <!-- Weekly goal -->
    <div class="bg-forge-surface border border-forge-divider rounded-2xl p-5">
      <div class="flex items-center gap-2 mb-3">
        <Target :size="16" class="text-forge-primary" />
        <h2 class="text-forge-text font-semibold text-sm">Objetivo semanal</h2>
      </div>
      <p class="text-forge-muted text-xs mb-4">Días de entrenamiento por semana</p>
      <div class="flex gap-2">
        <button
          v-for="d in 7"
          :key="d"
          @click="setWeeklyGoal(d)"
          class="flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors"
          :class="weeklyGoal === d
            ? 'border-forge-primary bg-forge-primary/10 text-forge-primary'
            : 'border-forge-divider bg-forge-surfaceAlt text-forge-muted hover:text-forge-text'"
        >
          {{ d }}
        </button>
      </div>
      <p v-if="weeklyGoal" class="text-forge-muted text-xs mt-2 text-center">
        {{ weeklyGoal }} día{{ weeklyGoal > 1 ? 's' : '' }} / semana
      </p>
    </div>

    <!-- Privacy -->
    <div class="bg-forge-surface border border-forge-divider rounded-2xl overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-forge-surfaceAlt flex items-center justify-center">
            <Lock :size="15" class="text-forge-muted" />
          </div>
          <div>
            <p class="text-forge-text text-sm font-medium">Cuenta privada</p>
            <p class="text-forge-muted text-xs mt-0.5">Solo seguidores ven tu actividad</p>
          </div>
        </div>
        <SettingsToggleSwitch
          :model-value="profile?.isPrivate ?? false"
          @update:model-value="setPrivacy"
        />
      </div>
    </div>

    <!-- Account section -->
    <div class="bg-forge-surface border border-forge-divider rounded-2xl overflow-hidden">
      <h2 class="text-forge-muted text-xs font-medium uppercase tracking-widest px-5 pt-4 pb-2">Cuenta</h2>

      <!-- Email -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-forge-divider">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-forge-surfaceAlt flex items-center justify-center">
            <Mail :size="15" class="text-forge-muted" />
          </div>
          <div>
            <p class="text-forge-muted text-xs font-medium">Email</p>
            <p class="text-forge-text text-sm mt-0.5">{{ user?.email }}</p>
          </div>
        </div>
      </div>

      <!-- Change password -->
      <button
        @click="handlePasswordReset"
        :disabled="resetSent"
        class="w-full flex items-center justify-between px-5 py-3.5 border-b border-forge-divider hover:bg-forge-surfaceAlt transition-colors disabled:opacity-60"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-forge-surfaceAlt flex items-center justify-center">
            <KeyRound :size="15" class="text-forge-muted" />
          </div>
          <p class="text-forge-textSec text-sm font-medium">
            {{ resetSent ? 'Email enviado ✓' : 'Cambiar contraseña' }}
          </p>
        </div>
        <ChevronRight v-if="!resetSent" :size="16" class="text-forge-muted" />
      </button>

      <!-- Delete account -->
      <button
        @click="deleteDialogOpen = true"
        class="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-forge-surfaceAlt transition-colors"
      >
        <div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
          <Trash2 :size="15" class="text-red-400" />
        </div>
        <p class="text-red-400 text-sm font-medium">Eliminar cuenta</p>
      </button>
    </div>

    <!-- Sign out -->
    <button
      @click="handleSignOut"
      class="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-forge-surface border border-forge-divider text-forge-muted hover:text-red-400 hover:border-red-400/40 transition-colors text-sm font-medium"
    >
      <LogOut :size="16" />
      Cerrar sesión
    </button>

    <p class="text-center text-forge-muted text-xs pb-2">Forge Beta • Web v0.1</p>

    <!-- Modals -->
    <SettingsProfileSheet
      v-if="profileSheetOpen"
      @close="profileSheetOpen = false"
      @saved="show('Perfil actualizado', 'success')"
    />
    <SettingsDeleteAccountDialog
      v-if="deleteDialogOpen"
      @close="deleteDialogOpen = false"
      @deleted="show('Cuenta eliminada', 'success')"
    />
  </div>
</template>

<script setup lang="ts">
import { Pencil, Target, Lock, Mail, KeyRound, ChevronRight, Trash2, LogOut } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { profileService } from '~/services/profile.service'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'train', middleware: 'auth' })

const authStore = useAuthStore()
const { user, profile } = storeToRefs(authStore)
const { show } = useToast()

const profileSheetOpen = ref(false)
const deleteDialogOpen = ref(false)
const resetSent = ref(false)

const weeklyGoal = computed(() => profile.value?.weeklyGoalDays ?? null)

async function setWeeklyGoal(days: number) {
  if (weeklyGoal.value === days) return
  await authStore.updateProfile({ weeklyGoalDays: days })
  show(`Objetivo: ${days} día${days > 1 ? 's' : ''} / semana`, 'success')
}

async function setPrivacy(value: boolean) {
  await authStore.updateProfile({ isPrivate: value })
  show(value ? 'Cuenta privada' : 'Cuenta pública', 'success')
}

async function handlePasswordReset() {
  if (!user.value?.email || resetSent.value) return
  try {
    await profileService.sendPasswordReset(user.value.email)
    resetSent.value = true
    show('Email de recuperación enviado', 'success')
  } catch {
    show('No se pudo enviar el email', 'error')
  }
}

async function handleSignOut() {
  await authStore.signOut()
  await navigateTo('/train/auth/login')
}
</script>
