<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
}>()
</script>

<template>
  <div class="rounded-xl border border-forge-divider bg-forge-surface px-4 py-3">
    <p class="text-2xl font-bold text-forge-text">{{ value }}</p>
    <p class="mt-1 text-xs uppercase tracking-wide text-forge-muted">{{ label }}</p>
  </div>
</template>
