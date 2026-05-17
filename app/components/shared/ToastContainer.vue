<template>
  <Teleport to="body">
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto max-w-[320px]"
          :class="{
            'bg-forge-success text-white': toast.type === 'success',
            'bg-red-500 text-white': toast.type === 'error',
            'bg-forge-surface border border-forge-divider text-forge-text': toast.type === 'info',
          }"
        >
          <CheckCircle2 v-if="toast.type === 'success'" :size="16" class="shrink-0" />
          <XCircle v-else-if="toast.type === 'error'" :size="16" class="shrink-0" />
          <Info v-else :size="16" class="shrink-0 text-forge-muted" />
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle2, XCircle, Info } from 'lucide-vue-next'

const { toasts } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
.toast-move {
  transition: transform 0.25s ease;
}
</style>
