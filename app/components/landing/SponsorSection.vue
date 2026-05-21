<template>
  <!-- Only renders when there are active sponsors with placement 'web_landing' -->
  <section v-if="sponsors.length > 0" class="py-14 px-4" style="border-top: 1px solid #2A2A2A">
    <div class="max-w-4xl mx-auto text-center">
      <p class="text-forge-muted text-xs uppercase tracking-widest font-semibold mb-8">Nuestros partners</p>
      <div class="flex flex-wrap items-center justify-center gap-8">
        <a
          v-for="sponsor in sponsors"
          :key="sponsor.id"
          :href="sponsor.url"
          target="_blank"
          rel="noopener noreferrer"
          class="opacity-60 hover:opacity-100 transition-opacity"
        >
          <img
            :src="sponsor.logoUrl"
            :alt="sponsor.name"
            class="h-8 object-contain"
          />
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Reads from Firestore: collection('sponsorships')
//   .where('isActive', '==', true)
//   .where('placement', 'array-contains', 'web_landing')
// Requires composite index on (isActive, placement) in Firestore.
// Section is hidden when no sponsors match.

interface Sponsor {
  id: string
  name: string
  logoUrl: string
  url: string
}

const sponsors = ref<Sponsor[]>([])

onMounted(async () => {
  try {
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore')
    const q = query(
      collection(getFirestore(), 'sponsorships'),
      where('isActive', '==', true),
      where('placement', 'array-contains', 'web_landing'),
    )
    const snap = await getDocs(q)
    sponsors.value = snap.docs.map(d => ({
      id: d.id,
      name: d.data().name as string,
      logoUrl: d.data().logoUrl as string,
      url: (d.data().url as string | undefined) ?? '#',
    }))
  } catch {
    // Firebase unavailable or index missing — section stays hidden
  }
})
</script>
