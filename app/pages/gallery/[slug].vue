<template>
  <div class="w-full">
    <!-- Hero -->
    <section
      class="relative flex justify-center items-center py-20 text-white overflow-hidden bg-gradient-to-br from-primary to-primary/80">
      <div class="relative z-10 mx-auto px-4 lg:px-8 text-center container">
        <h1 class="mb-4 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words">
          {{ gallery.title }}
        </h1>
        <div class="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-white/80 text-sm md:text-base">
          <span>{{ formatDate(gallery.date) }}</span>
          <span v-if="gallery.categories.length" class="flex flex-wrap justify-center gap-1">
            <span v-for="(cat, i) in gallery.categories" :key="cat.id">
              <span v-if="i > 0 || gallery.date" class="mr-1">•</span>{{ cat.name }}
            </span>
          </span>
          <span v-if="gallery.photos.length">• {{ gallery.photos.length }} фото</span>
        </div>
      </div>
    </section>

    <!-- Сетка фотографий -->
    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div v-if="gallery.photos.length === 0" class="py-16 text-center">
        <ImageIcon class="opacity-50 mx-auto mb-4 w-16 h-16 text-muted-foreground" />
        <p class="text-muted-foreground text-lg">В этой галерее пока нет фотографий</p>
        <a v-if="gallery.albumLink" :href="gallery.albumLink" target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-2 mt-4 text-primary hover:underline">
          <ExternalLink class="w-4 h-4" />
          Смотреть фото в альбоме
        </a>
      </div>

      <div v-else class="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div v-for="(photo, index) in gallery.photos" :key="photo.ID || index"
          class="group relative bg-muted aspect-square rounded-lg overflow-hidden cursor-pointer"
          @click="openLightbox(photo.guid)">
          <img :src="photo.guid" :alt="photo.post_title || 'Фото'"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy"
            @error="(e) => { (e.target as HTMLImageElement).src = '/images/question.png' }" />
          <div
            class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <Search class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </div>

      <!-- Ссылка на внешний альбом -->
      <div v-if="gallery.albumLink" class="mt-10 text-center">
        <a :href="gallery.albumLink" target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">
          <ExternalLink class="w-5 h-5" />
          Смотреть все фото в альбоме
        </a>
      </div>

      <div class="mt-12 pt-8 border-border border-t">
        <NuxtLink to="/gallery" class="inline-flex items-center gap-2 text-primary hover:underline transition-colors">
          <ArrowLeft class="w-4 h-4" />
          Вернуться к списку галерей
        </NuxtLink>
      </div>
    </section>

    <!-- Лайтбокс -->
    <Teleport to="body">
      <div v-if="lightboxImage" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        @click="closeLightbox">
        <button class="absolute top-4 right-4 text-white text-3xl hover:opacity-70 transition z-10"
          @click="closeLightbox">
          ✕
        </button>
        <button @click.stop="prevPhoto" :disabled="currentPhotoIndex <= 0"
          class="absolute left-4 text-white text-4xl hover:opacity-70 transition z-10 disabled:opacity-30">
          ‹
        </button>
        <img :src="lightboxImage" class="max-w-full max-h-full object-contain rounded-lg" @click.stop />
        <button @click.stop="nextPhoto" :disabled="currentPhotoIndex >= gallery.photos.length - 1"
          class="absolute right-4 text-white text-4xl hover:opacity-70 transition z-10 disabled:opacity-30">
          ›
        </button>
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
          {{ currentPhotoIndex + 1 }} / {{ gallery.photos.length }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ImageIcon, ExternalLink, Search } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { decode } from 'html-entities'

const route = useRoute()
const gallerySlug = route.params.slug

// ==================== ИСПРАВЛЕНО ====================
const { baseURL } = useApi()

const { data: galleryData, error } = await useFetch(
  `${baseURL}/wp-json/wp/v2/photogallery`,
  {
    params: {
      slug: gallerySlug,
      _embed: true,
      status: 'publish'
    }
  }
)
// ===================================================

if (error.value || !galleryData.value || !Array.isArray(galleryData.value) || galleryData.value.length === 0) {
  throw createError({ statusCode: 404, message: 'Галерея не найдена' })
}

const gallery = computed(() => {
  const item = galleryData.value[0] as any

  let photos: any[] = []
  if (Array.isArray(item.gallery_photos)) {
    photos = item.gallery_photos.map((photo: any) => ({
      ...photo,
      guid: photo.guid ? photo.guid.replace(/\\\\/g, '\\') : '',
    }))
  }

  return {
    id: item.id,
    slug: item.slug || '',
    title: decode(item.title?.rendered || item.albumname || 'Без названия'),
    date: item.date || '',
    albumLink: item.albumlink || '',
    photos,
    categories: item._embedded?.['wp:term']?.[0]?.map((term: any) => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
    })) || [],
  }
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const lightboxImage = ref<string | null>(null)
const currentPhotoIndex = ref(0)

function openLightbox(src: string) {
  lightboxImage.value = src
  currentPhotoIndex.value = gallery.value.photos.findIndex(p => p.guid === src)
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxImage.value = null
  document.body.style.overflow = ''
}

function nextPhoto() {
  const nextIndex = currentPhotoIndex.value + 1
  if (nextIndex < gallery.value.photos.length) {
    currentPhotoIndex.value = nextIndex
    lightboxImage.value = gallery.value.photos[nextIndex].guid
  }
}

function prevPhoto() {
  const prevIndex = currentPhotoIndex.value - 1
  if (prevIndex >= 0) {
    currentPhotoIndex.value = prevIndex
    lightboxImage.value = gallery.value.photos[prevIndex].guid
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && lightboxImage.value) {
    closeLightbox()
  } else if (e.key === 'ArrowRight' && lightboxImage.value) {
    nextPhoto()
  } else if (e.key === 'ArrowLeft' && lightboxImage.value) {
    prevPhoto()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const fullUrl = computed(() => {
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://kirmefhram.ru'
  return `${baseUrl}/gallery/${gallerySlug}`
})

useHead({
  title: `${gallery.value.title} | Фотогалерея`,
  meta: [
    { name: 'description', content: `Фотогалерея: ${gallery.value.title}. ${gallery.value.photos.length} фото.` },
    { property: 'og:title', content: gallery.value.title },
    { property: 'og:description', content: `Фотогалерея: ${gallery.value.title}` },
    ...(gallery.value.photos.length > 0 ? [{ property: 'og:image', content: gallery.value.photos[0].guid }] : []),
    { property: 'og:url', content: fullUrl.value },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})
</script>