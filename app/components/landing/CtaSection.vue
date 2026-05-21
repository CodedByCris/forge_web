<template>
  <section class="py-28 px-4 relative overflow-hidden" style="background: #0F0F0F; border-top: 1px solid #2A2A2A">
    <div
      class="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full opacity-[0.07]"
        style="background: radial-gradient(ellipse, #FF6200 0%, transparent 70%)"
      />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto text-center reveal">
      <h2 class="text-4xl sm:text-5xl font-black tracking-tight mb-4">
        ¿Listo para empezar?
      </h2>
      <p class="text-forge-textSec text-lg mb-10">
        Crea tu cuenta gratis y empieza a entrenar hoy mismo.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          to="/train/auth/register"
          class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base gradient-orange glow-orange glow-orange-hover transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Crear cuenta gratis
        </NuxtLink>
        <NuxtLink
          to="/pricing"
          class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base border border-forge-divider hover:border-forge-primary/40 text-forge-text transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Ver precios
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
