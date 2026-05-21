<template>
  <div class="w-full">
    <!-- Hero с превью-фото или градиентом -->
    <section class="relative flex justify-center items-center py-20 text-white overflow-hidden"
      :class="article.image ? '' : 'bg-gradient-to-br from-primary to-primary/80'">
      <!-- Затемнённое превью-фото -->
      <img v-if="article.image" :src="article.image" :alt="article.title"
        class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0" :class="article.image ? 'bg-black/60' : ''"></div>
      <div class="relative z-10 mx-auto px-4 lg:px-8 text-center container">
        <h1 class="mb-4 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words">
          {{ article.title }}
        </h1>
        <div class="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-white/80 text-sm md:text-base">
          <span v-if="article.categories.length" class="flex flex-wrap justify-center gap-1">
            <span v-for="(cat, i) in article.categories" :key="cat.id">
              <span v-if="i > 0 || article.date" class="mr-1">•</span>{{ cat.name }}
            </span>
          </span>
        </div>
      </div>
    </section>

    <!-- Контент анонса (с обычной галереей WordPress) -->
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

    <!-- Лайтбокс -->
    <Teleport to="body">
      <div v-if="lightboxImage" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        @click="closeLightbox">
        <button class="absolute top-4 right-4 text-white text-3xl hover:opacity-70 transition" @click="closeLightbox">
          ✕
        </button>
        <img :src="lightboxImage" class="max-w-full max-h-full object-contain rounded-lg" @click.stop />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRuntimeConfig } from '#app'
import { decode } from 'html-entities'
import { computed, onMounted, onUnmounted, ref } from 'vue'

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
  return `${baseUrl}/announcements/${id}`
})

// Лайтбокс
const lightboxImage = ref<string | null>(null)

function openLightbox(src: string) {
  lightboxImage.value = src
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxImage.value = null
  document.body.style.overflow = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && lightboxImage.value) {
    closeLightbox()
  }
}

onMounted(() => {
  document.querySelector('.wp-content')?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'IMG') {
      const src = target.getAttribute('src')
      if (src) openLightbox(src)
    }
  })
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
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

.wp-content :deep(h1) {
  font-size: 2rem;
}

.wp-content :deep(h2) {
  font-size: 1.75rem;
}

.wp-content :deep(h3) {
  font-size: 1.5rem;
}

.wp-content :deep(h4) {
  font-size: 1.25rem;
}

.wp-content :deep(h5) {
  font-size: 1rem;
}

.wp-content :deep(h6) {
  font-size: 0.875rem;
}

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
  cursor: pointer;
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

/* Ссылки */
.wp-content :deep(a) {
  color: rgb(138, 45, 30);
  text-decoration: underline;
  transition: color 0.2s;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.wp-content :deep(a:hover) {
  color: rgb(162, 85, 73);
}

.wp-content :deep(a:visited) {
  color: #7c3aed;
}

.wp-content :deep(.has-text-align-center) {
  text-align: center;
}

.wp-content :deep(.has-text-align-right) {
  text-align: right;
}

.wp-content :deep(.has-text-align-left) {
  text-align: left;
}

/* Все варианты выравнивания текста из админки */
.wp-content :deep(.has-text-align-left) {
  text-align: left;
}

.wp-content :deep(.has-text-align-center) {
  text-align: center;
}

.wp-content :deep(.has-text-align-right) {
  text-align: right;
}

.wp-content :deep(.has-text-align-justify) {
  text-align: justify;
}

/* Выравнивание для заголовков */
.wp-content :deep(h1.has-text-align-left),
.wp-content :deep(h2.has-text-align-left),
.wp-content :deep(h3.has-text-align-left),
.wp-content :deep(h4.has-text-align-left),
.wp-content :deep(h5.has-text-align-left),
.wp-content :deep(h6.has-text-align-left) {
  text-align: left;
}

.wp-content :deep(h1.has-text-align-center),
.wp-content :deep(h2.has-text-align-center),
.wp-content :deep(h3.has-text-align-center),
.wp-content :deep(h4.has-text-align-center),
.wp-content :deep(h5.has-text-align-center),
.wp-content :deep(h6.has-text-align-center) {
  text-align: center;
}

.wp-content :deep(h1.has-text-align-right),
.wp-content :deep(h2.has-text-align-right),
.wp-content :deep(h3.has-text-align-right),
.wp-content :deep(h4.has-text-align-right),
.wp-content :deep(h5.has-text-align-right),
.wp-content :deep(h6.has-text-align-right) {
  text-align: right;
}

/* Цвета текста */
.wp-content :deep(.has-primary-color) {
  color: var(--wp--preset--color--primary, #1a3a5c);
}

.wp-content :deep(.has-secondary-color) {
  color: var(--wp--preset--color--secondary, #6b7280);
}

.wp-content :deep(.has-text-color) {
  color: inherit;
}

/* Размеры текста */
.wp-content :deep(.has-small-font-size) {
  font-size: 0.875rem;
}

.wp-content :deep(.has-medium-font-size) {
  font-size: 1.25rem;
}

.wp-content :deep(.has-large-font-size) {
  font-size: 1.5rem;
}

.wp-content :deep(.has-x-large-font-size) {
  font-size: 2rem;
}

/* Кнопки из Гутенберга */
.wp-content :deep(.wp-block-button__link) {
  display: inline-block;
  padding: 0.75em 1.5em;
  border-radius: 0.5rem;
  background-color: var(--primary, #1a3a5c);
  color: #fff;
  text-decoration: none;
  transition: background-color 0.2s;
}

.wp-content :deep(.wp-block-button__link:hover) {
  background-color: var(--primary-dark, #152d4a);
}

/* Цитаты */
.wp-content :deep(.wp-block-quote) {
  border-left: 4px solid var(--primary, #1a3a5c);
  padding-left: 1em;
  margin: 1.5em 0;
  font-style: italic;
  color: #4a5568;
}

/* Разделители */
.wp-content :deep(.wp-block-separator) {
  border: none;
  height: 2px;
  background-color: #e2e8f0;
  margin: 2em 0;
}

/* Списки с галочками и другие */
.wp-content :deep(.wp-block-list) {
  list-style-position: inside;
}

/* ======= СТАНДАРТНАЯ ГАЛЕРЕЯ WORDPRESS (сетка) ======= */
.wp-content :deep(.wp-block-gallery) {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
  gap: 16px !important;
  margin: 2rem 0 !important;
}

.wp-content :deep(.wp-block-gallery .blocks-gallery-item) {
  margin: 0 !important;
  position: relative;
}

.wp-content :deep(.wp-block-gallery figure) {
  margin: 0;
  display: flex;
  flex-direction: column;
}

.wp-content :deep(.wp-block-gallery img) {
  width: 100% !important;
  height: auto !important;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.2s;
  cursor: pointer;
}

.wp-content :deep(.wp-block-gallery img:hover) {
  transform: scale(1.02);
}

/* ======= АДАПТИВ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ ======= */
@media (max-width: 768px) {

  /* Отмена обтекания для выравненных элементов */
  .wp-content :deep(.alignleft),
  .wp-content :deep(.alignright),
  .wp-content :deep(figure.alignleft),
  .wp-content :deep(figure.alignright) {
    float: none;
    display: block;
    margin: 1em auto;
  }

  /* Адаптив для iframe (видео) — только на мобилках */
  .wp-content :deep(iframe) {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    aspect-ratio: 16 / 9;
    border-radius: 0.5rem;
    display: block;
    box-sizing: border-box;
  }

  /* Галерея: 2 колонки на планшетах/телефонах */
  .wp-content :deep(.wp-block-gallery) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
    gap: 12px !important;
  }
}

@media (max-width: 480px) {

  /* На очень узких экранах — 1 колонка */
  .wp-content :deep(.wp-block-gallery) {
    grid-template-columns: 1fr !important;
  }
}
</style>