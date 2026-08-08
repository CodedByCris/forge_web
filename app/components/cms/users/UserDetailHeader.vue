<script setup lang="ts">
import type { CmsUser } from '~/types/cms/user'

defineProps<{
  user: CmsUser
}>()
</script>

<template>
  <div class="flex items-center gap-4">
    <img
      v-if="user.photoUrl"
      :src="user.photoUrl"
      :alt="user.nickname"
      class="h-16 w-16 rounded-full object-cover"
    >
    <div
      v-else
      class="flex h-16 w-16 items-center justify-center rounded-full bg-forge-surfaceAlt text-lg font-semibold text-forge-textSec"
    >
      {{ user.nickname.slice(0, 2).toUpperCase() }}
    </div>

    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-xl font-bold text-forge-text">{{ user.nickname }}</h1>
        <span v-if="user.isAdmin" class="rounded bg-forge-primary/10 px-1.5 py-0.5 text-[10px] uppercase text-forge-primary">
          Admin
        </span>
        <span v-if="user.isPrivate" class="rounded bg-forge-surfaceAlt px-1.5 py-0.5 text-[10px] uppercase text-forge-muted">
          Privado
        </span>
      </div>
      <p class="text-sm text-forge-muted">{{ user.email }}</p>
      <p class="mt-1 text-xs text-forge-muted">
        {{ user.buildType ?? 'Sin tipo' }}
        <span v-if="user.activeTitle"> · {{ user.activeTitle }}</span>
        · Registrado el {{ user.createdAt ? user.createdAt.toLocaleDateString('es-ES') : '—' }}
      </p>
    </div>
  </div>
</template>
