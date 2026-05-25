<template>
    <div class="w-full">
        <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
            <div class="mx-auto px-4 lg:px-8 text-center container">
                <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
                    <ImageIcon class="w-10 h-10" />
                </div>
                <h1 class="mb-4 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words">
                    Фотогалерея</h1>
                <p class="opacity-90 mx-auto max-w-2xl text-lg md:text-xl">
                    Фотографии из жизни прихода
                </p>
            </div>
        </section>

        <!-- Фильтр категорий -->
        <section class="top-20 z-40 bg-white py-6 border-border border-b">
            <div class="mx-auto px-4 lg:px-8 container">
                <div class="flex flex-wrap justify-center gap-3">
                    <button v-for="cat in categoriesList" :key="cat.id" @click="selectCategory(cat.id)" :class="[
                        'px-4 py-2 rounded-full text-sm transition-all',
                        activeCategoryId === cat.id
                            ? 'bg-primary text-white'
                            : 'bg-muted text-foreground hover:bg-primary/10',
                    ]">
                        {{ cat.name }}
                    </button>
                </div>
            </div>
        </section>

        <section class="mx-auto px-4 lg:px-8 py-16 container">
            <div v-if="loading" class="py-16 text-center">
                <p class="text-muted-foreground">Загрузка галерей...</p>
            </div>
            <div v-else-if="error" class="py-16 text-center text-destructive">
                <p>Ошибка загрузки галерей. Попробуйте позже.</p>
            </div>
            <div v-else-if="filteredGalleries.length === 0" class="py-16 text-center">
                <p class="text-muted-foreground text-lg">Галерей в этой категории пока нет</p>
            </div>
            <div v-else class="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <NuxtLink v-for="gallery in filteredGalleries" :key="gallery.id" :to="getGalleryUrl(gallery)"
                    class="block">
                    <Card
                        class="group hover:shadow-xl overflow-hidden transition-shadow cursor-pointer h-full flex flex-col">
                        <div class="bg-muted aspect-video overflow-hidden">
                            <img :src="gallery.image || '/images/question.png'" :alt="gallery.title"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                @error="(e) => e.target.src = '/images/question.png'" />
                        </div>
                        <div class="flex flex-col flex-1 p-6">
                            <div class="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                                <Calendar class="w-4 h-4 flex-shrink-0" />
                                <span>{{ formatDate(gallery.date) }}</span>
                            </div>
                            <h3 class="mb-3 font-serif group-hover:text-primary text-xl transition-colors line-clamp-4">
                                {{ gallery.title }}
                            </h3>
                            <div v-if="gallery.categories.length" class="flex flex-wrap gap-1 mb-3">
                                <Badge v-for="cat in gallery.categories" :key="cat.id" variant="secondary"
                                    class="text-xs">
                                    {{ cat.name }}
                                </Badge>
                            </div>
                            <!-- <div class="flex items-center gap-2 mt-auto text-muted-foreground text-sm">
                                <ImageIcon class="w-4 h-4" />
                                <span>{{ gallery.photosCount }} фото</span>
                            </div> -->
                        </div>
                    </Card>
                </NuxtLink>
            </div>

            <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-10">
                <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                    class="px-4 py-2 rounded-lg bg-muted">←</button>

                <template v-for="page in visiblePages" :key="page">
                    <span v-if="page === '...'" class="px-4 py-2">...</span>
                    <button v-else @click="goToPage(page)"
                        :class="['px-4 py-2 rounded-lg transition', page === currentPage ? 'bg-primary text-white' : 'bg-muted hover:bg-primary/10']">
                        {{ page }}
                    </button>
                </template>

                <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                    class="px-4 py-2 rounded-lg bg-muted">→</button>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ImageIcon, Calendar } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Badge from '~/components/ui/Badge.vue'
import { decode } from 'html-entities'

const route = useRoute()
const config = useRuntimeConfig()
const wpBase = config.public.wpApi

const loading = ref(false)
const error = ref(false)
const galleries = ref<any[]>([])
const currentPage = ref(1)
const totalPages = ref(0)
const totalItems = ref(0)
const perPage = 21

// Категории
const allCategoriesList = ref<{ id: number; name: string; slug: string }[]>([])

// Определяем категорию из URL (?category=4)
const categoryFromUrl = route.query.category
const initialCategory = categoryFromUrl && !isNaN(Number(categoryFromUrl)) ? Number(categoryFromUrl) : null

const activeCategoryId = ref<number | null>(initialCategory)

// Загружаем все категории
async function fetchAllCategories() {
    if (allCategoriesList.value.length > 0) return
    try {
        const data = await $fetch(`${wpBase}/wp-json/wp/v2/categories`, {
            params: { per_page: 100, orderby: 'name', order: 'asc' }
        })
        if (Array.isArray(data)) {
            allCategoriesList.value = data.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
            }))
        }
    } catch (err) {
        console.error('Ошибка загрузки категорий:', err)
        allCategoriesList.value = []
    }
}

const categoriesList = computed(() => [
    { id: null, name: 'Все галереи' },
    ...allCategoriesList.value.filter(cat => cat.id !== 1)
])

// Функция для формирования URL с использованием slug, с fallback на id
const getGalleryUrl = (gallery: any): string => {
    if (gallery.slug && gallery.slug.trim() !== '' && gallery.slug !== String(gallery.id)) {
        return `/gallery/${gallery.slug}`
    }
    return `/gallery/${gallery.id}`
}

// Загрузка страницы галерей
async function fetchGalleriesPage(page: number, categoryId?: number | null) {
    loading.value = true
    error.value = false
    try {
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

        const response = await $fetch.raw(`${wpBase}/wp-json/wp/v2/photogallery`, { params })
        const data = response._data
        if (Array.isArray(data)) {
            galleries.value = data.map((item: any) => {
                let coverImage = item.photo?.guid || null
                if (coverImage) {
                    coverImage = coverImage.replace(/\\\\/g, '\\')
                }

                const photosCount = Array.isArray(item.gallery_photos) ? item.gallery_photos.length : 0

                return {
                    id: item.id,
                    slug: item.slug || '',
                    title: decode(item.title?.rendered || item.albumname || 'Без названия'),
                    date: item.date || '',
                    image: coverImage,
                    albumLink: item.albumlink || '',
                    photosCount,
                    categories: item._embedded?.['wp:term']?.[0]?.map((term: any) => ({
                        id: term.id,
                        name: term.name,
                        slug: term.slug,
                    })) || [],
                }
            })
        }
        const tp = response.headers?.get('x-wp-totalpages')
        if (tp) totalPages.value = parseInt(tp)
        const ti = response.headers?.get('x-wp-total')
        if (ti) totalItems.value = parseInt(ti)
        currentPage.value = page
    } catch (err) {
        console.error('Ошибка загрузки галерей:', err)
        error.value = true
    } finally {
        loading.value = false
    }
}

// Загружаем категории и первую страницу
await fetchAllCategories()
await fetchGalleriesPage(1, activeCategoryId.value)

const filteredGalleries = computed(() => galleries.value)

async function selectCategory(catId: number | null) {
    activeCategoryId.value = catId
    await fetchGalleriesPage(1, catId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function goToPage(page: number) {
    await fetchGalleriesPage(page, activeCategoryId.value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const visiblePages = computed(() => {
    const c = currentPage.value
    const t = totalPages.value
    if (t <= 5) return Array.from({ length: t }, (_, i) => i + 1)
    if (c <= 3) return [1, 2, 3, 4, '...', t]
    if (c >= t - 2) return [1, '...', t - 3, t - 2, t - 1, t]
    return [1, '...', c - 1, c, c + 1, '...', t]
})

useHead({
    title: 'Фотогалерея | Кирилло-Мефодиевский храм',
    meta: [{ name: 'description', content: 'Фотографии богослужений, событий и жизни прихода Кирилло-Мефодиевского храма города Балашихи.' }]
})
</script>