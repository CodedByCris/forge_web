<script setup lang="ts">
import { onMounted } from 'vue'
import { useCmsDashboardStore } from '~/stores/cms/dashboard.store'
import StatCard from '~/components/cms/shared/StatCard.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'

definePageMeta({ layout: 'cms' })

const dashboardStore = useCmsDashboardStore()

onMounted(() => {
  dashboardStore.fetchStats()
})
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-forge-text">Dashboard</h1>

    <EmptyState
      v-if="dashboardStore.error"
      title="No se pudieron cargar las estadísticas"
      :description="dashboardStore.error"
    />

    <div v-else-if="dashboardStore.loading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <div v-else-if="dashboardStore.stats" class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="Usuarios" :value="dashboardStore.stats.usersCount" />
      <StatCard label="Ejercicios activos" :value="dashboardStore.stats.activeExercisesCount" />
      <StatCard label="Preguntas frecuentes" :value="dashboardStore.stats.faqCount" />
      <StatCard label="Posts" :value="dashboardStore.stats.postsCount" />
    </div>
  </div>
</template>
