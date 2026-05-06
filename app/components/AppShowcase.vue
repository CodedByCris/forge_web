<script setup lang="ts">
import imgPerfil from '~/assets/perfil.png'
import imgEstadisticas from '~/assets/estadisticas.png'
import imgRutinas from '~/assets/rutinas.png'
import imgFantasma from '~/assets/supera_fantasma.png'

const screens = [
  {
    img: imgPerfil,
    title: 'Tu perfil, tu historia',
    desc: 'Cada entreno queda guardado. Consulta tu historial, tus récords personales y cómo has evolucionado desde el primer día.',
    bullets: ['Historial completo de entrenamientos', 'Récords personales por ejercicio', 'Nivel y XP acumulado'],
    accent: '#FF6200',
    flip: false,
  },
  {
    img: imgEstadisticas,
    title: 'Estadísticas que te hablan',
    desc: 'Gráficas claras de tu progreso semana a semana. Ve exactamente cuánto has mejorado en cada ejercicio y en qué áreas puedes crecer más.',
    bullets: ['Gráficas por ejercicio y periodo', 'Volumen total y tendencias', 'Comparativa semana a semana'],
    accent: '#FF9A3C',
    flip: true,
  },
  {
    img: imgRutinas,
    title: 'Rutinas a tu medida',
    desc: 'Crea tus propias rutinas o deja que la IA las genere por ti según tus objetivos. Estructura tu semana de entrenamiento en segundos.',
    bullets: ['Generación de rutinas con IA', 'Plantillas personalizables', 'Días y grupos musculares organizados'],
    accent: '#8B5CF6',
    flip: false,
  },
  {
    img: imgFantasma,
    title: 'Supera tu fantasma',
    desc: 'Tu peor rival eres tú mismo del pasado. Compara tu sesión actual con la anterior y supera tus propias marcas en tiempo real.',
    bullets: ['Comparativa en vivo con tu sesión anterior', 'Alerta cuando superas un récord', 'Modo competición contra ti mismo'],
    accent: '#FF6200',
    flip: true,
  },
]

onMounted(() => {
  const els = document.querySelectorAll('.showcase-reveal')
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.1 }
  )
  els.forEach((el) => io.observe(el))
})
</script>

<template>
  <section class="py-24 px-4 overflow-hidden" style="background: #0A0A0A; border-top: 1px solid #2A2A2A">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-20 showcase-reveal">
        <p class="text-forge-primary text-sm font-semibold uppercase tracking-widest mb-3">La app en acción</p>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight">
          Diseñada para<br />
          <span class="text-gradient-orange">los que en serio.</span>
        </h2>
      </div>

      <!-- Showcase rows -->
      <div class="flex flex-col gap-28 sm:gap-32">
        <div
          v-for="(screen, i) in screens"
          :key="screen.title"
          :class="[
            'showcase-reveal flex flex-col gap-10 items-center',
            screen.flip ? 'lg:flex-row-reverse' : 'lg:flex-row',
          ]"
        >
          <!-- Phone image -->
          <div class="flex-shrink-0 flex justify-center lg:w-[45%]">
            <div class="relative">
              <!-- Glow -->
              <div
                class="absolute inset-0 rounded-[2.5rem] blur-3xl opacity-25 scale-90 -z-10"
                :style="`background: radial-gradient(ellipse, ${screen.accent}, transparent 70%)`"
              />
              <!-- Screenshot -->
              <img
                :src="screen.img"
                :alt="screen.title"
                class="relative"
                style="max-width: 320px; width: 100%; filter: drop-shadow(0 32px 48px rgba(0,0,0,0.6));"
              />
              <!-- Accent dot -->
              <div
                class="absolute -bottom-3 -right-3 w-5 h-5 rounded-full"
                :style="`background: ${screen.accent}; box-shadow: 0 0 16px ${screen.accent}`"
              />
            </div>
          </div>

          <!-- Text -->
          <div :class="['flex-1 flex flex-col gap-6 text-center lg:text-left', screen.flip ? 'lg:items-end lg:text-right' : 'lg:items-start']">
            <!-- Step number -->
            <span
              class="text-xs font-black uppercase tracking-widest"
              :style="`color: ${screen.accent}`"
            >
              0{{ i + 1 }}
            </span>

            <h3 class="text-3xl sm:text-4xl font-black leading-tight text-forge-text">
              {{ screen.title }}
            </h3>

            <p class="text-forge-textSec text-base sm:text-lg leading-relaxed max-w-md">
              {{ screen.desc }}
            </p>

            <!-- Bullets -->
            <ul :class="['flex flex-col gap-3', screen.flip ? 'lg:items-end' : 'lg:items-start']">
              <li
                v-for="bullet in screen.bullets"
                :key="bullet"
                class="flex items-center gap-3"
                :class="screen.flip ? 'lg:flex-row-reverse' : ''"
              >
                <div
                  class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  :style="`background: ${screen.accent}`"
                />
                <span class="text-forge-muted text-sm">{{ bullet }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.showcase-reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.showcase-reveal.visible {
  opacity: 1;
  transform: none;
}
</style>
