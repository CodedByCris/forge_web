<script setup lang="ts">
import EmptyState from '~/components/cms/shared/EmptyState.vue'

definePageMeta({ layout: 'cms' })
</script>

<template>
  <EmptyState
    title="Aún no hay módulos con datos"
    description="Empieza por Ejercicios, Legal o FAQ para ver contenido real aquí."
  />
</template>
