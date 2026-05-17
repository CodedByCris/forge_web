<template>
  <div class="bg-forge-surface border border-forge-divider rounded-2xl p-4 animate-pulse">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-full bg-forge-surfaceAlt" />
      <div class="flex-1 space-y-2">
        <div class="h-3.5 bg-forge-surfaceAlt rounded w-32" />
        <div class="h-3 bg-forge-surfaceAlt rounded w-20" />
      </div>
    </div>
    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div v-for="i in 3" :key="i" class="bg-forge-surfaceAlt rounded-xl h-14" />
    </div>
    <!-- Exercises -->
    <div class="space-y-2 mb-4">
      <div v-for="i in 3" :key="i" class="h-3 bg-forge-surfaceAlt rounded" :style="{ width: `${60 + i * 10}%` }" />
    </div>
    <!-- Reaction bar -->
    <div class="h-9 bg-forge-surfaceAlt rounded-xl" />
  </div>
</template>
