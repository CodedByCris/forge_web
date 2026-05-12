<script setup lang="ts">
import imgProfile from '~/assets/Ajustes/profile.png'
import imgRangos from '~/assets/Ajustes/rangos.png'
import imgTemas from '~/assets/Ajustes/temas.png'
import imgAmigos from '~/assets/Ajustes/amigos.png'
import imgSettings from '~/assets/Ajustes/settings.png'
import imgPlantillas from '~/assets/Entreno/Plantillas.png'
import imgUnirse from '~/assets/Entreno/Unirse al duelo.png'
import imgRutinas from '~/assets/Rutinas.png'
import imgFeedComentario from '~/assets/Feed/Feed con comentario.png'
import imgStats3 from '~/assets/Stats/stats 3.png'
import imgStatsRecords from '~/assets/Stats/stats records.png'

const categories = [
  {
    label: 'Estadísticas',
    color: '#FF9A3C',
    items: [
      { img: imgStats3, caption: 'Progreso por ejercicio' },
      { img: imgStatsRecords, caption: 'Récords personales' },
    ],
  },
  {
    label: 'Entreno',
    color: '#FF6200',
    items: [
      { img: imgRutinas, caption: 'Rutinas semanales' },
      { img: imgPlantillas, caption: 'Plantillas de entreno' },
      { img: imgUnirse, caption: 'Unirse a un duelo' },
    ],
  },
  {
    label: 'Social',
    color: '#FF9A3C',
    items: [
      { img: imgFeedComentario, caption: 'Comentarios en el feed' },
      { img: imgAmigos, caption: 'Lista de amigos' },
    ],
  },
  {
    label: 'Perfil & Ajustes',
    color: '#8B5CF6',
    items: [
      { img: imgProfile, caption: 'Tu perfil' },
      { img: imgRangos, caption: 'Sistema de rangos' },
      { img: imgTemas, caption: 'Temas y personalización' },
      { img: imgSettings, caption: 'Ajustes' },
    ],
  },
]

onMounted(() => {
  const els = document.querySelectorAll('.gallery-reveal')
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.08 }
  )
  els.forEach((el) => io.observe(el))
})
</script>

<template>
  <section class="py-24 px-4 overflow-hidden" style="background: #0F0F0F; border-top: 1px solid #1E1E1E">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16 gallery-reveal">
        <p class="text-forge-primary text-sm font-semibold uppercase tracking-widest mb-3">Todas las funciones</p>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight">
          Cada detalle,<br />
          <span class="text-gradient-orange">cuidado al máximo.</span>
        </h2>
      </div>

      <!-- Categories -->
      <div class="flex flex-col gap-16">
        <div
          v-for="(cat, ci) in categories"
          :key="cat.label"
          class="gallery-reveal"
        >
          <!-- Category label -->
          <div class="flex items-center gap-3 mb-8">
            <div
              class="w-2 h-2 rounded-full"
              :style="`background: ${cat.color}; box-shadow: 0 0 8px ${cat.color}`"
            />
            <span
              class="text-xs font-black uppercase tracking-widest"
              :style="`color: ${cat.color}`"
            >
              {{ cat.label }}
            </span>
            <div class="flex-1 h-px" :style="`background: linear-gradient(to right, ${cat.color}30, transparent)`" />
          </div>

          <!-- Screenshots row -->
          <div class="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
            <div
              v-for="(item, ii) in cat.items"
              :key="item.caption"
              class="flex-shrink-0 w-[200px] sm:w-auto snap-start group"
            >
              <!-- Card -->
              <div
                class="relative rounded-2xl overflow-hidden border border-forge-divider transition-all duration-300 group-hover:border-opacity-60 group-hover:scale-[1.02]"
                :style="`border-color: ${cat.color}20`"
              >
                <!-- Glow on hover -->
                <div
                  class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none -z-10"
                  :style="`background: radial-gradient(ellipse at center, ${cat.color}, transparent 70%)`"
                />
                <img
                  :src="item.img"
                  :alt="item.caption"
                  class="w-full h-auto block"
                  loading="lazy"
                />
              </div>
              <!-- Caption -->
              <p class="text-forge-muted text-xs text-center mt-2.5 font-medium">{{ item.caption }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.gallery-reveal.visible {
  opacity: 1;
  transform: none;
}

.scrollbar-hidden {
  scrollbar-width: none;
}
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
</style>
