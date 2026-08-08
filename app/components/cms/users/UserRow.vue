<script setup lang="ts">
import type { CmsUser } from '~/types/cms/user'

defineProps<{
  user: CmsUser
}>()
</script>

<template>
  <NuxtLink
    :to="`/cms/usuarios/${user.uid}`"
    class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 border-b border-forge-divider px-4 py-3 text-sm hover:bg-forge-surfaceAlt"
  >
    <img
      v-if="user.photoUrl"
      :src="user.photoUrl"
      :alt="user.nickname"
      class="h-8 w-8 rounded-full object-cover"
    >
    <div
      v-else
      class="flex h-8 w-8 items-center justify-center rounded-full bg-forge-surfaceAlt text-xs font-semibold text-forge-textSec"
    >
      {{ user.nickname.slice(0, 2).toUpperCase() }}
    </div>

    <div class="min-w-0">
      <p class="truncate font-medium text-forge-text">
        {{ user.nickname }}
        <span v-if="user.isAdmin" class="ml-2 rounded bg-forge-primary/10 px-1.5 py-0.5 text-[10px] uppercase text-forge-primary">
          Admin
        </span>
      </p>
      <p class="truncate text-xs text-forge-muted">{{ user.email }}</p>
    </div>

    <span class="text-forge-textSec">{{ user.totalXp }} XP</span>
    <span class="text-forge-textSec">{{ user.coins }} coins</span>
    <span class="text-forge-muted">{{ user.buildType ?? '—' }}</span>
    <span class="text-forge-muted">
      {{ user.createdAt ? user.createdAt.toLocaleDateString('es-ES') : '—' }}
    </span>
  </NuxtLink>
</template>
