<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <h1 class="mb-4 font-serif text-5xl md:text-6xl">{{ article.title }}</h1>
        <div class="flex justify-center gap-4 text-white/80 text-sm md:text-base">
          <span>{{ formatDate(article.date) }}</span>
          <span v-if="article.categories.length">
            • {{article.categories.map(c => c.name).join(', ')}}
          </span>
        </div>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 max-w-4xl container">
      <div v-html="article.content" class="wp-content"></div>

      <div class="mt-12 pt-8 border-border border-t">
        <NuxtLink to="/announcements"
          class="inline-flex items-center gap-2 text-primary hover:underline transition-colors">
          <ArrowLeft class="w-4 h-4" />
          Вернуться к списку анонсов
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRuntimeConfig } from '#app'

const route = useRoute()
const config = useRuntimeConfig()
const wpBase = config.public.wpApi
const id = route.params.id

const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
const { data: articleData, error } = await useFetch(
  `${wpBase}/wp-json/wp/v2/announcement/${id}?_embed=true`
)

if (error.value || !articleData.value) {
  throw createError({ statusCode: 404, message: 'Анонс не найден' })
}

const article = computed(() => {
  const item = articleData.value as any
  return {
    id: item.id,
    title: item.title?.rendered || 'Без названия',
    content: item.content?.rendered || '',
    date: item.date || '',
    categories: item._embedded?.['wp:term']?.[0]?.map((term: any) => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
    })) || [],
    image: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
  }
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const fullUrl = computed(() => {
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}/announcements/${id}`
})

useHead({
  title: article.value.title,
  meta: [
    { name: 'description', content: stripHtml(article.value.content).slice(0, 160) },
    { property: 'og:title', content: article.value.title },
    { property: 'og:description', content: stripHtml(article.value.content).slice(0, 160) },
    ...(article.value.image ? [{ property: 'og:image', content: article.value.image }] : []),
    { property: 'og:url', content: fullUrl.value },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})
</script>

<style scoped>
.wp-content {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #1a202c;
}

.wp-content :deep(p) {
  margin-bottom: 1.5em;
}

.wp-content :deep(h1),
.wp-content :deep(h2),
.wp-content :deep(h3),
.wp-content :deep(h4),
.wp-content :deep(h5),
.wp-content :deep(h6) {
  font-family: 'SPSL New Cyrillic', 'PT Serif', serif;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

.wp-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
</style>