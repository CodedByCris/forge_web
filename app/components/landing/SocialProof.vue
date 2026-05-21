<template>
  <section class="py-16 px-4 border-y border-forge-divider" style="background: #0A0A0A">
    <div class="max-w-4xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        <div v-for="stat in stats" :key="stat.label" class="reveal">
          <p class="text-3xl sm:text-4xl font-black text-gradient-orange mb-1">{{ stat.value }}</p>
          <p class="text-forge-muted text-sm">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Hardcoded until config/stats doc exists in Firestore (collection: 'config', doc: 'stats').
// When available, fetch fields: totalUsers, totalWorkouts, weeklyPRs
const stats = [
  { value: '+2.400', label: 'usuarios activos' },
  { value: '+18.000', label: 'workouts completados' },
  { value: '+340', label: 'PRs esta semana' },
]
</script>
