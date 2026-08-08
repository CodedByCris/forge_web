<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-forge-divider px-6 py-20 text-center">
    <p class="text-lg font-semibold text-forge-text">{{ title }}</p>
    <p v-if="description" class="mt-2 max-w-sm text-sm text-forge-muted">
      {{ description }}
    </p>
  </div>
</template>
