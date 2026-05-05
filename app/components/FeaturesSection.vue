<script setup lang="ts">
const features = [
  {
    title: 'Seguimiento de entrenos',
    desc: 'Registra pesos, series y reps con una interfaz rápida y sin fricción.',
    icon: 'dumbbell',
    color: '#FF6200',
    delay: 0,
  },
  {
    title: 'Estadísticas y progreso',
    desc: 'Gráficas claras de tu evolución por ejercicio, semana y mes.',
    icon: 'chart',
    color: '#FF9A3C',
    delay: 1,
  },
  {
    title: 'Feed social',
    desc: 'Comparte tus entrenos con amigos y reacciona a sus logros.',
    icon: 'users',
    color: '#FF6200',
    delay: 2,
  },
  {
    title: 'Modo Ranked',
    desc: 'Compite en tiempo real con un amigo. El mejor entreno gana.',
    icon: 'ranked',
    color: '#FF9A3C',
    delay: 3,
  },
  {
    title: 'Rutinas con IA',
    desc: 'Genera tu plan personalizado en segundos según tus objetivos.',
    icon: 'ai',
    color: '#8B5CF6',
    delay: 4,
  },
  {
    title: 'Gamificación',
    desc: 'XP, niveles, badges y rachas. Cada entreno te hace más fuerte.',
    icon: 'xp',
    color: '#8B5CF6',
    delay: 5,
  },
]

onMounted(() => {
  const els = document.querySelectorAll('.reveal')
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  els.forEach((el) => io.observe(el))
})
</script>

<template>
  <section class="py-24 px-4" style="background: #0F0F0F">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16 reveal">
        <p class="text-forge-primary text-sm font-semibold uppercase tracking-widest mb-3">Funcionalidades</p>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight">
          Todo lo que necesitas<br />
          <span class="text-gradient-orange">para entrenar mejor.</span>
        </h2>
      </div>

      <!-- Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(feat, i) in features"
          :key="feat.title"
          :class="`reveal reveal-delay-${feat.delay}`"
        >
          <div
            class="group h-full rounded-2xl p-6 border border-forge-divider transition-all duration-200 hover:scale-[1.03] hover:border-forge-primary cursor-default"
            style="background: #1A1A1A"
          >
            <!-- Icon -->
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-200 group-hover:scale-110"
              :style="`background: ${feat.color}1A; border: 1px solid ${feat.color}40`"
            >
              <!-- Dumbbell -->
              <template v-if="feat.icon === 'dumbbell'">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="feat.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6.5 6.5h.01M17.5 6.5h.01M6 17.5h.01M17 17.5h.01"/>
                  <path d="M8 8H3.5A1.5 1.5 0 0 0 2 9.5v5A1.5 1.5 0 0 0 3.5 16H8M16 8h4.5A1.5 1.5 0 0 1 22 9.5v5a1.5 1.5 0 0 1-1.5 1.5H16"/>
                  <rect x="8" y="6" width="8" height="12" rx="1"/>
                </svg>
              </template>

              <!-- Chart -->
              <template v-else-if="feat.icon === 'chart'">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="feat.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </template>

              <!-- Users -->
              <template v-else-if="feat.icon === 'users'">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="feat.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </template>

              <!-- Ranked (sword) -->
              <template v-else-if="feat.icon === 'ranked'">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="feat.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
                  <line x1="13" y1="19" x2="19" y2="13"/>
                  <line x1="16" y1="16" x2="20" y2="20"/>
                  <line x1="19" y1="21" x2="21" y2="19"/>
                </svg>
              </template>

              <!-- AI (sparkles) -->
              <template v-else-if="feat.icon === 'ai'">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="feat.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
                  <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z"/>
                  <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5L5 3z"/>
                </svg>
              </template>

              <!-- XP (star/trophy) -->
              <template v-else-if="feat.icon === 'xp'">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="feat.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </template>
            </div>

            <h3 class="text-forge-text font-bold text-lg mb-2 group-hover:text-forge-accent transition-colors duration-200">
              {{ feat.title }}
            </h3>
            <p class="text-forge-muted text-sm leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
