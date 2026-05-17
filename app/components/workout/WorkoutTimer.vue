<template>
  <span class="font-mono text-sm font-semibold tabular-nums" :class="textClass">
    {{ formatted }}
  </span>
</template>

<script setup lang="ts">
import { formatTimer } from '~/utils/xp'

const props = defineProps<{
  seconds: number
  highlight?: boolean
}>()

const formatted = computed(() => formatTimer(props.seconds))

const textClass = computed(() =>
  props.highlight ? 'text-forge-primary' : 'text-forge-muted',
)
</script>
