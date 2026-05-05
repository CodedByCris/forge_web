<script setup lang="ts">
useSeoMeta({
  title: 'Forge — Entrena. Progresa. Compite.',
  description:
    'Forge es la app de fitness para registrar entrenamientos, ver tu progreso, competir con amigos y subir de nivel. Ahora en beta en Android.',
  ogTitle: 'Forge — Entrena. Progresa. Compite.',
  ogDescription:
    'App de fitness con tracking, estadísticas, modo ranked y gamificación. Beta disponible en Android.',
  ogImage: 'https://forge.bycriss.cloud/og-image.png',
  ogUrl: 'https://forge.bycriss.cloud',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://forge.bycriss.cloud' }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Forge',
        operatingSystem: 'Android',
        applicationCategory: 'HealthAndFitness',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        url: 'https://forge.bycriss.cloud',
      }),
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-forge-bg text-forge-text">
    <NuxtPage />
  </div>
</template>
