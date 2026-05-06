<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

// Trap focus when modal opens — minimal, no library
const modalRef = ref<HTMLDivElement | null>(null)

watch(
  () => props.open,
  (val) => {
    nextTick(() => {
      if (val && modalRef.value) {
        const focusable = modalRef.value.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        )
        focusable[0]?.focus()
      }
    })
  }
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.82)"
        @click.self="$emit('close')"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
          appear
        >
          <div
            v-if="open"
            ref="modalRef"
            class="relative w-full max-w-md rounded-3xl p-8 border border-forge-divider"
            style="background: #1A1A1A; box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,98,0,0.08)"
          >
            <!-- Close button -->
            <button
              @click="$emit('close')"
              class="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-forge-muted hover:text-forge-text hover:bg-forge-surfaceAlt transition-all duration-150"
              aria-label="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <!-- Icon -->
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style="background: rgba(255,98,0,0.15); border: 1px solid rgba(255,98,0,0.3)"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#FF6200" aria-hidden="true">
                <path d="M6.18 15.64a2.18 2.18 0 0 1-2.18-2.18V9.5a2.18 2.18 0 0 1 4.36 0v3.96a2.18 2.18 0 0 1-2.18 2.18zm11.64 0a2.18 2.18 0 0 1-2.18-2.18V9.5a2.18 2.18 0 0 1 4.36 0v3.96a2.18 2.18 0 0 1-2.18 2.18zM3.56 8.04C3.56 5.38 7.44 3 12 3s8.44 2.38 8.44 5.04v8.6c0 .7-.57 1.27-1.27 1.27h-.5v2.27a1.82 1.82 0 0 1-3.64 0V16.9H8.97v2.27a1.82 1.82 0 0 1-3.64 0V16.9h-.5c-.7 0-1.27-.57-1.27-1.27v-8.6zM8.71 2.27l-1-1.73a.27.27 0 0 0-.47.27L8.3 2.6a6.18 6.18 0 0 1 3.7-.6 6.18 6.18 0 0 1 3.7.6l1.06-1.79a.27.27 0 0 0-.47-.27l-1 1.73A6.25 6.25 0 0 0 12 2c-1.18 0-2.28.1-3.29.27zM9.5 6.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm5 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
              </svg>
            </div>

            <!-- Title -->
            <h2 id="modal-title" class="text-2xl font-black text-forge-text mb-3">
              Forge está en fase beta
            </h2>

            <!-- Body -->
            <p class="text-forge-textSec text-sm leading-relaxed mb-8">
              Para unirte como tester, únete al grupo de Google con tu cuenta de Gmail.
              Una vez dentro, recibirás acceso automático a la app desde Play Store.
            </p>

            <!-- Divider -->
            <div class="h-px mb-8" style="background: #2A2A2A" />

            <!-- CTA: join tester group -->
            <a
              href="https://groups.google.com/g/android-testers-cris"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-white font-bold text-base gradient-orange glow-orange glow-orange-hover transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Unirme al grupo de testers
            </a>

            <!-- Note -->
            <p class="text-center text-forge-muted text-xs mt-4">
              Necesitas estar logado con tu cuenta de Google/Gmail
            </p>

            <!-- Divider with label -->
            <div class="flex items-center gap-3 my-5">
              <div class="flex-1 h-px" style="background: #2A2A2A" />
              <span class="text-forge-muted text-xs uppercase tracking-widest">o</span>
              <div class="flex-1 h-px" style="background: #2A2A2A" />
            </div>

            <!-- CTA: download from Play Store -->
            <a
              href="https://play.google.com/store/apps/details?id=com.bycriss.forge"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style="background: #242424; border: 1px solid #3A3A3A; color: #E0E0E0;"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6.18 15.64a2.18 2.18 0 0 1-2.18-2.18V9.5a2.18 2.18 0 0 1 4.36 0v3.96a2.18 2.18 0 0 1-2.18 2.18zm11.64 0a2.18 2.18 0 0 1-2.18-2.18V9.5a2.18 2.18 0 0 1 4.36 0v3.96a2.18 2.18 0 0 1-2.18 2.18zM3.56 8.04C3.56 5.38 7.44 3 12 3s8.44 2.38 8.44 5.04v8.6c0 .7-.57 1.27-1.27 1.27h-.5v2.27a1.82 1.82 0 0 1-3.64 0V16.9H8.97v2.27a1.82 1.82 0 0 1-3.64 0V16.9h-.5c-.7 0-1.27-.57-1.27-1.27v-8.6zM8.71 2.27l-1-1.73a.27.27 0 0 0-.47.27L8.3 2.6a6.18 6.18 0 0 1 3.7-.6 6.18 6.18 0 0 1 3.7.6l1.06-1.79a.27.27 0 0 0-.47-.27l-1 1.73A6.25 6.25 0 0 0 12 2c-1.18 0-2.28.1-3.29.27zM9.5 6.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm5 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
              </svg>
              Descargar en Play Store
            </a>

            <p class="text-center text-forge-muted text-xs mt-3">
              Requiere unirte al grupo de testers primero
            </p>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
