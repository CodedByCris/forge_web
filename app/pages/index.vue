<script setup lang="ts">
const showModal = ref(false)

function openModal() {
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  showModal.value = false
  document.body.style.overflow = ''
}

// Close on Escape key
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal()
  })
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

provide('openModal', openModal)
</script>

<template>
  <main>
    <HeroSection @open-modal="openModal" />
    <LandingSocialProof />
    <FeaturesSection />
    <AppShowcase />
    <ScreenshotGallery />
    <RanksSection />
    <HowItWorks />
    <LandingSponsorSection />
    <LandingCtaSection />
    <AppFooter />
    <BetaModal :open="showModal" @close="closeModal" />
  </main>
</template>
