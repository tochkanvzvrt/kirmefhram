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

    <!-- Контент с автоматической заменой wp-block-gallery на слайдеры -->
    <section class="mx-auto px-4 lg:px-8 py-16 max-w-4xl container">
      <div v-html="processedContent" class="wp-content widget-gallery-zone"></div>

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
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRuntimeConfig } from '#app'
import { decode } from 'html-entities'

const route = useRoute()
const config = useRuntimeConfig()
const wpBase = config.public.wpApi
const newsId = route.params.id

// Простая очистка HTML для мета-описания
const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// Загрузка новости
const { data: articleData, error } = await useFetch(
  `${wpBase}/wp-json/wp/v2/new/${newsId}?_embed=true`
)

if (error.value || !articleData.value) {
  throw createError({ statusCode: 404, message: 'Новость не найдена' })
}

// Формируем данные статьи, декодируем заголовок
const article = computed(() => {
  const item = articleData.value as any
  const rawTitle = item.title?.rendered || 'Без названия'
  return {
    id: item.id,
    title: decode(rawTitle), // ← HTML-сущности превращаются в обычные символы
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

// --- Обработка wp-block-gallery (с учётом вложенных <figure>) ---
const galleryCounter = ref(0)
const galleriesData = ref<{ id: number; images: string[] }[]>([])

const processedContent = computed(() => {
  let html = article.value.content
  galleriesData.value = []
  galleryCounter.value = 0

  // Ищем открывающий тег внешней галереи
  const galleryStartRegex = /<figure class="wp-block-gallery[^>]*>/g
  let match
  while ((match = galleryStartRegex.exec(html)) !== null) {
    const startIndex = match.index
    const startTag = match[0]

    // Ищем соответствующий закрывающий </figure> с учётом вложенности
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

    // Извлекаем весь блок галереи и его содержимое (без внешнего <figure>)
    const galleryBlock = html.substring(startIndex, endIndex)
    const galleryContent = html.substring(startIndex + startTag.length, endIndex - '</figure>'.length)

    // Собираем все src изображений внутри
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g
    const urls: string[] = []
    let imgMatch
    while ((imgMatch = imgRegex.exec(galleryContent)) !== null) {
      urls.push(imgMatch[1])
    }

    if (urls.length > 0) {
      galleriesData.value.push({ id: galleryCounter.value, images: urls })
      const placeholder = `<div class="vue-gallery" data-gallery-id="${galleryCounter.value}"></div>`
      // Заменяем оригинальный блок галереи на placeholder
      html = html.substring(0, startIndex) + placeholder + html.substring(endIndex)
      galleryCounter.value++
      // Сброс поиска, чтобы корректно обработать оставшиеся галереи
      galleryStartRegex.lastIndex = 0
    }
  }

  return html
})

// После монтирования заменяем placeholder'ы реальными слайдерами
onMounted(() => {
  document.querySelectorAll('.vue-gallery').forEach((el) => {
    const galleryId = parseInt(el.getAttribute('data-gallery-id') || '0', 10)
    const gallery = galleriesData.value.find(g => g.id === galleryId)
    if (!gallery || gallery.images.length === 0) return

    const wrapper = document.createElement('div')
    wrapper.className = 'gallery-slider'

    const track = document.createElement('div')
    track.className = 'slider-track'
    gallery.images.forEach((src) => {
      const img = document.createElement('img')
      img.src = src
      img.className = 'slider-img'
      img.loading = 'lazy'
      track.appendChild(img)
    })

    const leftBtn = document.createElement('button')
    leftBtn.className = 'slider-btn left'
    leftBtn.innerHTML = '‹'
    leftBtn.onclick = () => {
      track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' })
    }

    const rightBtn = document.createElement('button')
    rightBtn.className = 'slider-btn right'
    rightBtn.innerHTML = '›'
    rightBtn.onclick = () => {
      track.scrollBy({ left: track.clientWidth, behavior: 'smooth' })
    }

    wrapper.appendChild(leftBtn)
    wrapper.appendChild(track)
    wrapper.appendChild(rightBtn)

    el.replaceWith(wrapper)
  })
})

// SEO
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

/* ======= Стили слайдера ======= */
.widget-gallery-zone :deep(.gallery-slider) {
  position: relative;
  display: flex;
  align-items: center;
  margin: 2rem 0;
  background: #f8fafc;
  border-radius: 1rem;
  padding: 1rem;
}

.widget-gallery-zone :deep(.slider-track) {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  flex: 1;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.widget-gallery-zone :deep(.slider-track::-webkit-scrollbar) {
  display: none;
}

.widget-gallery-zone :deep(.slider-img) {
  scroll-snap-align: start;
  flex-shrink: 0;
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
}

.widget-gallery-zone :deep(.slider-btn) {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  font-size: 2rem;
  padding: 0.2em 0.4em;
  cursor: pointer;
  border-radius: 50%;
  position: absolute;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  color: #333;
}

.widget-gallery-zone :deep(.slider-btn:disabled) {
  opacity: 0.3;
  cursor: default;
}

.widget-gallery-zone :deep(.slider-btn.left) {
  left: 10px;
}

.widget-gallery-zone :deep(.slider-btn.right) {
  right: 10px;
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

  .widget-gallery-zone :deep(.slider-btn) {
    font-size: 1.5rem;
    padding: 0.1em 0.3em;
  }
}
</style>