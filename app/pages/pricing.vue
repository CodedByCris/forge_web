<template>
  <div class="min-h-screen bg-forge-bg text-forge-text">
    <!-- Header -->
    <section class="py-20 px-4 text-center">
      <span
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
        style="background: rgba(255,98,0,0.12); border: 1px solid rgba(255,98,0,0.3); color: #FF9A3C"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-forge-accent animate-pulse" />
        Sin permanencia · Cancela cuando quieras
      </span>
      <h1 class="text-4xl sm:text-5xl font-black tracking-tight mb-4">
        Planes <span class="text-gradient-orange">simples</span>
      </h1>
      <p class="text-forge-textSec text-lg max-w-xl mx-auto">
        Empieza gratis y sube a Premium cuando quieras más.
      </p>
    </section>

    <!-- Pricing cards -->
    <section class="px-4 pb-20">
      <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Free -->
        <div class="bg-forge-surface border border-forge-divider rounded-2xl p-8 flex flex-col">
          <div class="mb-8">
            <p class="text-forge-muted text-sm font-medium uppercase tracking-widest mb-2">Free</p>
            <div class="flex items-end gap-1 mb-1">
              <span class="text-5xl font-black">0€</span>
              <span class="text-forge-muted text-sm mb-2">/mes</span>
            </div>
            <p class="text-forge-muted text-sm">Para siempre, sin tarjeta</p>
          </div>

          <ul class="space-y-3 mb-8 flex-1">
            <li v-for="feature in freeFeatures" :key="feature" class="flex items-start gap-3 text-sm text-forge-textSec">
              <Check :size="16" class="text-forge-success shrink-0 mt-0.5" />
              {{ feature }}
            </li>
          </ul>

          <NuxtLink
            to="/train/auth/register"
            class="w-full text-center py-3.5 rounded-xl border border-forge-divider hover:border-forge-primary/40 text-forge-text font-semibold transition-colors"
          >
            Empezar gratis
          </NuxtLink>
        </div>

        <!-- Premium -->
        <div
          class="relative rounded-2xl p-8 flex flex-col overflow-hidden"
          style="background: linear-gradient(145deg, #1A1A1A, #141414); border: 1px solid rgba(255,98,0,0.4); box-shadow: 0 0 40px rgba(255,98,0,0.12)"
        >
          <!-- Badge -->
          <span
            class="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold"
            style="background: rgba(255,98,0,0.2); color: #FF9A3C; border: 1px solid rgba(255,98,0,0.35)"
          >
            Ahorra 33%
          </span>

          <div class="mb-8">
            <p class="text-forge-primary text-sm font-bold uppercase tracking-widest mb-2">Premium ⭐</p>
            <div class="flex items-end gap-2 mb-1">
              <div>
                <div class="flex items-end gap-1">
                  <span class="text-5xl font-black">5,99€</span>
                  <span class="text-forge-muted text-sm mb-2">/mes</span>
                </div>
                <p class="text-forge-muted text-sm">o <strong class="text-forge-textSec">47,99€/año</strong></p>
              </div>
            </div>
          </div>

          <ul class="space-y-3 mb-8 flex-1">
            <li class="text-forge-muted text-xs font-semibold uppercase tracking-widest mb-1">Todo lo de Free, más:</li>
            <li v-for="feature in premiumFeatures" :key="feature" class="flex items-start gap-3 text-sm text-forge-textSec">
              <Check :size="16" class="text-forge-primary shrink-0 mt-0.5" />
              {{ feature }}
            </li>
          </ul>

          <NuxtLink
            to="/train/auth/register"
            class="w-full text-center py-3.5 rounded-xl text-white font-bold gradient-orange glow-orange-hover transition-all"
          >
            Prueba gratis 7 días
          </NuxtLink>
          <p class="text-forge-muted text-xs text-center mt-3">Desde la app (Google Play / App Store)</p>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="px-4 pb-24">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl font-black text-center mb-10">Preguntas frecuentes</h2>

        <div class="space-y-2">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="bg-forge-surface border border-forge-divider rounded-xl overflow-hidden"
          >
            <button
              type="button"
              class="w-full flex items-center justify-between px-5 py-4 text-left text-forge-text font-medium transition-colors hover:bg-forge-surfaceAlt"
              @click="openFaq = openFaq === i ? -1 : i"
            >
              {{ faq.q }}
              <ChevronDown
                :size="18"
                class="text-forge-muted transition-transform duration-200 shrink-0 ml-4"
                :class="openFaq === i ? 'rotate-180' : ''"
              />
            </button>
            <div v-if="openFaq === i" class="px-5 pb-4 text-forge-muted text-sm">
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { Check, ChevronDown } from 'lucide-vue-next'

definePageMeta({ layout: false })

const openFaq = ref(-1)

const freeFeatures = [
  'Workouts ilimitados',
  'Historial últimos 30 días',
  'Hasta 5 plantillas',
  'IA asistente (10 mensajes/día)',
  'Feed social básico',
]

const premiumFeatures = [
  'Historial completo sin límite',
  'Plantillas ilimitadas',
  'IA sin límites',
  'Analíticas avanzadas',
  'Sin publicidad',
  'Todos los temas visuales',
  'Badge Premium en tu perfil',
]

const faqs = [
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí, sin permanencia. Cancela en cualquier momento desde la app y no se te cobrará el siguiente ciclo.',
  },
  {
    q: '¿Qué pasa con mis datos si cancelo?',
    a: 'Tus datos se conservan íntegros. Simplemente vuelves al plan Free con sus limitaciones, pero no pierdes nada de lo que has registrado.',
  },
  {
    q: '¿Está disponible en iOS y Android?',
    a: 'Sí, Forge está disponible en Android ahora mismo, con iOS próximamente. También puedes entrenar directamente desde esta web.',
  },
  {
    q: '¿Cómo pago?',
    a: 'La suscripción Premium se gestiona desde la app, a través de Google Play Billing o App Store. No almacenamos datos de pago.',
  },
]
</script>
