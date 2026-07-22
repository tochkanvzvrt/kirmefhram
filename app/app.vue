<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useContentStore } from '~/stores/content'

if (import.meta.server) {
  const store = useContentStore()
  await Promise.allSettled([
    store.fetchAnnouncements(),
    store.fetchNews(),
    store.fetchSchedule()
  ])
}
</script>