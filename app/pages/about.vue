<template>
  <div class="w-full">
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <Church class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-5xl md:text-6xl">{{ pageTitle }}</h1>
        <p class="opacity-90 mx-auto max-w-2xl text-xl">
          История Кирилло-Мефодиевского храма
        </p>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div v-if="pending" class="py-16 text-center">
        <p class="text-muted-foreground">Загрузка...</p>
      </div>
      <div v-else-if="error" class="py-16 text-center text-destructive">
        <p>Ошибка загрузки данных. Попробуйте позже.</p>
      </div>
      <div v-else class="mx-auto max-w-4xl">
        <div class="historical-content" v-html="historicalContent"></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Church } from 'lucide-vue-next'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
const wpBase = config.public.wpApi

// Загружаем данные из кастомного типа записи 'about' (первый пост)
const { data, pending, error } = await useFetch<Array<any>>(`${wpBase}/wp-json/wp/v2/about`, {
  key: 'about-history',
  server: true,
  params: { per_page: 1 }
})

const aboutItem = computed(() => data.value?.[0] || null)

// Заголовок страницы (берём из title.rendered)
const pageTitle = computed(() => aboutItem.value?.title?.rendered || 'О храме')

// Контент – поле historical_background (содержит готовый HTML)
const historicalContent = computed(() => aboutItem.value?.historical_background || '<p>Нет данных</p>')

// SEO
useHead({
  title: `${pageTitle.value} | Кирилло-Мефодиевский храм`,
  meta: [
    { name: 'description', content: 'История создания и строительства Кирилло-Мефодиевского храма города Балашихи.' }
  ]
})
</script>

<style scoped>
/* Стили для сохранения форматирования из WordPress */
.historical-content {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #1a202c;
}

.historical-content :deep(p) {
  margin-bottom: 1.5rem;
}

.historical-content :deep(.first-letter\\:float-left:first-letter) {
  float: left;
  margin-right: 0.75rem;
  font-family: serif;
  font-size: 3.75rem;
  line-height: 1;
  color: #2c5f2d;
}

.historical-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}
</style>