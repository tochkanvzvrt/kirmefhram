<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <Newspaper class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-5xl md:text-6xl">Новости</h1>
        <p class="opacity-90 mx-auto max-w-2xl text-xl">
          События и объявления прихода
        </p>
      </div>
    </section>

    <section class="top-20 z-40 sticky bg-white py-6 border-border border-b">
      <div class="mx-auto px-4 lg:px-8 container">
        <div class="flex flex-wrap justify-center gap-3">
          <button v-for="cat in categoriesList" :key="cat.id" @click="selectedCategory = cat.id" :class="[
            'px-4 py-2 rounded-full text-sm transition-all',
            selectedCategory === cat.id
              ? 'bg-primary text-white'
              : 'bg-muted text-foreground hover:bg-primary/10',
          ]">
            {{ cat.name }}
          </button>
        </div>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div v-if="store.news.length === 0 && !error" class="py-16 text-center">
        <p class="text-muted-foreground">Загрузка новостей...</p>
      </div>
      <div v-else-if="error" class="py-16 text-center text-destructive">
        <p>Ошибка загрузки новостей. Попробуйте позже.</p>
      </div>
      <div v-else class="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="article in filteredNews" :key="article.id" :to="`/news/${article.id}`" class="block">
          <Card class="group hover:shadow-xl overflow-hidden transition-shadow cursor-pointer">
            <div class="bg-muted aspect-video overflow-hidden">
              <img :src="article.image || '/images/question.png'" :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="(e) => e.target.src = '/images/question.png'" />
            </div>
            <div class="p-6">
              <div class="flex justify-between items-center mb-3">
                <div class="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar class="w-4 h-4" />
                  <span>{{ formatDate(article.date) }}</span>
                </div>
                <Badge v-if="article.categories.length" variant="secondary">
                  {{ article.categories[0].name }}
                </Badge>
              </div>
              <h3 class="mb-3 font-serif group-hover:text-primary text-xl transition-colors">
                {{ article.title }}
              </h3>
              <p class="mb-4 text-muted-foreground line-clamp-3">
                {{ getLead(article) }}
              </p>
              <button class="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline">
                Читать полностью
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </Card>
        </NuxtLink>
      </div>

      <div v-if="filteredNews.length === 0 && store.news.length > 0" class="py-16 text-center">
        <p class="text-muted-foreground text-lg">Новостей в этой категории пока нет</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Newspaper, Calendar, ArrowRight } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Badge from '~/components/ui/Badge.vue'
import { useContentStore } from '~/stores/content'

const store = useContentStore()
const error = ref(false)

if (store.news.length === 0) {
  try {
    await store.fetchAllNews()
  } catch (err) {
    console.error(err)
    error.value = true
  }
}

const categoriesList = computed(() => {
  const cats = new Map()
  store.news.forEach(article => {
    article.categories.forEach(cat => {
      if (!cats.has(cat.id)) {
        cats.set(cat.id, { id: cat.id, name: cat.name })
      }
    })
  })
  return [
    { id: 'all', name: 'Все новости' },
    ...Array.from(cats.values())
  ]
})

const selectedCategory = ref('all')

const filteredNews = computed(() => {
  let news = store.news || []
  if (selectedCategory.value !== 'all') {
    news = news.filter(article =>
      article.categories.some(cat => cat.id === selectedCategory.value)
    )
  }
  return news
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

const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const getLead = (article: any) => {
  const text = article.excerpt && article.excerpt !== ''
    ? article.excerpt
    : article.content
  return stripHtml(text).slice(0, 250)
}

useHead({
  title: 'Новости | Кирилло-Мефодиевский храм',
  meta: [
    { name: 'description', content: 'Новости и события Кирилло-Мефодиевского храма города Балашихи.' }
  ]
})
</script>