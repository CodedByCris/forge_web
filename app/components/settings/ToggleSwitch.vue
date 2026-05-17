<template>
  <button
    role="switch"
    :aria-checked="modelValue"
    @click="emit('update:modelValue', !modelValue)"
    class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
    :class="modelValue ? 'bg-forge-primary' : 'bg-forge-surfaceAlt'"
    :disabled="disabled"
  >
    <span
      class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
      :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
    />
  </button>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
