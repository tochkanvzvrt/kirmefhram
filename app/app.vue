<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useContentStore } from '~/stores/content'

if (import.meta.server) {
  const store = useContentStore()
  await store.fetchAnnouncements()
  await store.fetchNews()
  await store.fetchSchedule()
}
</script>