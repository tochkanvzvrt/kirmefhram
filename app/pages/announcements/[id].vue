<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <h1 class="mb-4 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words">
          {{ article.title }}
        </h1>
        <div class="flex justify-center gap-4 text-white/80 text-sm md:text-base">
          <span>{{ formatDate(article.date) }}</span>
          <span v-if="article.categories.length">
            • {{article.categories.map(c => c.name).join(', ')}}
          </span>
        </div>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 max-w-4xl container">
      <!-- Блок для категории "Галерея" -->
      <template v-if="isGallery">
        <div v-if="galleryImages.length" class="gallery-slider">
          <button class="slider-btn left" @click="scrollGallery(-1)" :disabled="currentSlide === 0">‹</button>
          <div class="slider-track" ref="sliderTrack">
            <img v-for="(img, i) in galleryImages" :key="i" :src="img" :alt="`Фото ${i + 1}`" class="slider-img"
              loading="lazy" />
          </div>
          <button class="slider-btn right" @click="scrollGallery(1)"
            :disabled="currentSlide >= galleryImages.length - 1">›</button>
        </div>
        <!-- Текст анонса без изображений -->
        <div v-if="textOnlyContent" v-html="textOnlyContent" class="wp-content"></div>
      </template>

      <!-- Обычный вывод контента для всех других категорий -->
      <div v-else v-html="article.content" class="wp-content"></div>

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
import { ref, computed } from 'vue'
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
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://kirmefhram.ru'
  return `${baseUrl}/announcements/${id}`
})

// --- Галерея ---
const isGallery = computed(() => {
  return article.value.categories.some(
    cat => cat.slug === 'gallery' || cat.name.toLowerCase() === 'галерея'
  )
})

const galleryImages = computed(() => {
  if (!isGallery.value || !article.value.content) return []
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g
  const urls: string[] = []
  let match
  while ((match = regex.exec(article.value.content)) !== null) {
    urls.push(match[1])
  }
  return urls
})

const textOnlyContent = computed(() => {
  if (!isGallery.value) return ''
  return article.value.content.replace(/<img[^>]*>/g, '')
})

const sliderTrack = ref<HTMLElement | null>(null)
const currentSlide = ref(0)

const scrollGallery = (dir: number) => {
  if (!sliderTrack.value) return
  const step = sliderTrack.value.clientWidth
  const newIndex = Math.max(0, Math.min(currentSlide.value + dir, galleryImages.value.length - 1))
  currentSlide.value = newIndex
  sliderTrack.value.scrollTo({ left: step * newIndex, behavior: 'smooth' })
}

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
}

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

/* ======= СЛАЙДЕР ГАЛЕРЕИ ======= */
.gallery-slider {
  position: relative;
  display: flex;
  align-items: center;
  margin: 2rem 0;
  background: #f8fafc;
  border-radius: 1rem;
  padding: 1rem;
}

.slider-track {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  flex: 1;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.slider-track::-webkit-scrollbar {
  display: none;
}

.slider-img {
  scroll-snap-align: start;
  flex-shrink: 0;
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
}

.slider-btn {
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

.slider-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.slider-btn.left {
  left: 10px;
}

.slider-btn.right {
  right: 10px;
}

/* Адаптив для мобильных */
@media (max-width: 768px) {

  .wp-content :deep(.alignleft),
  .wp-content :deep(.alignright),
  .wp-content :deep(figure.alignleft),
  .wp-content :deep(figure.alignright) {
    float: none;
    display: block;
    margin: 1em auto;
  }

  .slider-btn {
    font-size: 1.5rem;
    padding: 0.1em 0.3em;
  }
}
</style>