<script setup lang="ts">
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.bycriss.forge&pcampaignid=web_share'
</script>

<template>
  <section
    class="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-16 pb-24"
  >
    <!-- Ambient background glow -->
    <div
      class="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <div
        class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style="background: radial-gradient(circle, #FF6200 0%, transparent 70%)"
      />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto flex flex-col items-center w-full">
      <!-- Copy -->
      <div class="text-center animate-fade-in-up">
        <!-- Badge -->
        <span
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          style="background: rgba(255,98,0,0.15); border: 1px solid rgba(255,98,0,0.3); color: #FF9A3C"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-forge-accent animate-pulse" />
          Beta disponible en Android
        </span>

        <!-- Headline -->
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
          Forja<br />
          <span class="text-gradient-orange">tus límites.</span>
        </h1>

        <!-- Subheading -->
        <p class="text-forge-textSec text-lg sm:text-xl leading-relaxed mb-10 max-w-lg mx-auto">
          Registra entrenamientos, visualiza tu progreso, compite con amigos en tiempo real y sube de nivel con gamificación integrada.
        </p>

        <!-- CTA -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            :href="PLAY_STORE_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-base gradient-orange glow-orange glow-orange-hover transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <!-- Android icon -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6.18 15.64a2.18 2.18 0 0 1-2.18-2.18V9.5a2.18 2.18 0 0 1 4.36 0v3.96a2.18 2.18 0 0 1-2.18 2.18zm11.64 0a2.18 2.18 0 0 1-2.18-2.18V9.5a2.18 2.18 0 0 1 4.36 0v3.96a2.18 2.18 0 0 1-2.18 2.18zM3.56 8.04C3.56 5.38 7.44 3 12 3s8.44 2.38 8.44 5.04v8.6c0 .7-.57 1.27-1.27 1.27h-.5v2.27a1.82 1.82 0 0 1-3.64 0V16.9H8.97v2.27a1.82 1.82 0 0 1-3.64 0V16.9h-.5c-.7 0-1.27-.57-1.27-1.27v-8.6zM8.71 2.27l-1-1.73a.27.27 0 0 0-.47.27L8.3 2.6a6.18 6.18 0 0 1 3.7-.6 6.18 6.18 0 0 1 3.7.6l1.06-1.79a.27.27 0 0 0-.47-.27l-1 1.73A6.25 6.25 0 0 0 12 2c-1.18 0-2.28.1-3.29.27zM9.5 6.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm5 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
            </svg>
            Descargar en Android
          </a>
          <span class="self-center text-forge-muted text-sm">iOS próximamente</span>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
      <span class="text-forge-muted text-xs tracking-widest uppercase">Descubrir</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  </section>
</template>
