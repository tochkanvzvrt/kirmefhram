<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useContentStore } from '~/stores/content'

const store = useContentStore()

await store.fetchAnnouncements()
await store.fetchNews()
await store.fetchSchedule()
</script>