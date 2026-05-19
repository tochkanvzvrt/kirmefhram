<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <Users class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words">
          Молодёжный кружок
        </h1>
        <p class="opacity-90 mx-auto max-w-2xl text-lg md:text-xl">
          Место встречи православной молодёжи
        </p>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div class="mx-auto max-w-4xl">
        <div class="mb-16 max-w-none prose prose-lg">
          <p v-if="loading" class="text-muted-foreground text-lg leading-relaxed">
            Загрузка информации...
          </p>
          <div v-else v-html="youthClubText" class="text-muted-foreground text-lg leading-relaxed"></div>
        </div>

        <div v-if="loading" class="bg-muted/50 p-8 rounded-lg">
          <p class="text-muted-foreground">Загрузка контактной информации...</p>
        </div>

        <div v-else class="bg-muted/50 p-8 rounded-lg">
          <div class="flex items-start gap-4 mb-6">
            <div class="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-full w-12 h-12">
              <Users class="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 class="mb-2 font-serif text-primary text-2xl">Присоединяйтесь к нам</h3>
              <div v-html="joinText" class="text-muted-foreground text-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Последние новости молодёжного кружка -->
    <section class="bg-white py-16">
      <div class="mx-auto px-4 lg:px-8 container">
        <h2 class="mb-8 font-serif text-primary text-4xl text-center">Новости молодёжного кружка</h2>

        <div v-if="loadingYouthNews" class="py-16 text-center">
          <p class="text-muted-foreground">Загрузка новостей...</p>
        </div>

        <div v-else-if="latestYouthNews.length === 0" class="py-16 text-center">
          <p class="text-muted-foreground">Новостей пока нет</p>
        </div>

        <div v-else class="gap-8 grid grid-cols-1 md:grid-cols-2 mx-auto mb-8 max-w-5xl">
          <Card v-for="item in latestYouthNews" :key="item.id"
            class="group hover:shadow-xl overflow-hidden transition-shadow">
            <div class="bg-muted aspect-video overflow-hidden">
              <img :src="item.image || '/images/question.png'" :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="(e) => e.target.src = '/images/question.png'" />
            </div>
            <div class="p-6">
              <div class="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
                <Calendar class="w-4 h-4" />
                <span>{{ formatDate(item.date) }}</span>
              </div>
              <h3 class="mb-3 font-serif group-hover:text-primary text-xl line-clamp-2 transition-colors">
                {{ item.title }}
              </h3>
              <p class="mb-4 text-muted-foreground line-clamp-3">
                {{ stripHtml(item.excerpt || item.content) }}
              </p>
              <NuxtLink :to="`/news/${item.id}`"
                class="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline">
                Читать полностью
                <ArrowRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </Card>
        </div>

        <div class="text-center">
          <NuxtLink :to="`/news?category=${YOUTH_CATEGORY_ID}`" class="inline-flex items-center gap-2 text-primary hover:underline">
            Все новости
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Последние анонсы молодёжного кружка -->
    <section class="bg-white py-16">
      <div class="mx-auto px-4 lg:px-8 container">
        <h2 class="mb-8 font-serif text-primary text-4xl text-center">Анонсы молодёжного кружка</h2>

        <div v-if="loadingYouthAnnouncements" class="py-16 text-center">
          <p class="text-muted-foreground">Загрузка анонсов...</p>
        </div>

        <div v-else-if="latestYouthAnnouncements.length === 0" class="py-16 text-center">
          <p class="text-muted-foreground">Анонсов пока нет</p>
        </div>

        <div v-else class="gap-8 grid grid-cols-1 md:grid-cols-2 mx-auto mb-8 max-w-5xl">
          <Card v-for="item in latestYouthAnnouncements" :key="item.id"
            class="group hover:shadow-xl overflow-hidden transition-shadow">
            <div class="bg-muted aspect-video overflow-hidden">
              <img :src="item.image || '/images/question.png'" :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="(e) => e.target.src = '/images/question.png'" />
            </div>
            <div class="p-6">
              <div class="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
                <Calendar class="w-4 h-4" />
                <span>{{ formatDate(item.date) }}</span>
              </div>
              <h3 class="mb-3 font-serif group-hover:text-primary text-xl line-clamp-2 transition-colors">
                {{ item.title }}
              </h3>
              <p class="mb-4 text-muted-foreground line-clamp-3">
                {{ stripHtml(item.content) }}
              </p>
              <NuxtLink :to="`/announcements/${item.id}`"
                class="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline">
                Читать полностью
                <ArrowRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </Card>
        </div>

        <div class="text-center">
          <NuxtLink :to="`/announcements?category=${YOUTH_CATEGORY_ID}`" class="inline-flex items-center gap-2 text-primary hover:underline">
            Все анонсы
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Users, Heart, Calendar, Clock, MapPin, ArrowRight } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Badge from '~/components/ui/Badge.vue'
import { useContentStore } from '~/stores/content'
import { decode } from 'html-entities'

const store = useContentStore()
const loading = ref(true)
const loadingYouthNews = ref(false)
const loadingYouthAnnouncements = ref(false)

const youthClubText = ref<string>('')
const joinText = ref<string>('')

const YOUTH_CATEGORY_ID = 4 // ID категории «Молодёжный кружок» в WordPress

const formatText = (text: string): string => {
  if (!text) return ''
  return text
    .replace(/\r\n/g, '<br>')
    .replace(/\n/g, '<br>')
    .replace(/\t/g, '&nbsp;&nbsp;')
}

const fetchYouthClub = async () => {
  try {
    const res = await fetch('https://admin.kirmefhram.ru/wp-json/wp/v2/youthclub')
    const data = await res.json()

    if (Array.isArray(data) && data.length > 0) {
      const item = data[0]

      if (item.description) {
        youthClubText.value = formatText(item.description)
      }

      if (item.entry) {
        joinText.value = formatText(item.entry)
      }
    }
  } catch (err) {
    console.error('fetchYouthClub error:', err)
    youthClubText.value = ''
    joinText.value = ''
  } finally {
    loading.value = false
  }
}

// Загружаем 4 последние новости по категории «Молодёжный кружок» напрямую из API
const youthNews = ref<any[]>([])
async function fetchYouthNews() {
  loadingYouthNews.value = true
  try {
    const config = useRuntimeConfig()
    const wpBase = config.public.wpApi
    const data = await $fetch(`${wpBase}/wp-json/wp/v2/new`, {
      params: {
        _embed: true,
        per_page: 4,
        categories: YOUTH_CATEGORY_ID,
        orderby: 'date',
        order: 'desc'
      }
    })
    if (Array.isArray(data)) {
      youthNews.value = data
    }
  } catch (err) {
    console.error('fetchYouthNews error:', err)
    youthNews.value = []
  } finally {
    loadingYouthNews.value = false
  }
}

// Загружаем 4 последних анонса по категории «Молодёжный кружок» напрямую из API
const youthAnnouncements = ref<any[]>([])
async function fetchYouthAnnouncements() {
  loadingYouthAnnouncements.value = true
  try {
    const config = useRuntimeConfig()
    const wpBase = config.public.wpApi
    const data = await $fetch(`${wpBase}/wp-json/wp/v2/announcement`, {
      params: {
        _embed: true,
        per_page: 4,
        categories: YOUTH_CATEGORY_ID,
        orderby: 'date',
        order: 'desc'
      }
    })
    if (Array.isArray(data)) {
      youthAnnouncements.value = data
    }
  } catch (err) {
    console.error('fetchYouthAnnouncements error:', err)
    youthAnnouncements.value = []
  } finally {
    loadingYouthAnnouncements.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchYouthClub(),
    fetchYouthNews(),
    fetchYouthAnnouncements()
  ])
})

// Преобразуем сырые данные новостей
const latestYouthNews = computed(() => {
  return youthNews.value.map((item: any) => ({
    id: item.id,
    title: decode(item.title?.rendered || 'Без названия'),
    content: item.content?.rendered || '',
    excerpt: item.excerpt?.rendered || '',
    date: item.date || '',
    image: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    categories: item._embedded?.['wp:term']?.[0]?.map((term: any) => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
    })) || [],
  }))
})

// Преобразуем сырые данные анонсов
const latestYouthAnnouncements = computed(() => {
  return youthAnnouncements.value.map((item: any) => ({
    id: item.id,
    title: decode(item.title?.rendered || 'Без названия'),
    content: item.content?.rendered || '',
    date: item.date || '',
    image: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    categories: item._embedded?.['wp:term']?.[0]?.map((term: any) => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
    })) || [],
  }))
})

const formatDate = (dateStr: string): string => {
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
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}
</script>