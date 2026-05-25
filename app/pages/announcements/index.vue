<template>
  <div class="w-full">
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <Megaphone class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words">Анонсы</h1>
        <p class="opacity-90 mx-auto max-w-2xl text-lg md:text-xl">
          Важные объявления и предстоящие события
        </p>
      </div>
    </section>

    <!-- Фильтр категорий -->
    <section class="top-20 z-40 bg-white py-6 border-border border-b">
      <div class="mx-auto px-4 lg:px-8 container">
        <div class="flex flex-wrap justify-center gap-3">
          <button v-for="cat in categoriesList" :key="cat.id" @click="selectCategory(cat.id)" :class="[
            'px-4 py-2 rounded-full text-sm transition-all',
            activeCategoryId === cat.id
              ? 'bg-primary text-white'
              : 'bg-muted text-foreground hover:bg-primary/10',
          ]">
            {{ cat.name }}
          </button>
        </div>
      </div>
    </section>

    <!-- Сетка анонсов -->
    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div v-if="loading" class="py-16 text-center">
        <p class="text-muted-foreground">Загрузка анонсов...</p>
      </div>
      <div v-else-if="error" class="py-16 text-center text-destructive">
        <p>Ошибка загрузки анонсов. Попробуйте позже.</p>
      </div>
      <div v-else-if="filteredAnnouncements.length === 0" class="py-16 text-center">
        <p class="text-muted-foreground text-lg">Анонсов в этой категории пока нет</p>
      </div>
      <div v-else class="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="article in filteredAnnouncements" :key="article.id" :to="getArticleUrl(article)"
          class="block">
          <Card class="group hover:shadow-xl overflow-hidden transition-shadow cursor-pointer h-full flex flex-col">
            <div class="flex justify-center items-center bg-muted aspect-video overflow-hidden">
              <img v-if="article.image" :src="article.image" :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-gray-200'); }" />
              <div v-else class="flex justify-center items-center bg-gray-200 w-full h-full">
                <span class="text-gray-400 text-sm">Нет изображения</span>
              </div>
            </div>
            <div class="flex flex-col flex-1 p-6">
              <h3 class="mb-3 font-serif group-hover:text-primary text-xl transition-colors line-clamp-5">
                {{ article.title }}
              </h3>
              <p class="mb-4 text-muted-foreground line-clamp-3 flex-1">
                {{ getLead(article) }}
              </p>
              <div v-if="article.categories.length" class="flex flex-wrap gap-1 mb-3">
                <Badge v-for="cat in article.categories" :key="cat.id" variant="secondary" class="text-xs">
                  {{ cat.name }}
                </Badge>
              </div>
              <span class="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline">
                Читать полностью
                <ArrowRight class="w-4 h-4" />
              </span>
            </div>
          </Card>
        </NuxtLink>
      </div>

      <!-- Умная пагинация -->
      <div v-if="store.totalAnnouncementPages > 1" class="flex justify-center gap-2 mt-10">
        <button @click="goToPage(store.currentAnnouncementPage - 1)" :disabled="store.currentAnnouncementPage === 1"
          class="px-4 py-2 rounded-lg bg-muted">←</button>

        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="px-4 py-2">...</span>
          <button v-else @click="goToPage(page)"
            :class="['px-4 py-2 rounded-lg transition', page === store.currentAnnouncementPage ? 'bg-primary text-white' : 'bg-muted hover:bg-primary/10']">
            {{ page }}
          </button>
        </template>

        <button @click="goToPage(store.currentAnnouncementPage + 1)" :disabled="store.currentAnnouncementPage === store.totalAnnouncementPages"
          class="px-4 py-2 rounded-lg bg-muted">→</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Megaphone, ArrowRight } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Badge from '~/components/ui/Badge.vue'
import { useContentStore } from '~/stores/content'
import { decode } from 'html-entities'

const route = useRoute()
const store = useContentStore()
const loading = ref(false)
const error = ref(false)

// Определяем категорию из URL (?category=4)
const categoryFromUrl = route.query.category
const initialCategory = categoryFromUrl && !isNaN(Number(categoryFromUrl)) ? Number(categoryFromUrl) : null

const activeCategoryId = ref<number | null>(initialCategory)

// Загружаем все категории (один раз)
if (store.allAnnouncementCategoriesList.length === 0) {
  await store.fetchAllAnnouncementCategories()
}

const categoriesList = computed(() => [
  { id: null, name: 'Все анонсы' },
  ...store.allAnnouncementCategoriesList.filter(cat => cat.id !== 1)
])

// Первая загрузка с учётом категории из URL
try {
  loading.value = true
  await store.fetchAnnouncementsPage(1, 21, activeCategoryId.value ?? undefined)
} catch (err) {
  console.error(err)
  error.value = true
} finally {
  loading.value = false
}

const filteredAnnouncements = computed(() => {
  return (store.announcements || []).map(item => ({
    ...item,
    title: decode(item.title || '')
  }))
})

// Функция для формирования URL с использованием slug, с fallback на id
const getArticleUrl = (article: any): string => {
  if (article.slug && article.slug.trim() !== '') {
    return `/announcements/${article.slug}`
  }
  return `/announcements/${article.id}`
}

async function selectCategory(catId: number | null) {
  activeCategoryId.value = catId
  loading.value = true
  try {
    await store.fetchAnnouncementsPage(1, 21, catId ?? undefined)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function goToPage(page: number) {
  loading.value = true
  try {
    await store.fetchAnnouncementsPage(page, 21, activeCategoryId.value ?? undefined)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    error.value = true
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const getLead = (article: any) => {
  if (article.excerpt && article.excerpt !== '') {
    return stripHtml(article.excerpt).slice(0, 250)
  }
  return stripHtml(article.content).slice(0, 250)
}

// Минимальная умная пагинация
const visiblePages = computed(() => {
  const c = store.currentAnnouncementPage
  const t = store.totalAnnouncementPages
  if (t <= 5) return Array.from({ length: t }, (_, i) => i + 1)
  if (c <= 3) return [1, 2, 3, 4, '...', t]
  if (c >= t - 2) return [1, '...', t - 3, t - 2, t - 1, t]
  return [1, '...', c - 1, c, c + 1, '...', t]
})

useHead({
  title: 'Анонсы | Кирилло-Мефодиевский храм',
  meta: [{ name: 'description', content: 'Анонсы и объявления Кирилло-Мефодиевского храма города Балашихи: предстоящие события, важные уведомления.' }]
})
</script>