<template>
  <div class="w-full">
    <section
      class="relative flex justify-center items-center h-[600px] bg-gradient-to-br from-primary to-primary/80 overflow-hidden">
      <img v-if="activeBanner" :src="activeBanner" alt="" @load="onBannerLoad"
        class="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out"
        :class="bannerImgClass" />
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/60 transition-opacity duration-1000 ease-out"
        :class="{ 'opacity-0': bannerLoaded, 'opacity-100': !bannerLoaded }"></div>
      <div class="relative z-10 px-4 text-white text-center">
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

      <div v-if="upcomingSchedule.length" class="hidden md:grid gap-6 grid-cols-3 mb-8">
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
          <div v-if="item.services" class="services-time schedule-text" v-html="item.services"></div>
          <div v-if="!item.liturgical && !item.services" class="text-muted-foreground text-sm">
            Нет информации
          </div>
        </Card>
      </div>

      <div v-if="upcomingSchedule.length" class="md:hidden relative">
        <div class="flex items-center">
          <button @click="scrollSchedule(-1)" :disabled="scheduleSlideIndex <= 0"
            class="absolute left-0 z-10 bg-white/80 rounded-full p-2 shadow-md disabled:opacity-30 transition-opacity">
            <ChevronLeft class="w-5 h-5 text-primary" />
          </button>

          <div ref="scheduleSlider"
            class="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory scrollbar-hide px-2"
            style="scrollbar-width: none; -ms-overflow-style: none;">
            <div v-for="(item, index) in upcomingSchedule" :key="index"
              class="snap-center flex-shrink-0 w-[85vw] max-w-[380px]">
              <Card class="transition-shadow hover:shadow-lg p-6 border-2 hover:border-accent cursor-pointer h-full">
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
                <div v-if="item.services" class="services-time schedule-text" v-html="item.services"></div>
                <div v-if="!item.liturgical && !item.services" class="text-muted-foreground text-sm">
                  Нет информации
                </div>
              </Card>
            </div>
          </div>

          <button @click="scrollSchedule(1)" :disabled="scheduleSlideIndex >= upcomingSchedule.length - 1"
            class="absolute right-0 z-10 bg-white/80 rounded-full p-2 shadow-md disabled:opacity-30 transition-opacity">
            <ChevronRight class="w-5 h-5 text-primary" />
          </button>
        </div>

        <div class="flex justify-center gap-2 mt-4">
          <span v-for="(item, idx) in upcomingSchedule" :key="idx"
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="idx === scheduleSlideIndex ? 'bg-primary w-4' : 'bg-primary/30'"></span>
        </div>
      </div>

      <div v-else class="text-center text-muted-foreground">
        Нет ближайших богослужений
      </div>

      <div class="text-center mt-8">
        <NuxtLink to="/schedule">
          <Button variant="outline" class="gap-2">
            Все расписание на месяц
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
              @error="(e) => (e.target.src = '/images/question.png')" />
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

    <section class="py-16 border-border border-t">
      <div class="mx-auto px-4 lg:px-8 container">
        <div class="mx-auto max-w-3xl text-center">
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
              @error="(e) => (e.target.src = '/images/question.png')" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Church, ArrowRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import { useContentStore } from '~/stores/content'
import { decode } from 'html-entities'

useSeoMeta({
  title: 'Кирилло-Мефодиевский храм Балашихи | Официальный сайт',
  description:
    'Официальный сайт Кирилло-Мефодиевского храма в микрорайоне Железнодорожный города Балашиха. Расписание богослужений, новости прихода, воскресная школа, анонсы. Балашихинская епархия Русской Православной Церкви.',
  ogTitle: 'Кирилло-Мефодиевский храм Балашихи',
  ogDescription: 'Расписание богослужений, новости, анонсы Кирилло-Мефодиевского храма в Балашихе',
  ogImage: '/images/home.jpg',
  ogUrl: 'https://kirmefhram.ru',
})

const store = useContentStore()

await callOnce('main-news', () => store.fetchNews())
await callOnce('main-announcements', () => store.fetchAnnouncements())
await callOnce('main-schedule', () => store.fetchSchedule())

const bannerImages = ref<string[]>([])
const currentBannerIndex = ref(0)
const bannersLoaded = ref(false)
const bannerLoaded = ref(false)

const scheduleSlider = ref<HTMLElement | null>(null)
const scheduleSlideIndex = ref(0)

const activeBanner = computed(() => {
  if (!bannersLoaded.value || bannerImages.value.length === 0) return ''
  return bannerImages.value[currentBannerIndex.value] || bannerImages.value[0] || ''
})

const bannerImgClass = computed(() => {
  return bannerLoaded.value ? 'blur-0' : 'blur-xl'
})

function onBannerLoad() {
  bannerLoaded.value = true
}

watch(currentBannerIndex, () => {
  bannerLoaded.value = false
})

function scrollSchedule(dir: number) {
  if (!scheduleSlider.value) return
  const slides = scheduleSlider.value.children as HTMLCollectionOf<HTMLElement>
  let newIndex = scheduleSlideIndex.value + dir
  if (newIndex < 0) newIndex = 0
  if (newIndex >= slides.length) newIndex = slides.length - 1
  scheduleSlideIndex.value = newIndex
  slides[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
}

let rotationTimer: ReturnType<typeof setInterval> | null = null

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
    if (images.length > 0) {
      bannerImages.value = images
      bannersLoaded.value = true
      currentBannerIndex.value = Math.floor(Math.random() * images.length)
    }
  } catch (err) {
    console.error('fetchBanners error:', err)
  }
}

const startRotation = () => {
  rotationTimer = setInterval(() => {
    if (bannerImages.value.length > 1) {
      currentBannerIndex.value = (currentBannerIndex.value + 1) % bannerImages.value.length
    }
  }, 60000)
}

onMounted(() => {
  fetchBanners().then(() => {
    startRotation()
  })
})

onUnmounted(() => {
  if (rotationTimer) clearInterval(rotationTimer)
})

const latestNews = computed(() => {
  const news = store.news || []
  return [...news]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
    .map(item => ({
      ...item,
      title: decode(item.title || '')
    }))
})

const latestAnnouncements = computed(() => {
  const announcements = store.announcements || []
  return [...announcements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
    .map(item => ({
      ...item,
      title: decode(item.title || '')
    }))
})

const upcomingSchedule = computed(() => {
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

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>