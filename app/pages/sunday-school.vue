<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <GraduationCap class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-5xl md:text-6xl">Воскресная школа</h1>
        <p class="opacity-90 mx-auto max-w-2xl text-xl">
          Духовное образование для детей и взрослых
        </p>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div class="mx-auto max-w-4xl">
        <div class="mb-16 max-w-none prose prose-lg">
          <p v-if="loading" class="text-muted-foreground text-lg leading-relaxed">
            Загрузка информации...
          </p>
          <div v-else v-html="sundaySchoolText" class="text-muted-foreground text-lg leading-relaxed"></div>
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
              <h3 class="mb-2 font-serif text-primary text-2xl">Запись в воскресную школу</h3>
              <div v-html="enrollmentText" class="text-muted-foreground text-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white py-16">
      <div class="mx-auto px-4 lg:px-8 container">
        <h2 class="mb-8 font-serif text-primary text-4xl text-center">Новости воскресной школы</h2>

        <div v-if="loadingNews" class="py-16 text-center">
          <p class="text-muted-foreground">Загрузка...</p>
        </div>

        <div v-else-if="sundaySchoolItems.length === 0" class="py-16 text-center">
          <p class="text-muted-foreground">Новостей и анонсов пока нет</p>
        </div>

        <div v-else class="gap-8 grid grid-cols-1 md:grid-cols-2 mx-auto mb-8 max-w-5xl">
          <Card v-for="item in sundaySchoolItems" :key="`${item.type}-${item.id}`"
            class="group hover:shadow-xl overflow-hidden transition-shadow">
            <div class="bg-muted aspect-video overflow-hidden">
              <img :src="item.image || '/images/question.png'" :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="(e) => e.target.src = '/images/question.png'" />
            </div>
            <div class="p-6">
              <div class="flex justify-between items-center mb-3">
                <div class="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar class="w-4 h-4" />
                  <span>{{ formatDate(item.date) }}</span>
                </div>
                <Badge :variant="item.type === 'announcement' ? 'secondary' : 'default'">
                  {{ item.type === 'announcement' ? 'Анонс' : 'Новость' }}
                </Badge>
              </div>
              <h3 class="mb-3 font-serif group-hover:text-primary text-xl line-clamp-2 transition-colors">
                {{ item.title }}
              </h3>
              <p class="mb-4 text-muted-foreground line-clamp-3">
                {{ stripHtml(item.excerpt || item.content) }}
              </p>
              <NuxtLink :to="item.type === 'news' ? `/news/${item.id}` : `/announcements/${item.id}`"
                class="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline">
                Читать полностью
                <ArrowRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </Card>
        </div>

        <div class="text-center">
          <NuxtLink to="/news" class="inline-flex items-center gap-2 text-primary hover:underline">
            Все новости
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GraduationCap, Clock, Users, Calendar, ArrowRight, BookOpen } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Badge from '~/components/ui/Badge.vue'
import { useContentStore } from '~/stores/content'

const store = useContentStore()
const loading = ref(true)
const loadingNews = ref(false)

const sundaySchoolText = ref<string>('')
const enrollmentText = ref<string>('')

const formatText = (text: string): string => {
  if (!text) return ''
  return text
    .replace(/\r\n/g, '<br>')
    .replace(/\n/g, '<br>')
    .replace(/\t/g, '&nbsp;&nbsp;')
}

const fetchSundaySchool = async () => {
  try {
    const res = await fetch('http://localhost/church/wp-json/wp/v2/sundayschool')
    const data = await res.json()

    if (Array.isArray(data) && data.length > 0) {
      const item = data[0]

      if (item.description) {
        sundaySchoolText.value = formatText(item.description)
      }

      if (item.entry) {
        enrollmentText.value = formatText(item.entry)
      }
    }
  } catch (err) {
    console.error('fetchSundaySchool error:', err)
    sundaySchoolText.value = ''
    enrollmentText.value = ''
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchSundaySchool()

  if (store.news.length === 0 || store.announcements.length === 0) {
    loadingNews.value = true
    await Promise.all([
      store.news.length === 0 ? store.fetchNews() : Promise.resolve(),
      store.announcements.length === 0 ? store.fetchAnnouncements() : Promise.resolve(),
    ])
    loadingNews.value = false
  }
})

const sundaySchoolNews = computed(() => {
  return store.news.filter(item =>
    item.categories.some(cat =>
      cat.name.toLowerCase().includes('воскресная школа') ||
      cat.slug.includes('vokresnaya-shkola')
    )
  )
})

const sundaySchoolAnnouncements = computed(() => {
  return store.announcements.filter(item =>
    item.categories.some(cat =>
      cat.name.toLowerCase().includes('воскресная школа') ||
      cat.slug.includes('vokresnaya-shkola')
    )
  )
})

const sundaySchoolItems = computed(() => {
  const news = sundaySchoolNews.value.map(item => ({ ...item, type: 'news' }))
  const announcements = sundaySchoolAnnouncements.value.map(item => ({ ...item, type: 'announcement' }))

  return [...news, ...announcements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
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