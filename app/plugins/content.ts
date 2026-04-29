// import { useContentStore } from '~/stores/content'

// export default defineNuxtPlugin(async () => {
//   console.log('🟢 Плагин content запущен')
  
//   const store = useContentStore()
  
//   console.log('🟡 Загружаем новости...')
//   await store.fetchNews()
//   console.log('✅ Новости загружены:', store.news.length)
  
//   console.log('🟡 Загружаем анонсы...')
//   await store.fetchAnnouncements()
//   console.log('✅ Анонсы загружены:', store.announcements.length)
  
//   console.log('🟡 Загружаем расписание...')
//   await store.fetchSchedule()
//   console.log('✅ Расписание загружено:', store.schedule.length)
// })