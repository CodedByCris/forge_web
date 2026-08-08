<script setup lang="ts">
import CmsSidebar from '~/components/cms/layout/CmsSidebar.vue'
import CmsTopbar from '~/components/cms/layout/CmsTopbar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-forge-bg text-forge-text">
    <CmsSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <CmsTopbar />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
