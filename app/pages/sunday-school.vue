<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <GraduationCap class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words">
          Воскресная школа
        </h1>
        <p class="opacity-90 mx-auto max-w-2xl text-lg md:text-xl">
          Духовное образование для детей и взрослых
        </p>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div class="mx-auto max-w-4xl">
        <div class="mb-16 max-w-none prose prose-lg">
          <div v-html="sundaySchoolText" class="text-muted-foreground text-lg leading-relaxed"></div>
        </div>

        <div class="bg-muted/50 p-8 rounded-lg">
          <div class="flex items-start gap-4 mb-6">
            <div class="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-full w-12 h-12">
              <Users class="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 class="mb-2 font-serif text-primary text-2xl">Запись в воскресную школу</h3>
              <div v-html="enrollmentText" class="text-muted-foreground text-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Последние новости воскресной школы -->
    <section class="bg-white py-16">
      <div class="mx-auto px-4 lg:px-8 container">
        <h2 class="mb-8 font-serif text-primary text-4xl text-center">Новости воскресной школы</h2>

        <div v-if="latestSundaySchoolNews.length === 0" class="py-16 text-center">
          <p class="text-muted-foreground">Новостей пока нет</p>
        </div>

        <div v-else class="gap-8 grid grid-cols-1 md:grid-cols-2 mx-auto mb-8 max-w-5xl">
          <Card v-for="item in latestSundaySchoolNews" :key="item.id"
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
              <NuxtLink :to="getNewsUrl(item)"
                class="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline">
                Читать полностью
                <ArrowRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </Card>
        </div>

        <div class="text-center">
          <NuxtLink :to="`/news?category=${SUNDAY_SCHOOL_CATEGORY_ID}`"
            class="inline-flex items-center gap-2 text-primary hover:underline">
            Все новости
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Последние анонсы воскресной школы -->
    <section class="bg-white py-16">
      <div class="mx-auto px-4 lg:px-8 container">
        <h2 class="mb-8 font-serif text-primary text-4xl text-center">Анонсы воскресной школы</h2>

        <div v-if="latestSundaySchoolAnnouncements.length === 0" class="py-16 text-center">
          <p class="text-muted-foreground">Анонсов пока нет</p>
        </div>

        <div v-else class="gap-8 grid grid-cols-1 md:grid-cols-2 mx-auto mb-8 max-w-5xl">
          <Card v-for="item in latestSundaySchoolAnnouncements" :key="item.id"
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
              <NuxtLink :to="getAnnouncementUrl(item)"
                class="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline">
                Читать полностью
                <ArrowRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </Card>
        </div>

        <div class="text-center">
          <NuxtLink :to="`/announcements?category=${SUNDAY_SCHOOL_CATEGORY_ID}`"
            class="inline-flex items-center gap-2 text-primary hover:underline">
            Все анонсы
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Последние фотогалереи воскресной школы -->
    <section class="bg-white py-16">
      <div class="mx-auto px-4 lg:px-8 container">
        <h2 class="mb-8 font-serif text-primary text-4xl text-center">Фотогалереи воскресной школы</h2>

        <div v-if="latestSundaySchoolGalleries.length === 0" class="py-16 text-center">
          <p class="text-muted-foreground">Галерей пока нет</p>
        </div>

        <div v-else class="gap-8 grid grid-cols-1 md:grid-cols-2 mx-auto mb-8 max-w-5xl">
          <NuxtLink v-for="item in latestSundaySchoolGalleries" :key="item.id" :to="getGalleryUrl(item)" class="block">
            <Card class="group hover:shadow-xl overflow-hidden transition-shadow cursor-pointer h-full flex flex-col">
              <div class="bg-muted aspect-video overflow-hidden">
                <img :src="item.image || '/images/question.png'" :alt="item.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  @error="(e) => e.target.src = '/images/question.png'" />
              </div>
              <div class="flex flex-col flex-1 p-6">
                <div class="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                  <Calendar class="w-4 h-4 flex-shrink-0" />
                  <span>{{ formatDate(item.date) }}</span>
                </div>
                <h3 class="mb-3 font-serif group-hover:text-primary text-xl transition-colors line-clamp-2">
                  {{ item.title }}
                </h3>
              </div>
            </Card>
          </NuxtLink>
        </div>

        <div class="text-center">
          <NuxtLink :to="`/gallery?category=${SUNDAY_SCHOOL_CATEGORY_ID}`"
            class="inline-flex items-center gap-2 text-primary hover:underline">
            Все галереи
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GraduationCap, Users, Calendar, ArrowRight } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import { decode } from 'html-entities'

const SUNDAY_SCHOOL_CATEGORY_ID = 10

const formatText = (text: string): string => {
  if (!text) return ''
  return text.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;')
}

const { apiFetch } = useApi()

// Загружаем описание воскресной школы
const sundaySchoolData = ref<any>(null)
try {
  const data = await apiFetch<any[]>('/sundayschool')
  if (Array.isArray(data) && data.length > 0) {
    sundaySchoolData.value = data[0]
  }
} catch (err) {
  console.error('fetchSundaySchool error:', err)
}

const sundaySchoolText = computed(() => formatText(sundaySchoolData.value?.description || ''))
const enrollmentText = computed(() => formatText(sundaySchoolData.value?.entry || ''))

// Загружаем новости
const sundayNews = ref<any[]>([])
try {
  sundayNews.value = await apiFetch<any[]>('/new', {
    params: { _embed: true, per_page: 4, categories: SUNDAY_SCHOOL_CATEGORY_ID, orderby: 'date', order: 'desc' }
  })
} catch (err) {
  console.error('fetchSundayNews error:', err)
}

// Загружаем анонсы
const sundayAnnouncements = ref<any[]>([])
try {
  sundayAnnouncements.value = await apiFetch<any[]>('/announcement', {
    params: { _embed: true, per_page: 4, categories: SUNDAY_SCHOOL_CATEGORY_ID, orderby: 'date', order: 'desc' }
  })
} catch (err) {
  console.error('fetchSundayAnnouncements error:', err)
}

// Загружаем галереи
const sundayGalleries = ref<any[]>([])
try {
  sundayGalleries.value = await apiFetch<any[]>('/photogallery', {
    params: { per_page: 4, categories: SUNDAY_SCHOOL_CATEGORY_ID, orderby: 'date', order: 'desc' }
  })
} catch (err) {
  console.error('fetchSundayGalleries error:', err)
}

const getNewsUrl = (item: any): string => {
  if (item.slug && item.slug.trim() !== '') return `/news/${item.slug}`
  return `/news/${item.id}`
}

const getAnnouncementUrl = (item: any): string => {
  if (item.slug && item.slug.trim() !== '') return `/announcements/${item.slug}`
  return `/announcements/${item.id}`
}

const getGalleryUrl = (item: any): string => {
  if (item.slug && item.slug.trim() !== '' && item.slug !== String(item.id)) return `/gallery/${item.slug}`
  return `/gallery/${item.id}`
}

const latestSundaySchoolNews = computed(() => {
  return (sundayNews.value || []).map((item: any) => ({
    id: item.id,
    slug: item.slug || '',
    title: decode(item.title?.rendered || 'Без названия'),
    content: item.content?.rendered || '',
    excerpt: item.excerpt?.rendered || '',
    date: item.date || '',
    image: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    categories: item._embedded?.['wp:term']?.[0]?.map((term: any) => ({
      id: term.id, name: term.name, slug: term.slug,
    })) || [],
  }))
})

const latestSundaySchoolAnnouncements = computed(() => {
  return (sundayAnnouncements.value || []).map((item: any) => ({
    id: item.id,
    slug: item.slug || '',
    title: decode(item.title?.rendered || 'Без названия'),
    content: item.content?.rendered || '',
    date: item.date || '',
    image: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    categories: item._embedded?.['wp:term']?.[0]?.map((term: any) => ({
      id: term.id, name: term.name, slug: term.slug,
    })) || [],
  }))
})

const latestSundaySchoolGalleries = computed(() => {
  return (sundayGalleries.value || []).map((item: any) => {
    let coverImage = item.photo?.guid || null
    if (coverImage) coverImage = coverImage.replace(/\\\\/g, '\\')
    return {
      id: item.id,
      slug: item.slug || '',
      title: decode(item.title?.rendered || item.albumname || 'Без названия'),
      date: item.date || '',
      image: coverImage,
      photosCount: Array.isArray(item.gallery_photos) ? item.gallery_photos.length : 0,
    }
  })
})

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}
</script>