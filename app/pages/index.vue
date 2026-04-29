<template>
  <div class="w-full">
    <section class="relative flex justify-center items-center bg-cover bg-center h-[600px]" :style="{
      backgroundImage: `linear-gradient(rgba(26, 58, 92, 0.4), rgba(26, 58, 92, 0.6)), url(${activeBanner})`,
    }">
      <div class="px-4 text-white text-center">
        <h2 class="mb-4 text-5xl md:text-6xl lg:text-6xl">
          Кирилло-Мефодиевский храм города Балашихи
        </h2>
        <p class="opacity-90 mb-8 text-xl md:text-2xl">
          Балашихинская епархия Русской Православной Церкви (Московский Патриархат)
        </p>
        <div class="flex sm:flex-row flex-col justify-center gap-4">
          <NuxtLink to="/schedule">
            <Button size="lg" class="bg-white hover:bg-white/90 px-8 text-primary text-lg">
              Расписание богослужений
            </Button>
          </NuxtLink>
          <NuxtLink to="/submit-note">
            <Button size="lg" variant="outline"
              class="bg-transparent hover:bg-white px-8 border-2 border-white text-white hover:text-primary text-lg">
              Подать записку
            </Button>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <h2 class="mb-8 text-green-700 text-4xl text-center">Расписание богослужений</h2>
      <div v-if="upcomingSchedule.length" class="gap-6 grid grid-cols-1 md:grid-cols-3 mb-8">
        <Card v-for="(item, index) in upcomingSchedule" :key="index"
          class="transition-shadow hover:shadow-lg p-6 border-2 hover:border-accent cursor-pointer">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="font-serif text-primary text-4xl">{{ item.date }}</div>
              <div class="text-muted-foreground text-sm">{{ item.month }}</div>
            </div>
            <div class="bg-accent/10 px-3 py-1 rounded-full font-medium text-accent text-sm">
              {{ item.day }}
            </div>
          </div>
          <div v-if="item.liturgical" class="liturgical-day schedule-text" v-html="item.liturgical"></div>
          <!-- Время служб -->
          <div v-if="item.services" class="services-time schedule-text" v-html="item.services"></div>
          <div v-if="!item.liturgical && !item.services" class="text-muted-foreground text-sm">
            Нет информации
          </div>
        </Card>
      </div>
      <div v-else class="text-center text-muted-foreground">
        Нет ближайших богослужений
      </div>
      <div class="text-center">
        <NuxtLink to="/schedule">
          <Button variant="outline" class="gap-2">
            Все расписание на месяц
            <ArrowRight class="w-4 h-4" />
          </Button>
        </NuxtLink>
      </div>
    </section>

    <section class="py-16">
      <div class="mx-auto px-4 lg:px-8 container">
        <div class="mx-auto max-w-3xl text-center">
          <div class="inline-flex justify-center items-center bg-primary/10 mb-6 rounded-full w-16 h-16">
            <Church class="w-8 h-8 text-primary" />
          </div>
          <h2 class="mb-6 text-primary text-4xl">О храме</h2>
          <p class="mb-6 text-muted-foreground text-lg leading-relaxed">
            Кирилло-Мефодиевский храм расположен в микрорайоне Железнодорожный города
            Балашиха. Храм освящен в честь святых равноапостольных Кирилла и Мефодия,
            создателей славянской азбуки и проповедников христианства.
          </p>
          <NuxtLink to="/about">
            <Button class="gap-2">
              Читать далее
              <ArrowRight class="w-4 h-4" />
            </Button>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="py-6 border-border border-y">
      <div class="mx-auto px-4 lg:px-8 container">
        <div class="flex flex-col justify-between items-center gap-4 mx-auto max-w-4xl">
          <div class="flex items-center gap-3 md:text-left text-center">
            <div>
              <p class="text-muted-foreground text-sm">Ваши пожертвования помогают храму</p>
            </div>
          </div>
          <NuxtLink to="/donations">
            <Button class="gap-2">
              Поддержать храм
            </Button>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <h2 class="mb-8 text-primary text-4xl text-center">Анонсы</h2>
      <div v-if="latestAnnouncements.length"
        class="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-auto mb-8 max-w-5xl">
        <Card v-for="announcement in latestAnnouncements" :key="announcement.id"
          class="group flex flex-col hover:shadow-xl h-full overflow-hidden transition-shadow">
          <div class="bg-muted aspect-video overflow-hidden">
            <img v-if="announcement.image" :src="announcement.image" :alt="announcement.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              @error="(e) => e.target.src = '/images/question.png'" />
            <div v-else class="flex justify-center items-center bg-gray-200 w-full h-full">
              <span class="text-gray-400 text-sm">Нет изображения</span>
            </div>
          </div>
          <div class="flex flex-col flex-1 p-6">
            <div class="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
              <Calendar class="w-4 h-4" />
              <span>{{ formatDate(announcement.date) }}</span>
            </div>
            <h3 class="mb-3 font-serif group-hover:text-primary text-xl line-clamp-2 transition-colors">
              {{ announcement.title }}
            </h3>
            <p class="flex-1 mb-4 text-muted-foreground line-clamp-3">
              {{ stripHtml(announcement.content) }}
            </p>
            <NuxtLink :to="`/announcements/${announcement.id}`"
              class="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline">
              Читать полностью
              <ArrowRight class="w-4 h-4" />
            </NuxtLink>
          </div>
        </Card>
      </div>
      <div v-else class="text-center text-muted-foreground">
        Нет анонсов
      </div>
      <div class="text-center">
        <NuxtLink to="/announcements">
          <Button variant="outline" class="gap-2">
            Все анонсы
            <ArrowRight class="w-4 h-4" />
          </Button>
        </NuxtLink>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <h2 class="mb-8 text-primary text-4xl text-center">Последние новости</h2>
      <div v-if="latestNews.length" class="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-auto mb-8 max-w-5xl">
        <Card v-for="news in latestNews" :key="news.id"
          class="group flex flex-col hover:shadow-xl h-full overflow-hidden transition-shadow">
          <div class="bg-muted aspect-video overflow-hidden">
            <img :src="news.image || '/images/question.png'" :alt="news.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              @error="(e) => e.target.src = '/images/question.png'" />
          </div>
          <div class="flex flex-col flex-1 p-6">
            <div class="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
              <Calendar class="w-4 h-4" />
              <span>{{ formatDate(news.date) }}</span>
            </div>
            <h3 class="mb-3 font-serif group-hover:text-primary text-xl line-clamp-2 transition-colors">
              {{ news.title }}
            </h3>
            <p class="flex-1 mb-4 text-muted-foreground line-clamp-3">
              {{ stripHtml(news.excerpt || news.content) }}
            </p>
            <NuxtLink :to="`/news/${news.id}`"
              class="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline">
              Читать полностью
              <ArrowRight class="w-4 h-4" />
            </NuxtLink>
          </div>
        </Card>
      </div>
      <div v-else class="text-center text-muted-foreground">
        Нет новостей
      </div>
      <div class="text-center">
        <NuxtLink to="/news">
          <Button variant="outline" class="gap-2">
            Все новости
            <ArrowRight class="w-4 h-4" />
          </Button>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Church, ArrowRight, Calendar } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import { useContentStore } from '~/stores/content'

const store = useContentStore()

await callOnce('main-news', () => store.fetchNews())
await callOnce('main-announcements', () => store.fetchAnnouncements())
await callOnce('main-schedule', () => store.fetchSchedule())

const bannerImages = ref<string[]>([])
const currentBannerIndex = ref(0)
const defaultBanner = '/images/home.jpg'
const activeBanner = computed(() => bannerImages.value[currentBannerIndex.value] || defaultBanner)

const fetchBanners = async () => {
  try {
    const config = useRuntimeConfig()
    const wpBase = config.public.wpApi
    const res = await fetch(`${wpBase}/wp-json/wp/v2/banner`)
    const banners = await res.json()
    const images: string[] = []
    for (const item of banners) {
      if (item.banner?.guid) images.push(item.banner.guid)
      if (item.banner2?.guid) images.push(item.banner2.guid)
    }
    bannerImages.value = images.length > 0 ? images : [defaultBanner]
  } catch (err) {
    console.error('fetchBanners error:', err)
    bannerImages.value = [defaultBanner]
  }
}

onMounted(() => {
  fetchBanners()
  setInterval(() => {
    if (bannerImages.value.length > 1) {
      currentBannerIndex.value = (currentBannerIndex.value + 1) % bannerImages.value.length
    }
  }, 60000)
  setTimeout(() => {
    if (bannerImages.value.length > 1) {
      currentBannerIndex.value = Math.floor(Math.random() * bannerImages.value.length)
    }
  }, 50)
})

// Computed (данные из стора уже есть на сервере и клиенте)
const latestNews = computed(() => {
  const news = store.news || []
  return [...news]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
})

const latestAnnouncements = computed(() => {
  const announcements = store.announcements || []
  return [...announcements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
})

const upcomingSchedule = computed(() => {
  // Используем геттер стора, который возвращает первые 3 заполненных дня
  const filled = store.filledScheduleForTodayAndNextTwo || []
  const monthNames = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  return filled.map(item => {
    const monthNum = parseInt(item.fullDate?.split('-')[1] || '0', 10)
    const month = monthNames[monthNum - 1] || ''
    return {
      date: item.date || '',
      month,
      day: item.day || '',
      liturgical: item.liturgical || '',
      services: item.services || '',
    }
  })
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
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
</script>

<style scoped>
.schedule-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
}

.schedule-text :deep(strong),
.schedule-text :deep(b) {
  font-weight: 700 !important;
}

.schedule-text :deep(em),
.schedule-text :deep(i) {
  font-style: italic !important;
}

.liturgical-day {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.liturgical-day :deep(p) {
  margin: 0 0 0.75rem 0;
}

.liturgical-day :deep(strong),
.liturgical-day :deep(b) {
  font-size: 1.25rem;
  font-weight: 700 !important;
}

.services-time {
  font-size: 0.95rem;
}

.services-time :deep(p) {
  margin: 0.5rem 0;
}
</style>