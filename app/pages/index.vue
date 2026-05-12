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
    <FeaturesSection />
    <AppShowcase />
    <ScreenshotGallery />
    <RanksSection />
    <HowItWorks />
    <BetaSection @open-modal="openModal" />
    <AppFooter />
    <BetaModal :open="showModal" @close="closeModal" />
  </main>
</template>
