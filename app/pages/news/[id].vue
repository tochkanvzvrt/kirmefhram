<template>
  <div class="w-full">
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <h1 class="mb-4 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words">
          {{ article.title }}
        </h1>
        <div class="flex justify-center gap-4 text-white/80 text-sm md:text-base">
          <span>{{ formatDate(article.date) }}</span>
          <span v-if="article.categories.length">
            • {{ article.categories.map(c => c.name).join(', ') }}
          </span>
        </div>
      </div>
    </section>

    <!-- Контент с автоматической вставкой слайдеров на места галерей -->
    <section class="mx-auto px-4 lg:px-8 py-16 max-w-4xl container">
      <template v-for="(part, index) in contentParts" :key="index">
        <div v-if="part.type === 'html'" v-html="part.content" class="wp-content"></div>
        <GallerySlider v-else-if="part.type === 'gallery'" :images="part.images" />
      </template>

      <div class="mt-12 pt-8 border-border border-t">
        <NuxtLink to="/news"
          class="inline-flex items-center gap-2 text-primary hover:underline transition-colors">
          <ArrowLeft class="w-4 h-4" />
          Вернуться к списку новостей
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRuntimeConfig } from '#app'
import { decode } from 'html-entities'
import GallerySlider from '~/components/GallerySlider.vue'

const route = useRoute()
const config = useRuntimeConfig()
const wpBase = config.public.wpApi
const newsId = route.params.id

const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const { data: articleData, error } = await useFetch(
  `${wpBase}/wp-json/wp/v2/new/${newsId}?_embed=true`
)

if (error.value || !articleData.value) {
  throw createError({ statusCode: 404, message: 'Новость не найдена' })
}

const article = computed(() => {
  const item = articleData.value as any
  const rawTitle = item.title?.rendered || 'Без названия'
  return {
    id: item.id,
    title: decode(rawTitle),
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
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://kirmefhram.ru'
  return `${baseUrl}/news/${newsId}`
})

// --------------------------------------------------
// Извлечение галерей и разбивка контента на части
// --------------------------------------------------
const galleries = computed(() => {
  const content = article.value.content
  if (!content) return []

  const startRegex = /<figure class="wp-block-gallery[^>]*>/g
  let startMatch
  const result: { images: string[] }[] = []

  while ((startMatch = startRegex.exec(content)) !== null) {
    const startIndex = startMatch.index
    const startTag = startMatch[0]
    let depth = 1
    let searchPos = startIndex + startTag.length
    let endIndex = -1
    while (depth > 0 && searchPos < content.length) {
      const nextOpen = content.indexOf('<figure', searchPos)
      const nextClose = content.indexOf('</figure>', searchPos)
      if (nextClose === -1) break
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++
        searchPos = nextOpen + '<figure'.length
      } else {
        depth--
        if (depth === 0) {
          endIndex = nextClose + '</figure>'.length
          break
        }
        searchPos = nextClose + '</figure>'.length
      }
    }
    if (endIndex === -1) continue

    const galleryContent = content.substring(startIndex + startTag.length, endIndex - '</figure>'.length)
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g
    const urls: string[] = []
    let imgMatch
    while ((imgMatch = imgRegex.exec(galleryContent)) !== null) {
      urls.push(imgMatch[1])
    }
    result.push({ images: urls })
  }

  return result
})

const contentParts = computed(() => {
  let html = article.value.content
  const parts: { type: 'html' | 'gallery'; content?: string; images?: string[] }[] = []
  const startRegex = /<figure class="wp-block-gallery[^>]*>/g
  let startMatch
  let lastIndex = 0
  let galleryIdx = 0

  while ((startMatch = startRegex.exec(html)) !== null) {
    const startIndex = startMatch.index
    const startTag = startMatch[0]
    let depth = 1
    let searchPos = startIndex + startTag.length
    let endIndex = -1
    while (depth > 0 && searchPos < html.length) {
      const nextOpen = html.indexOf('<figure', searchPos)
      const nextClose = html.indexOf('</figure>', searchPos)
      if (nextClose === -1) break
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++
        searchPos = nextOpen + '<figure'.length
      } else {
        depth--
        if (depth === 0) {
          endIndex = nextClose + '</figure>'.length
          break
        }
        searchPos = nextClose + '</figure>'.length
      }
    }
    if (endIndex === -1) continue

    // Текст до текущей галереи
    if (startIndex > lastIndex) {
      const textBefore = html.substring(lastIndex, startIndex)
      if (textBefore.trim()) {
        parts.push({ type: 'html', content: textBefore })
      }
    }

    // Сама галерея
    if (galleries.value[galleryIdx]) {
      parts.push({ type: 'gallery', images: galleries.value[galleryIdx].images })
    }

    lastIndex = endIndex
    galleryIdx++
  }

  // Оставшийся текст после последней галереи
  if (lastIndex < html.length) {
    const textAfter = html.substring(lastIndex)
    if (textAfter.trim()) {
      parts.push({ type: 'html', content: textAfter })
    }
  }

  return parts
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
/* ======= Базовые стили контента ======= */
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

.wp-content :deep(h1) { font-size: 2rem; }
.wp-content :deep(h2) { font-size: 1.75rem; }
.wp-content :deep(h3) { font-size: 1.5rem; }
.wp-content :deep(h4) { font-size: 1.25rem; }
.wp-content :deep(h5) { font-size: 1rem; }
.wp-content :deep(h6) { font-size: 0.875rem; }

.wp-content :deep(strong),
.wp-content :deep(b) {
  font-weight: 700;
}

.wp-content :deep(em),
.wp-content :deep(i) {
  font-style: italic;
}

.wp-content :deep(ul),
.wp-content :deep(ol) {
  margin: 0 0 1.5em 1.5em;
  padding-left: 0;
}

.wp-content :deep(li) {
  margin-bottom: 0.5em;
}

.wp-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

/* Выравнивание */
.wp-content :deep(.aligncenter) {
  text-align: center;
  display: block;
  clear: both;
  margin-left: auto;
  margin-right: auto;
}

.wp-content :deep(.aligncenter img) {
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.wp-content :deep(.alignleft) {
  float: left;
  margin: 0 1.5em 1em 0;
}

.wp-content :deep(.alignright) {
  float: right;
  margin: 0 0 1em 1.5em;
}

.wp-content :deep(.alignnone) {
  margin: 1.5em 0;
}

.wp-content :deep(figure.aligncenter) {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5em auto;
}

.wp-content :deep(figure.alignleft) {
  float: left;
  margin: 0 1.5em 1em 0;
}

.wp-content :deep(figure.alignright) {
  float: right;
  margin: 0 0 1em 1.5em;
}

.wp-content :deep(figcaption) {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.5em;
  text-align: center;
}

.wp-content :deep(.clearfix)::after,
.wp-content :deep(.wp-caption)::after {
  content: "";
  clear: both;
  display: table;
}

.wp-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
}

.wp-content :deep(th),
.wp-content :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 0.75em;
  text-align: left;
}

.wp-content :deep(th) {
  background: #f7fafc;
  font-weight: 600;
}

/* Адаптив */
@media (max-width: 768px) {
  .wp-content :deep(.alignleft),
  .wp-content :deep(.alignright),
  .wp-content :deep(figure.alignleft),
  .wp-content :deep(figure.alignright) {
    float: none;
    display: block;
    margin: 1em auto;
  }
}
</style>