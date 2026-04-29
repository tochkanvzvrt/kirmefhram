<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <MapPin class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-5xl md:text-6xl">Контакты</h1>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div v-if="pending" class="py-16 text-center">
        <p class="text-muted-foreground">Загрузка контактов...</p>
      </div>
      <div v-else-if="error" class="py-16 text-center text-destructive">
        <p>Ошибка загрузки данных. Попробуйте позже.</p>
      </div>
      <div v-else class="gap-8 grid grid-cols-1 lg:grid-cols-2 mb-12">
        <!-- Левый блок: контакты из API -->
        <div class="space-y-6">
          <!-- Адрес (статический, при желании можно вынести в API) -->
          <Card class="p-6">
            <div class="flex items-start gap-4">
              <div class="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-full w-12 h-12">
                <MapPin class="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 class="mb-2 font-serif text-xl">Адрес</h3>
                <p class="text-muted-foreground">
                  Московская область, г.о. Балашиха,<br />
                  мкр. Железнодорожный,<br />
                  ул. Рождественская, д. 2, корп. 1
                </p>
              </div>
            </div>
          </Card>

          <Card class="p-6">
            <div class="flex items-start gap-4">
              <div class="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-full w-12 h-12">
                <Phone class="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 class="mb-2 font-serif text-xl">Телефон</h3>
                <a :href="`tel:${phoneRaw}`" class="text-muted-foreground hover:text-primary transition-colors">
                  {{ phone }}
                </a>
              </div>
            </div>
          </Card>

          <Card class="p-6">
            <div class="flex items-start gap-4">
              <div class="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-full w-12 h-12">
                <Mail class="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 class="mb-2 font-serif text-xl">Email</h3>
                <a :href="`mailto:${email}`" class="text-muted-foreground hover:text-primary transition-colors">
                  {{ email }}
                </a>
              </div>
            </div>
          </Card>

          <Card class="p-6">
            <div class="flex items-start gap-4">
              <div class="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-full w-12 h-12">
                <Clock class="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 class="mb-2 font-serif text-xl">Часы работы</h3>
                <p class="text-muted-foreground">Храм открыт ежедневно</p>
                <p class="text-muted-foreground">{{ workingHours }}</p>
              </div>
            </div>
          </Card>

          <Card class="p-6">
            <h3 class="mb-4 font-serif text-xl">Социальные сети</h3>
            <div class="flex gap-4">
              <a v-if="vk" :href="vk" target="_blank" rel="noopener noreferrer"
                class="flex items-center gap-2 bg-[#0077FF] hover:bg-[#0066DD] px-4 py-2 rounded-lg text-white transition-colors">
                <span>ВКонтакте</span>
              </a>
              <a v-if="telegram" :href="telegram" target="_blank" rel="noopener noreferrer"
                class="flex items-center gap-2 bg-[#0077FF] hover:bg-[#0066DD] px-4 py-2 rounded-lg text-white transition-colors">
                <span>Telegram</span>
              </a>
              <a v-if="max" :href="max" target="_blank" rel="noopener noreferrer"
                class="flex items-center gap-2 bg-[#0077FF] hover:bg-[#0066DD] px-4 py-2 rounded-lg text-white transition-colors">
                <span>MAX</span>
              </a>
            </div>
          </Card>
        </div>

        <div>
          <Card class="h-full min-h-[500px] overflow-hidden">
            <div class="flex justify-center items-center bg-gradient-to-br from-muted to-muted/50 w-full h-full">
              <div class="p-8 w-full h-full text-center">
                <div id="map-ya" class="w-full h-full">
                  <iframe
                    src="https://yandex.ru/map-widget/v1/?um=constructor%3A2f473dff3139fd71f1d23a3a2eb9f4b4c8a8ef46ade98b0c155e93e5ec3f6408&amp;source=constructor"
                    width="100%" height="100%" frameborder="0" class="w-full h-full" loading="lazy"></iframe>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Блок реквизитов (HTML из API) -->
      <div class="mx-auto max-w-4xl">
        <Card class="bg-muted/30 p-8">
          <h2 class="mb-6 font-serif text-primary text-2xl">Реквизиты прихода</h2>
          <div class="parish-details" v-html="parishDetails"></div>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { MapPin, Phone, Mail, Clock } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
const wpBase = config.public.wpApi

const { data, pending, error } = await useFetch<Array<any>>(`${wpBase}/wp-json/wp/v2/details`, {
  key: 'contacts',
  server: true,
  params: { per_page: 1 }
})

const contact = computed(() => data.value?.[0] || null)

const phone = computed(() => contact.value?.phone || '+7 (495) 070-26-46')
const phoneRaw = computed(() => phone.value.replace(/[^0-9+]/g, ''))
const email = computed(() => contact.value?.mail || 'info@kirmef.ru')
const telegram = computed(() => contact.value?.telegram || '')
const vk = computed(() => contact.value?.vk || '')
const max = computed(()=> contact.value?.max || '')
const workingHours = computed(() => contact.value?.time || '07:00 – 20:00')
const parishDetails = computed(() => contact.value?.parish_details || '<p>Нет данных</p>')

useHead({
  title: 'Контакты | Кирилло-Мефодиевский храм',
  meta: [
    { name: 'description', content: 'Контакты Кирилло-Мефодиевского храма города Балашихи: адрес, телефон, email, часы работы, реквизиты.' }
  ]
})
</script>

<style scoped>
#map-ya,
#map-ya iframe {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.parish-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.parish-details :deep(p) {
  margin: 0;
}

.parish-details :deep(.font-medium) {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.parish-details :deep(.text-muted-foreground) {
  color: #64748b;
}
</style>