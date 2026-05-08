<template>
  <div class="w-full">
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <Megaphone class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-5xl md:text-6xl">Анонсы</h1>
        <p class="opacity-90 mx-auto max-w-2xl text-xl">
          Важные объявления и предстоящие события
        </p>
      </div>
    </section>

    <!-- Фильтр категорий -->
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

    <!-- Сетка анонсов -->
    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div v-if="filteredAnnouncements.length" class="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="article in filteredAnnouncements" :key="article.id" :to="`/announcements/${article.id}`"
          class="block">
          <Card class="group hover:shadow-xl overflow-hidden transition-shadow cursor-pointer">
            <div class="flex justify-center items-center bg-muted aspect-video overflow-hidden">
              <img v-if="article.image" :src="article.image" :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-gray-200'); }" />
              <div v-else class="flex justify-center items-center bg-gray-200 w-full h-full">
                <span class="text-gray-400 text-sm">Нет изображения</span>
              </div>
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
      <div v-else class="py-16 text-center">
        <p class="text-muted-foreground text-lg">Анонсов пока нет</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Megaphone, Calendar, ArrowRight } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Badge from '~/components/ui/Badge.vue'
import { useContentStore } from '~/stores/content'
import { decode } from 'html-entities'

const store = useContentStore()

await callOnce('announcements-list', () => store.fetchAnnouncements())

const categoriesList = computed(() => {
  const cats = new Map()
  const announcements = store.announcements || []
  announcements.forEach(article => {
    article.categories.forEach(cat => {
      if (!cats.has(cat.id)) cats.set(cat.id, { id: cat.id, name: cat.name })
    })
  })
  return [{ id: 'all', name: 'Все анонсы' }, ...Array.from(cats.values())]
})

const selectedCategory = ref('all')

const filteredAnnouncements = computed(() => {
  let items = store.announcements || []
  if (selectedCategory.value !== 'all') {
    items = items.filter(article =>
      article.categories.some(cat => cat.id === selectedCategory.value)
    )
  }
  return items.map(item => ({
    ...item,
    title: decode(item.title || '')
  }))
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
  if (article.excerpt && article.excerpt !== '') {
    return stripHtml(article.excerpt).slice(0, 250)
  }
  return stripHtml(article.content).slice(0, 250)
}

useHead({
  title: 'Анонсы | Кирилло-Мефодиевский храм',
  meta: [
    { name: 'description', content: 'Анонсы и объявления Кирилло-Мефодиевского храма города Балашихи: предстоящие события, важные уведомления.' }
  ]
})
</script>