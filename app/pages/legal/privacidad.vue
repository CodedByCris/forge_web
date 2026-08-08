<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

const contentHtml = ref('')
const loading = ref(true)
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  try {
    const db = getFirestore()
    const snap = await getDoc(doc(db, 'legal_documents', 'privacy_policy'))
    contentHtml.value = snap.data()?.contentHtml ?? ''
  } catch {
    errorMessage.value = 'No se pudo cargar el documento.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-16">
    <h1 class="mb-8 text-2xl font-extrabold text-forge-text">Política de privacidad</h1>

    <p v-if="loading" class="text-sm text-forge-muted">Cargando…</p>
    <p v-else-if="errorMessage" class="text-sm text-forge-muted">{{ errorMessage }}</p>
    <p v-else-if="!contentHtml" class="text-sm text-forge-muted">
      Este documento aún no ha sido publicado.
    </p>
    <div v-else class="legal-content text-sm leading-relaxed text-forge-textSec" v-html="contentHtml" />
  </div>
</template>

<style scoped>
.legal-content :deep(h2) {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #EEEEEE;
}
.legal-content :deep(h2:first-child) {
  margin-top: 0;
}
.legal-content :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #EEEEEE;
}
.legal-content :deep(p) {
  margin-bottom: 1rem;
}
.legal-content :deep(ul) {
  margin-bottom: 1rem;
  padding-left: 1.25rem;
  list-style: disc;
}
.legal-content :deep(li) {
  margin-bottom: 0.25rem;
}
.legal-content :deep(strong) {
  font-weight: 700;
  color: #EEEEEE;
}
</style>
