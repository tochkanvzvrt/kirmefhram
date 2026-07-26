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
        <div v-html="historicalContent" class="wp-content"></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Church } from 'lucide-vue-next'

const config = useRuntimeConfig()
const wpBase = config.public.wpApi

const { data, pending, error } = useFetch<Array<any>>(`${wpBase}/wp-json/wp/v2/about`, {
  key: 'about-history',
  server: true,
  params: { per_page: 1 }
})

const aboutItem = computed(() => data.value?.[0] || null)

const pageTitle = computed(() => aboutItem.value?.title?.rendered || 'О храме')

const historicalContent = computed(() => aboutItem.value?.content?.rendered || '<p>Нет данных</p>')

useHead({
  title: `${pageTitle.value} | Кирилло-Мефодиевский храм`,
  meta: [
    { name: 'description', content: 'История создания и строительства Кирилло-Мефодиевского храма города Балашихи.' }
  ]
})
</script>

<style scoped>
/* ======= Базовые стили контента (как в новостях) ======= */
.wp-content {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #1a202c;
}

.wp-content :deep(p) {
  margin-bottom: 1.5em;
}

.wp-content :deep(h1),
.wp-content :deep(h2),
.wp-content :deep(h3),
.wp-content :deep(h4),
.wp-content :deep(h5),
.wp-content :deep(h6) {
  font-family: 'SPSL New Cyrillic', 'PT Serif', serif;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

.wp-content :deep(h1) {
  font-size: 2rem;
}

.wp-content :deep(h2) {
  font-size: 1.75rem;
}

.wp-content :deep(h3) {
  font-size: 1.5rem;
}

.wp-content :deep(h4) {
  font-size: 1.25rem;
}

.wp-content :deep(h5) {
  font-size: 1rem;
}

.wp-content :deep(h6) {
  font-size: 0.875rem;
}

.wp-content :deep(strong),
.wp-content :deep(b) {
  font-weight: 700;
}

.wp-content :deep(em),
.wp-content :deep(i) {
  font-style: italic;
}

.wp-content :deep(ul),
.wp-content :deep(ol) {
  margin: 0 0 1.5em 1.5em;
  padding-left: 0;
}

.wp-content :deep(li) {
  margin-bottom: 0.5em;
}

.wp-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

.wp-content :deep(.aligncenter) {
  text-align: center;
  display: block;
  clear: both;
  margin-left: auto;
  margin-right: auto;
}

.wp-content :deep(.aligncenter img) {
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.wp-content :deep(.alignleft) {
  float: left;
  margin: 0 1.5em 1em 0;
}

.wp-content :deep(.alignright) {
  float: right;
  margin: 0 0 1em 1.5em;
}

.wp-content :deep(.alignnone) {
  margin: 1.5em 0;
}

.wp-content :deep(figure.aligncenter) {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5em auto;
}

.wp-content :deep(figure.alignleft) {
  float: left;
  margin: 0 1.5em 1em 0;
}

.wp-content :deep(figure.alignright) {
  float: right;
  margin: 0 0 1em 1.5em;
}

.wp-content :deep(figcaption) {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.5em;
  text-align: center;
}

.wp-content :deep(.clearfix)::after,
.wp-content :deep(.wp-caption)::after {
  content: "";
  clear: both;
  display: table;
}

.wp-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
}

.wp-content :deep(th),
.wp-content :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 0.75em;
  text-align: left;
}

.wp-content :deep(th) {
  background: #f7fafc;
  font-weight: 600;
}

.wp-content :deep(a) {
  color: rgb(138, 45, 30);
  text-decoration: underline;
  transition: color 0.2s;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.wp-content :deep(a:hover) {
  color: rgb(162, 85, 73);
}

.wp-content :deep(a:visited) {
  color: #7c3aed;
}

.wp-content :deep(.has-text-align-center) {
  text-align: center;
}

.wp-content :deep(.has-text-align-right) {
  text-align: right;
}

.wp-content :deep(.has-text-align-left) {
  text-align: left;
}

.wp-content :deep(.has-text-align-justify) {
  text-align: justify;
}

.wp-content :deep(h1.has-text-align-left),
.wp-content :deep(h2.has-text-align-left),
.wp-content :deep(h3.has-text-align-left),
.wp-content :deep(h4.has-text-align-left),
.wp-content :deep(h5.has-text-align-left),
.wp-content :deep(h6.has-text-align-left) {
  text-align: left;
}

.wp-content :deep(h1.has-text-align-center),
.wp-content :deep(h2.has-text-align-center),
.wp-content :deep(h3.has-text-align-center),
.wp-content :deep(h4.has-text-align-center),
.wp-content :deep(h5.has-text-align-center),
.wp-content :deep(h6.has-text-align-center) {
  text-align: center;
}

.wp-content :deep(h1.has-text-align-right),
.wp-content :deep(h2.has-text-align-right),
.wp-content :deep(h3.has-text-align-right),
.wp-content :deep(h4.has-text-align-right),
.wp-content :deep(h5.has-text-align-right),
.wp-content :deep(h6.has-text-align-right) {
  text-align: right;
}

.wp-content :deep(.has-primary-color) {
  color: var(--wp--preset--color--primary, #1a3a5c);
}

.wp-content :deep(.has-secondary-color) {
  color: var(--wp--preset--color--secondary, #6b7280);
}

.wp-content :deep(.has-text-color) {
  color: inherit;
}

.wp-content :deep(.has-small-font-size) {
  font-size: 0.875rem;
}

.wp-content :deep(.has-medium-font-size) {
  font-size: 1.25rem;
}

.wp-content :deep(.has-large-font-size) {
  font-size: 1.5rem;
}

.wp-content :deep(.has-x-large-font-size) {
  font-size: 2rem;
}

.wp-content :deep(.wp-block-button__link) {
  display: inline-block;
  padding: 0.75em 1.5em;
  border-radius: 0.5rem;
  background-color: var(--primary, #1a3a5c);
  color: #fff;
  text-decoration: none;
  transition: background-color 0.2s;
}

.wp-content :deep(.wp-block-button__link:hover) {
  background-color: var(--primary-dark, #152d4a);
}

.wp-content :deep(.wp-block-quote) {
  border-left: 4px solid var(--primary, #1a3a5c);
  padding-left: 1em;
  margin: 1.5em 0;
  font-style: italic;
  color: #4a5568;
}

.wp-content :deep(.wp-block-separator) {
  border: none;
  height: 2px;
  background-color: #e2e8f0;
  margin: 2em 0;
}

.wp-content :deep(.wp-block-list) {
  list-style-position: inside;
}

.wp-content :deep(.wp-block-gallery) {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
  gap: 16px !important;
  margin: 2rem 0 !important;
}

.wp-content :deep(.wp-block-gallery .blocks-gallery-item) {
  margin: 0 !important;
  position: relative;
}

.wp-content :deep(.wp-block-gallery figure) {
  margin: 0;
  display: flex;
  flex-direction: column;
}

.wp-content :deep(.wp-block-gallery img) {
  width: 100% !important;
  height: auto !important;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.2s;
}

@media (max-width: 768px) {
  .wp-content :deep(.wp-block-gallery) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
    gap: 12px !important;
  }
}

@media (max-width: 480px) {
  .wp-content :deep(.wp-block-gallery) {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 768px) {

  .wp-content :deep(.alignleft),
  .wp-content :deep(.alignright),
  .wp-content :deep(figure.alignleft),
  .wp-content :deep(figure.alignright) {
    float: none;
    display: block;
    margin: 1em auto;
  }

  .wp-content :deep(iframe) {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    aspect-ratio: 16 / 9;
    border-radius: 0.5rem;
    display: block;
    box-sizing: border-box;
  }

  .wp-content :deep(.gallery-item) {
    flex: 0 1 calc(50% - 0.5rem);
  }
}

@media (max-width: 480px) {
  .wp-content :deep(.gallery-item) {
    flex: 0 1 100%;
  }
}
</style>