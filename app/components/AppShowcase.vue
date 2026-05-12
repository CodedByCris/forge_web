<script setup lang="ts">
import imgEntrenoManual from '~/assets/Entreno/Entreno manual.png'
import imgStats from '~/assets/Stats/Stats.png'
import imgIA from '~/assets/IA.png'
import imgFantasma from '~/assets/Entreno/Fantasma.png'
import imgFeed from '~/assets/Feed/Feed.png'
import imgDuelo from '~/assets/Entreno/Crear duelo.png'

const screens = [
  {
    img: imgEntrenoManual,
    title: 'Entrena sin fricción',
    desc: 'Registra series, pesos y repeticiones al instante. Interfaz diseñada para no sacar el foco del entrenamiento.',
    bullets: ['Añade ejercicios en segundos', 'Pesos sugeridos por historial', 'Timer de descanso integrado'],
    accent: '#FF6200',
    flip: false,
  },
  {
    img: imgStats,
    title: 'Estadísticas que te hablan',
    desc: 'Gráficas claras de tu progreso semana a semana. Ve exactamente cuánto has mejorado y dónde puedes crecer más.',
    bullets: ['Gráficas por ejercicio y periodo', 'Volumen total y tendencias', 'Comparativa semana a semana'],
    accent: '#FF9A3C',
    flip: true,
  },
  {
    img: imgIA,
    title: 'Rutinas generadas con IA',
    desc: 'Introduce tu objetivo, nivel y días disponibles. La IA crea un plan estructurado y realista en segundos.',
    bullets: ['Plan semanal personalizado', 'Pesos orientativos según tu nivel', 'Guarda o edita antes de empezar'],
    accent: '#8B5CF6',
    flip: false,
  },
  {
    img: imgFantasma,
    title: 'Supera tu fantasma',
    desc: 'Tu peor rival eres tú del pasado. Compara tu sesión actual con la anterior y supera tus marcas en tiempo real.',
    bullets: ['Comparativa en vivo sesión anterior', 'Alerta cuando bates un récord', 'Modo competición contra ti mismo'],
    accent: '#FF6200',
    flip: true,
  },
  {
    img: imgFeed,
    title: 'Comparte tu progreso',
    desc: 'Al terminar un entreno, súbelo al feed. Reacciona a los logros de tus amigos y mantén la motivación alta.',
    bullets: ['Historia tras cada entreno', 'Reacciones y comentarios', 'Ve la actividad de tus contactos'],
    accent: '#FF9A3C',
    flip: false,
  },
  {
    img: imgDuelo,
    title: 'Modo Ranked — el mejor gana',
    desc: 'Reta a un amigo a un duelo de entrenamiento sincronizado. Compara pesos en tiempo real. El que más levante, gana.',
    bullets: ['Duelo en tiempo real', 'Comparativa de volumen al instante', 'Resultado final y estadísticas del duelo'],
    accent: '#EF4444',
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
                style="max-width: 320px; width: 100%;"
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
