<script setup lang="ts">
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.bycriss.forge&pcampaignid=web_share'
</script>

<template>
  <section class="py-28 px-4 relative overflow-hidden" style="background: #0F0F0F; border-top: 1px solid #2A2A2A">
    <!-- Background glow -->
    <div
      class="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.07]"
        style="background: radial-gradient(ellipse, #FF6200 0%, transparent 70%)"
      />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto text-center reveal">
      <!-- Eyebrow -->
      <span
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-8"
        style="background: rgba(255,98,0,0.12); border: 1px solid rgba(255,98,0,0.3); color: #FF9A3C"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-forge-accent animate-pulse" />
        Beta abierta
      </span>

      <h2 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
        Únete a la beta<br />
        <span class="text-gradient-orange">de Forge.</span>
      </h2>

      <p class="text-forge-textSec text-lg mb-10">
        Disponible ahora en Android. iOS próximamente.
      </p>

      <a
        :href="PLAY_STORE_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-lg gradient-orange glow-orange glow-orange-hover transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6.18 15.64a2.18 2.18 0 0 1-2.18-2.18V9.5a2.18 2.18 0 0 1 4.36 0v3.96a2.18 2.18 0 0 1-2.18 2.18zm11.64 0a2.18 2.18 0 0 1-2.18-2.18V9.5a2.18 2.18 0 0 1 4.36 0v3.96a2.18 2.18 0 0 1-2.18 2.18zM3.56 8.04C3.56 5.38 7.44 3 12 3s8.44 2.38 8.44 5.04v8.6c0 .7-.57 1.27-1.27 1.27h-.5v2.27a1.82 1.82 0 0 1-3.64 0V16.9H8.97v2.27a1.82 1.82 0 0 1-3.64 0V16.9h-.5c-.7 0-1.27-.57-1.27-1.27v-8.6zM8.71 2.27l-1-1.73a.27.27 0 0 0-.47.27L8.3 2.6a6.18 6.18 0 0 1 3.7-.6 6.18 6.18 0 0 1 3.7.6l1.06-1.79a.27.27 0 0 0-.47-.27l-1 1.73A6.25 6.25 0 0 0 12 2c-1.18 0-2.28.1-3.29.27zM9.5 6.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm5 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
        </svg>
        Descargar en Android
      </a>

      <p class="mt-5 text-forge-muted text-sm">Gratis · Sin tarjeta de crédito</p>
    </div>
  </section>
</template>
