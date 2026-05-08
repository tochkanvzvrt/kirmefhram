<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <Users class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-5xl md:text-6xl">Духовенство</h1>
        <p class="opacity-90 mx-auto max-w-2xl text-xl">
          Священнослужители Кирилло-Мефодиевского храма
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
      <div v-else class="gap-8 grid grid-cols-1 md:grid-cols-2 mx-auto max-w-6xl">
        <Card v-for="person in clergy" :key="person.id" class="hover:shadow-xl overflow-hidden transition-shadow">
          <div class="bg-muted aspect-square overflow-hidden">
            <a v-if="person.mitlink" :href="person.mitlink" target="_blank" rel="noopener noreferrer">
              <img :src="person.image || '/images/placeholder-clergy.jpg'" :alt="person.name"
                class="w-full h-full object-cover" @error="(e) => e.target.src = '/images/placeholder-clergy.jpg'" />
            </a>
            <img v-else :src="person.image || '/images/placeholder-clergy.jpg'" :alt="person.name"
              class="w-full h-full object-cover" @error="(e) => e.target.src = '/images/placeholder-clergy.jpg'" />
          </div>
          <div class="p-6">
            <h3 class="mb-2 font-serif text-primary text-2xl">{{ person.name }}</h3>
            <div class="clergy-description" v-html="person.description"></div>
          </div>
        </Card>
      </div>

      <div class="bg-muted/50 mx-auto mt-16 p-8 rounded-lg max-w-3xl">
        <h3 class="mb-4 font-serif text-primary text-2xl">Духовное окормление</h3>
        <p class="text-muted-foreground leading-relaxed">
          Священнослужители храма всегда готовы помочь духовным советом, выслушать и
          поддержать. По вопросам духовного окормления, таинствам крещения, венчания,
          соборования и других треб вы можете обращаться в храм лично или по телефону
          <a href="tel:+74950702646" class="text-primary hover:underline">+7 (495) 070-26-46</a>.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Users } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import { useRuntimeConfig } from '#app'
import { decode } from 'html-entities'

interface ClergyMember {
  id: number
  name: string
  description: string
  image: string | null
  mitlink?: string
}

const config = useRuntimeConfig()
const wpBase = config.public.wpApi

const { data, pending, error } = await useFetch<Array<any>>(`${wpBase}/wp-json/wp/v2/clergy`, {
  key: 'clergy',
  server: true,
  params: {
    _embed: true,
    per_page: 100,
  }
})

// Преобразуем данные
const clergy = computed<ClergyMember[]>(() => {
  if (!data.value || !Array.isArray(data.value)) return []

  return data.value.map((item: any) => {
    let name = item.title?.rendered || item.clname || 'Без имени'
    name = name.replace(/&#038;/g, '&').replace(/&#([0-9]+);/g, (match, dec) => String.fromCharCode(dec))
    let description = item.description || ''
    let image: string | null = null
    if (item.photo && typeof item.photo === 'object' && item.photo.guid) {
      image = item.photo.guid
    } else if (item._embedded && item._embedded['wp:featuredmedia'] && item._embedded['wp:featuredmedia'][0]?.source_url) {
      image = item._embedded['wp:featuredmedia'][0].source_url
    }

    return {
      id: item.id,
      name,
      description,
      image,
      mitlink: item.mitlink || '',
    }
  })
})

// SEO
useHead({
  title: 'Духовенство | Кирилло-Мефодиевский храм',
  meta: [
    { name: 'description', content: 'Священнослужители Кирилло-Мефодиевского храма города Балашихи: настоятель, священники, диаконы.' }
  ]
})
</script>

<style scoped>
.clergy-description {
  white-space: pre-wrap;
  /* сохраняет переносы строк из текста */
  word-wrap: break-word;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #4a5568;
}

.clergy-description :deep(strong),
.clergy-description :deep(b) {
  font-weight: 700;
  color: #1e293b;
}

.clergy-description :deep(ul),
.clergy-description :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.25rem;
}

.clergy-description :deep(li) {
  margin-bottom: 0.25rem;
}

.clergy-description :deep(p) {
  margin: 0.5rem 0;
}

.clergy-description :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.clergy-description :deep(br) {
  display: block;
  content: "";
  margin: 0.25rem 0;
}
</style>