import { defineStore } from 'pinia'

interface Announcement {
  id: number
  title: string
  content: string
  excerpt?: string
  date: string
  link: string
  slug: string
  image: string | null
  categories: { id: number; name: string; slug: string }[]
}

interface NewsItem {
  id: number
  title: string
  content: string
  excerpt?: string
  date: string
  link: string
  slug: string
  categories: { id: number; name: string; slug: string }[]
  image: string | null
}

interface PhotoGallery {
  id: number
  title: string
  content: string
  excerpt?: string
  date: string
  link: string
  slug: string
  image: string | null
  categories: { id: number; name: string; slug: string }[]
}

interface ScheduleDay {
  fullDate: string
  date: string
  day: string
  liturgical: string
  services: string
}

// ==================== ФИКС ИЗОБРАЖЕНИЙ ====================
const fixImage = (url: string | null): string | null => {
  if (!url) return url
  return url.replace('admin.kirmefhram.ru', 'kirmefhram.ru')
}

// ==================== МАППЕРЫ ДАННЫХ ====================

const mapNewsItem = (item: any): NewsItem => ({
  id: item.id,
  title: item.title?.rendered || 'Без названия',
  content: item.content?.rendered || '',
  excerpt: item.excerpt?.rendered || '',
  date: item.date || '',
  link: item.link || '',
  slug: item.slug || '',
  categories: item._embedded?.['wp:term']?.[0]?.map((term: any) => ({
    id: term.id,
    name: term.name,
    slug: term.slug,
  })) || [],
  image: fixImage(item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null),
})

const mapAnnouncementItem = (item: any): Announcement => {
  let categories: { id: number; name: string; slug: string }[] = []
  const terms = item._embedded?.['wp:term']
  if (terms && Array.isArray(terms) && terms[0] && Array.isArray(terms[0])) {
    categories = terms[0].map((term: any) => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
    }))
  }
  let image: string | null = null
  const media = item._embedded?.['wp:featuredmedia']
  if (media && Array.isArray(media) && media[0]?.source_url) {
    image = fixImage(media[0].source_url)
  }
  return {
    id: item.id,
    title: item.title?.rendered || 'Без названия',
    content: item.content?.rendered || '',
    excerpt: item.excerpt?.rendered || '',
    date: item.date || '',
    link: item.link || '',
    slug: item.slug || '',
    categories,
    image,
  }
}

const mapPhotogalleryItem = (item: any): PhotoGallery => {
  let categories: { id: number; name: string; slug: string }[] = []
  const terms = item._embedded?.['wp:term']
  if (terms && Array.isArray(terms) && terms[0] && Array.isArray(terms[0])) {
    categories = terms[0].map((term: any) => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
    }))
  }
  let image: string | null = null
  const media = item._embedded?.['wp:featuredmedia']
  if (media && Array.isArray(media) && media[0]?.source_url) {
    image = fixImage(media[0].source_url)
  }
  return {
    id: item.id,
    title: item.title?.rendered || 'Без названия',
    content: item.content?.rendered || '',
    excerpt: item.excerpt?.rendered || '',
    date: item.date || '',
    link: item.link || '',
    slug: item.slug || '',
    categories,
    image,
  }
}

const mapCategoryItem = (cat: any) => ({
  id: cat.id,
  name: cat.name,
  slug: cat.slug,
})

// ==================== STORE ====================

export const useContentStore = defineStore('content', {
  state: () => ({
    announcements: [] as Announcement[],
    news: [] as NewsItem[],
    photogalleries: [] as PhotoGallery[],

    feedNews: [] as NewsItem[],
    feedAnnouncements: [] as Announcement[],
    feedPhotogalleries: [] as PhotoGallery[],

    schedule: [] as ScheduleDay[],

    totalNewsPages: 0,
    currentNewsPage: 1,
    newsPerPage: 20,
    totalNewsItems: 0,

    totalAnnouncementPages: 0,
    currentAnnouncementPage: 1,
    announcementsPerPage: 20,
    totalAnnouncementItems: 0,

    totalPhotogalleryPages: 0,
    currentPhotogalleryPage: 1,
    photogalleriesPerPage: 20,
    totalPhotogalleryItems: 0,

    allNewsCategoriesList: [] as { id: number; name: string; slug: string }[],
    allAnnouncementCategoriesList: [] as { id: number; name: string; slug: string }[],
    allPhotogalleryCategoriesList: [] as { id: number; name: string; slug: string }[],
  }),

  actions: {
    // ==================== КАТЕГОРИИ ====================

    async fetchAllNewsCategories() {
      if (this.allNewsCategoriesList.length > 0) return
      const { apiFetch } = useApi()
      try {
        const data = await apiFetch<any[]>('/categories', {
          params: { per_page: 100, orderby: 'name', order: 'asc' }
        })
        if (Array.isArray(data)) {
          this.allNewsCategoriesList = data.map(mapCategoryItem)
        }
      } catch (err) {
        console.error('Ошибка загрузки всех категорий новостей:', err)
        this.allNewsCategoriesList = []
      }
    },

    async fetchAllAnnouncementCategories() {
      if (this.allAnnouncementCategoriesList.length > 0) return
      const { apiFetch } = useApi()
      try {
        const data = await apiFetch<any[]>('/categories', {
          params: { per_page: 100, orderby: 'name', order: 'asc' }
        })
        if (Array.isArray(data)) {
          this.allAnnouncementCategoriesList = data.map(mapCategoryItem)
        }
      } catch (err) {
        console.error('Ошибка загрузки всех категорий анонсов:', err)
        this.allAnnouncementCategoriesList = []
      }
    },

    async fetchAllPhotogalleryCategories() {
      if (this.allPhotogalleryCategoriesList.length > 0) return
      const { apiFetch } = useApi()
      try {
        const data = await apiFetch<any[]>('/categories', {
          params: { per_page: 100, orderby: 'name', order: 'asc' }
        })
        if (Array.isArray(data)) {
          this.allPhotogalleryCategoriesList = data.map(mapCategoryItem)
        }
      } catch (err) {
        console.error('Ошибка загрузки всех категорий фотогалерей:', err)
        this.allPhotogalleryCategoriesList = []
      }
    },

    // ==================== ЛЕНТА ====================

    async fetchNews() {
      const { apiFetch } = useApi()
      try {
        const data = await apiFetch<any[]>('/new', {
          params: { _embed: true, per_page: 20 }
        })
        if (Array.isArray(data)) {
          this.feedNews = data.map(mapNewsItem)
        }
      } catch (err) {
        console.error('Ошибка загрузки новостей:', err)
        this.feedNews = []
      }
    },

    async fetchAnnouncements() {
      const { apiFetch } = useApi()
      try {
        const data = await apiFetch<any[]>('/announcement', {
          params: { per_page: 20, _embed: true }
        })
        if (Array.isArray(data)) {
          this.feedAnnouncements = data.map(mapAnnouncementItem)
        }
      } catch (err) {
        console.error('Ошибка загрузки анонсов:', err)
        this.feedAnnouncements = []
      }
    },

    async fetchPhotogalleries() {
      const { apiFetch } = useApi()
      try {
        const data = await apiFetch<any[]>('/photogallery', {
          params: { _embed: true, per_page: 20 }
        })
        if (Array.isArray(data)) {
          this.feedPhotogalleries = data.map(mapPhotogalleryItem)
        }
      } catch (err) {
        console.error('Ошибка загрузки фотогалерей:', err)
        this.feedPhotogalleries = []
      }
    },

    // ==================== ПАГИНАЦИЯ ====================

    async fetchNewsPage(page: number, perPage: number = 20, categoryId?: number) {
      const { baseURL } = useApi()
      const params: any = {
        _embed: true,
        per_page: perPage,
        page: page,
        orderby: 'date',
        order: 'desc'
      }
      if (categoryId) {
        params.categories = categoryId
      }
      try {
        const response = await $fetch.raw(`${baseURL}/wp-json/wp/v2/new`, { params })
        const data = response._data
        if (Array.isArray(data)) {
          this.news = data.map(mapNewsItem)
        }
        const totalPages = response.headers?.get('x-wp-totalpages')
        if (totalPages) this.totalNewsPages = parseInt(totalPages)
        const totalItems = response.headers?.get('x-wp-total')
        if (totalItems) this.totalNewsItems = parseInt(totalItems)
        this.currentNewsPage = page
      } catch (err) {
        console.error('Ошибка загрузки страницы новостей:', err)
        this.news = []
      }
    },

    async fetchAnnouncementsPage(page: number, perPage: number = 20, categoryId?: number) {
      const { baseURL } = useApi()
      const params: any = {
        _embed: true,
        per_page: perPage,
        page: page,
        orderby: 'date',
        order: 'desc'
      }
      if (categoryId) {
        params.categories = categoryId
      }
      try {
        const response = await $fetch.raw(`${baseURL}/wp-json/wp/v2/announcement`, { params })
        const data = response._data
        if (Array.isArray(data)) {
          this.announcements = data.map(mapAnnouncementItem)
        }
        const totalPages = response.headers?.get('x-wp-totalpages')
        if (totalPages) this.totalAnnouncementPages = parseInt(totalPages)
        const totalItems = response.headers?.get('x-wp-total')
        if (totalItems) this.totalAnnouncementItems = parseInt(totalItems)
        this.currentAnnouncementPage = page
      } catch (err) {
        console.error('Ошибка загрузки страницы анонсов:', err)
        this.announcements = []
      }
    },

    async fetchPhotogalleriesPage(page: number, perPage: number = 20, categoryId?: number) {
      const { baseURL } = useApi()
      const params: any = {
        _embed: true,
        per_page: perPage,
        page: page,
        orderby: 'date',
        order: 'desc'
      }
      if (categoryId) {
        params.categories = categoryId
      }
      try {
        const response = await $fetch.raw(`${baseURL}/wp-json/wp/v2/photogallery`, { params })
        const data = response._data
        if (Array.isArray(data)) {
          this.photogalleries = data.map(mapPhotogalleryItem)
        }
        const totalPages = response.headers?.get('x-wp-totalpages')
        if (totalPages) this.totalPhotogalleryPages = parseInt(totalPages)
        const totalItems = response.headers?.get('x-wp-total')
        if (totalItems) this.totalPhotogalleryItems = parseInt(totalItems)
        this.currentPhotogalleryPage = page
      } catch (err) {
        console.error('Ошибка загрузки страницы фотогалерей:', err)
        this.photogalleries = []
      }
    },

    // ==================== РАСПИСАНИЕ ====================

    async fetchSchedule() {
      const { apiFetch } = useApi()
      try {
        const schedulePosts = await apiFetch<any[]>('/schedule', {
          params: { per_page: 100 }
        })

        if (!Array.isArray(schedulePosts) || schedulePosts.length === 0) {
          this.schedule = []
          return
        }

        const dayMap = new Map<string, ScheduleDay>()

        for (const post of schedulePosts) {
          const monthCurrent = post.month_current
          if (!monthCurrent || typeof monthCurrent !== 'string') continue
          const currentDate = new Date(monthCurrent)
          if (isNaN(currentDate.getTime())) continue
          const currentYear = currentDate.getFullYear()
          const currentMonth = currentDate.getMonth()
          const lastDayCurrent = new Date(currentYear, currentMonth + 1, 0).getDate()

          let nextYear = currentYear
          let nextMonth = currentMonth + 1
          let lastDayNext = 31
          let hasNextMonth = false
          if (post.month_next1 && typeof post.month_next1 === 'string') {
            const nextDate = new Date(post.month_next1)
            if (!isNaN(nextDate.getTime())) {
              nextYear = nextDate.getFullYear()
              nextMonth = nextDate.getMonth()
              lastDayNext = new Date(nextYear, nextMonth + 1, 0).getDate()
              hasNextMonth = true
            }
          }

          const addOrUpdateDay = (
            year: number,
            month: number,
            dayNum: number,
            liturgicalText?: string,
            servicesText?: string
          ) => {
            if (dayNum < 1) return
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            const dateObj = new Date(fullDate)
            const dayName = dateObj.toLocaleDateString('ru-RU', { weekday: 'long' })
            const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1)

            let existing = dayMap.get(fullDate)
            if (!existing) {
              existing = {
                fullDate,
                date: String(dayNum),
                day: capitalizedDay,
                liturgical: '',
                services: '',
              }
              dayMap.set(fullDate, existing)
            }
            if (liturgicalText !== undefined && liturgicalText.trim()) {
              existing.liturgical = liturgicalText
            }
            if (servicesText !== undefined && servicesText.trim()) {
              existing.services = servicesText
            }
          }

          for (const [key, value] of Object.entries(post)) {
            if (!key.startsWith('liturgical_day')) continue
            if (key.includes('_next_month')) continue
            if (!value || value === false || value === '') continue

            const match = key.match(/liturgical_day(\d+)$/)
            if (!match) continue
            const dayNum = parseInt(match[1], 10)
            if (isNaN(dayNum) || dayNum < 1 || dayNum > lastDayCurrent) continue

            addOrUpdateDay(currentYear, currentMonth, dayNum, String(value), undefined)
          }

          for (const [key, value] of Object.entries(post)) {
            if (!key.startsWith('daily_schedule')) continue
            if (key.includes('_next_month')) continue
            if (!value || value === false || value === '') continue

            const match = key.match(/daily_schedule(\d+)$/)
            if (!match) continue
            const dayNum = parseInt(match[1], 10)
            if (isNaN(dayNum) || dayNum < 1 || dayNum > lastDayCurrent) continue

            addOrUpdateDay(currentYear, currentMonth, dayNum, undefined, String(value))
          }

          if (hasNextMonth) {
            for (const [key, value] of Object.entries(post)) {
              if (!key.startsWith('liturgical_day_next_month')) continue
              if (!value || value === false || value === '') continue

              const match = key.match(/liturgical_day_next_month(\d+)$/)
              if (!match) continue
              const dayNum = parseInt(match[1], 10)
              if (isNaN(dayNum) || dayNum < 1 || dayNum > lastDayNext) continue

              addOrUpdateDay(nextYear, nextMonth, dayNum, String(value), undefined)
            }

            for (const [key, value] of Object.entries(post)) {
              if (!key.startsWith('daily_schedule_next_month')) continue
              if (!value || value === false || value === '') continue

              const match = key.match(/daily_schedule_next_month(\d+)$/)
              if (!match) continue
              const dayNum = parseInt(match[1], 10)
              if (isNaN(dayNum) || dayNum < 1 || dayNum > lastDayNext) continue

              addOrUpdateDay(nextYear, nextMonth, dayNum, undefined, String(value))
            }
          }
        }

        this.schedule = Array.from(dayMap.values())
          .filter(day => day.liturgical || day.services)
          .sort((a, b) => a.fullDate.localeCompare(b.fullDate))

      } catch (err) {
        console.error('Ошибка загрузки расписания:', err)
        this.schedule = []
      }
    },
  },

  getters: {
    sortedNews(): NewsItem[] {
      return [...this.news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },

    latestNews(): NewsItem[] {
      return [...this.feedNews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4)
    },

    allNewsCategories(): { id: string | number; name: string }[] {
      const cats = new Map()
      this.news.forEach(article => {
        article.categories.forEach(cat => {
          if (!cats.has(cat.id)) cats.set(cat.id, { id: cat.id, name: cat.name })
        })
      })
      return [{ id: 'all', name: 'Все новости' }, ...Array.from(cats.values())]
    },

    sortedAnnouncements(): Announcement[] {
      return [...this.announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },

    latestAnnouncements(): Announcement[] {
      return [...this.feedAnnouncements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4)
    },

    allAnnouncementCategories(): { id: string | number; name: string }[] {
      const cats = new Map()
      this.announcements.forEach(article => {
        article.categories.forEach(cat => {
          if (!cats.has(cat.id)) cats.set(cat.id, { id: cat.id, name: cat.name })
        })
      })
      return [{ id: 'all', name: 'Все анонсы' }, ...Array.from(cats.values())]
    },

    sortedPhotogalleries(): PhotoGallery[] {
      return [...this.photogalleries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },

    latestPhotogalleries(): PhotoGallery[] {
      return [...this.feedPhotogalleries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4)
    },

    allPhotogalleryCategories(): { id: string | number; name: string }[] {
      const cats = new Map()
      this.photogalleries.forEach(gallery => {
        gallery.categories.forEach(cat => {
          if (!cats.has(cat.id)) cats.set(cat.id, { id: cat.id, name: cat.name })
        })
      })
      return [{ id: 'all', name: 'Все галереи' }, ...Array.from(cats.values())]
    },

    sortedSchedule(): ScheduleDay[] {
      return [...this.schedule].sort((a, b) => a.fullDate.localeCompare(b.fullDate))
    },

    todaySchedule(): ScheduleDay | null {
      const todayStr = new Date().toISOString().slice(0, 10)
      return this.schedule.find(item => item.fullDate === todayStr) || null
    },

    tomorrowSchedule(): ScheduleDay | null {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().slice(0, 10)
      return this.schedule.find(item => item.fullDate === tomorrowStr) || null
    },

    filledScheduleForTodayAndNextTwo(): ScheduleDay[] {
      const todayStr = new Date().toISOString().slice(0, 10)
      const sorted = this.sortedSchedule
      let startIndex = sorted.findIndex(item => item.fullDate === todayStr)
      if (startIndex === -1) {
        startIndex = sorted.findIndex(item => item.fullDate >= todayStr)
        if (startIndex === -1) startIndex = 0
      }
      const filled: ScheduleDay[] = []
      for (let i = startIndex; i < sorted.length && filled.length < 3; i++) {
        const day = sorted[i]
        if ((day.liturgical && day.liturgical.trim() !== '') ||
          (day.services && day.services.trim() !== '')) {
          filled.push(day)
        }
      }
      return filled
    },

    upcomingSchedule(): (daysCount: number) => ScheduleDay[] {
      return (daysCount: number = 7) => {
        const today = new Date()
        const todayStr = today.toISOString().slice(0, 10)
        const future = new Date(today)
        future.setDate(today.getDate() + daysCount)
        const futureStr = future.toISOString().slice(0, 10)
        return this.schedule.filter(item => item.fullDate >= todayStr && item.fullDate <= futureStr)
      }
    },
  },
})