<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 max-w-7xl text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <ImageIcon class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-5xl md:text-6xl">Фотогалерея</h1>
        <p class="opacity-90 mx-auto max-w-2xl text-xl">
          Фотографии из жизни прихода
        </p>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 max-w-7xl container">
      <div v-if="pending" class="py-20 text-center">
        <div class="inline-block mx-auto mb-4 border-primary border-b-2 rounded-full w-12 h-12 animate-spin"></div>
        <p class="text-muted-foreground text-lg">Загрузка альбомов...</p>
      </div>

      <div v-else-if="error" class="py-20 text-center">
        <div class="mb-6 text-destructive">
          <p class="mb-2 text-2xl">❌</p>
          <p class="text-lg">{{ error.message || 'Не удалось загрузить альбомы' }}</p>
        </div>
        <button @click="refresh()"
          class="bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-medium text-primary-foreground transition-colors">
          Попробовать снова
        </button>
      </div>

      <div v-else-if="albums.length === 0" class="py-20 text-center">
        <ImageIcon class="opacity-50 mx-auto mb-6 w-24 h-24 text-muted-foreground" />
        <p class="mb-4 text-muted-foreground text-xl">Альбомы не найдены</p>
        <button @click="refresh()"
          class="hover:bg-muted px-6 py-3 border border-muted-foreground rounded-xl text-muted-foreground transition-colors">
          Обновить
        </button>
      </div>

      <!-- Сетка альбомов -->
      <div v-else class="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card v-for="album in albums" :key="album.id"
          class="group bg-card hover:shadow-2xl border-0 h-full overflow-hidden transition-all hover:-translate-y-1 duration-300 cursor-pointer"
          @click="openAlbum(album)">
          <div class="bg-muted aspect-square overflow-hidden">
            <img :src="album.coverImage" :alt="album.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              @error="handleImageError" loading="lazy" />
          </div>
          <div class="flex flex-col p-6 h-[130px]">
            <h3
              class="mb-2 font-serif font-semibold group-hover:text-primary text-xl line-clamp-2 leading-tight transition-colors">
              {{ album.title }}
            </h3>
          </div>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ImageIcon } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import { useRuntimeConfig } from '#app'

interface Album {
  id: number
  title: string
  slug: string
  coverImage: string
  albumLink: string
  date: string
}

const config = useRuntimeConfig()
const wpBase = config.public.wpApi
const apiUrl = `${wpBase}/wp-json/wp/v2/photogallery`

const { data, pending, error, refresh } = await useFetch<Array<any>>(apiUrl, {
  key: 'photogallery',
  server: true,
  lazy: false,
})

const albums = computed<Album[]>(() => {
  if (!data.value || !Array.isArray(data.value)) return []

  return data.value.map((item: any) => {
    let title = item.albumname || 'Без названия'
    title = decodeURIComponent(title)
      .replace(/\\u[\\dA-Fa-f]{4}/gi, (match) =>
        String.fromCharCode(parseInt(match.replace(/\\u/gi, ''), 16))
      )

    let coverImage = item.photo?.guid || '/placeholder.jpg'
    coverImage = decodeURIComponent(coverImage.replace(/\\\\/g, '\\'))

    let albumLink = item.albumlink || '#'
    albumLink = albumLink.replace(/\\\//g, '/')
    albumLink = decodeURIComponent(albumLink)

    return {
      id: item.id,
      title,
      slug: item.slug,
      coverImage,
      albumLink,
      date: item.date,
    }
  })
})

const openAlbum = (album: Album) => {
  if (album.albumLink && album.albumLink !== '#') {
    window.open(album.albumLink, '_blank', 'noopener,noreferrer')
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
}

useHead({
  title: 'Фотогалерея | Кирилло-Мефодиевский храм',
  meta: [
    { name: 'description', content: 'Фотографии богослужений, событий и жизни прихода Кирилло-Мефодиевского храма города Балашихи.' },
    { property: 'og:title', content: 'Фотогалерея | Кирилло-Мефодиевский храм' },
    { property: 'og:description', content: 'Фотографии богослужений, событий и жизни прихода.' },
    { property: 'og:type', content: 'website' },
  ],
})
</script>

<style scoped></style>