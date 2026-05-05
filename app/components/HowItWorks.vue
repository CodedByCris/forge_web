<script setup lang="ts">
const steps = [
  {
    number: '01',
    title: 'Registra',
    desc: 'Añade tus ejercicios, series y pesos en segundos. Historial completo siempre a mano.',
  },
  {
    number: '02',
    title: 'Progresa',
    desc: 'Visualiza tu evolución con estadísticas detalladas. Ve cuánto has mejorado semana a semana.',
  },
  {
    number: '03',
    title: 'Compite',
    desc: 'Reta a tus amigos en Modo Ranked y sube de nivel ganando XP con cada entreno.',
  },
]
</script>

<template>
  <section class="py-24 px-4" style="background: #0F0F0F; border-top: 1px solid #2A2A2A">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16 reveal">
        <p class="text-forge-primary text-sm font-semibold uppercase tracking-widest mb-3">Cómo funciona</p>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight">
          Simple. <span class="text-gradient-orange">Potente.</span>
        </h2>
      </div>

      <!-- Steps -->
      <div class="relative flex flex-col lg:flex-row gap-0 lg:gap-0">
        <!-- Connector line (desktop) -->
        <div
          class="hidden lg:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px"
          style="background: linear-gradient(90deg, transparent, #FF6200, #FF9A3C, #FF6200, transparent)"
          aria-hidden="true"
        />

        <div
          v-for="(step, i) in steps"
          :key="step.number"
          :class="`reveal reveal-delay-${i + 1} flex-1 flex flex-col lg:items-center text-left lg:text-center`"
        >
          <!-- Number circle + connector (mobile) -->
          <div class="flex lg:flex-col items-start lg:items-center gap-5 lg:gap-0">
            <div class="flex flex-col lg:flex-row items-center">
              <!-- Vertical connector (mobile) -->
              <div v-if="i < steps.length - 1" class="lg:hidden w-px flex-1 min-h-[2rem] ml-[1.5rem]" style="background: linear-gradient(180deg, #FF6200, transparent)" />
            </div>

            <div class="flex items-start gap-5 lg:flex-col lg:items-center lg:gap-0 w-full pb-10 lg:pb-0">
              <!-- Number badge -->
              <div
                class="relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-black text-sm lg:mb-8"
                style="background: linear-gradient(135deg, #FF6200, #FF9A3C); box-shadow: 0 0 24px rgba(255,98,0,0.4)"
              >
                {{ step.number }}
              </div>

              <!-- Text -->
              <div class="lg:px-6 lg:mt-0">
                <h3 class="text-2xl font-black text-forge-text mb-2">{{ step.title }}</h3>
                <p class="text-forge-muted text-sm leading-relaxed max-w-xs">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
