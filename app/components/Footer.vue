<template>
  <footer class="bg-white mt-auto border-border border-t">
    <div class="mx-auto px-4 lg:px-8 py-12 container">
      <div v-if="pending" class="py-4 text-center">Загрузка...</div>
      <div v-else class="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <div class="flex justify-center items-center rounded-full w-16 h-16">
              <img src="/images/logo.png" alt="Логотип Кирилло-Мефодиевского храма" class="w-auto h-auto" />
            </div>
            <div>
              <div class="font-serif text-primary text-lg mb-2">Кирилло-Мефодиевский храм</div>
              <div class="font-serif text-sm">
                <p>Часы работы храма</p>
                <p>{{ workingHours }}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="mb-4 font-serif">Навигация</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink to="/" class="text-muted-foreground hover:text-primary transition-colors">Главная</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about" class="text-muted-foreground hover:text-primary transition-colors">О храме
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/rb" class="text-muted-foreground hover:text-primary transition-colors">Расписание
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/news" class="text-muted-foreground hover:text-primary transition-colors">Новости</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/announcements" class="text-muted-foreground hover:text-primary transition-colors">Анонсы
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/donations" class="text-muted-foreground hover:text-primary transition-colors">Пожертвования
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="mb-4 font-serif">Полезные ссылки</h3>
          <div v-if="usefulLinksList.length" class="space-y-2 text-sm">
            <a v-for="link in usefulLinksList" :key="link.label" :href="link.url"
              class="block text-muted-foreground hover:text-primary transition-colors" target="_blank"
              rel="noopener noreferrer">
              {{ link.label }}
            </a>
          </div>
          <div v-else class="text-muted-foreground text-sm">Нет ссылок</div>
        </div>

        <div>
          <h3 class="mb-4 font-serif">Социальные сети прихода</h3>
          <div class="flex flex-wrap gap-3">
            <a v-if="vk" :href="vk" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-2 bg-[#0077FF] hover:bg-[#0066DD] px-4 py-2 rounded-lg text-white transition-colors text-sm">
              <span>ВКонтакте</span>
            </a>
            <a v-if="telegram" :href="telegram" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-2 bg-[#0077FF] hover:bg-[#0066DD] px-4 py-2 rounded-lg text-white transition-colors text-sm">
              <span>Telegram</span>
            </a>
            <a v-if="max" :href="max" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-2 bg-[#0077FF] hover:bg-[#0066DD] px-4 py-2 rounded-lg text-white transition-colors text-sm">
              <span>Max</span>
            </a>
          </div>
          <div class="space-y-2 text-muted-foreground text-sm mt-5">
            <div class="flex items-center gap-2">
              <Phone class="w-4 h-4" />
              <p>Телефон:</p>
              <a :href="`tel:${phoneRaw}`" class="hover:text-primary transition-colors">{{ phone }}</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Нижняя полоса (копирайт) -->
      <div class="pt-8 border-border border-t">
        <div class="text-muted-foreground text-sm text-center">
          <p>© Кирилло-Мефодиевский храм. Все права защищены.</p>
          <p class="mt-2">
            Местная религиозная организация «Православный приход Кирилло-Мефодиевского храма г.о. Балашиха
            Балашихинской епархии Русской Православной Церкви»
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Church, Phone } from 'lucide-vue-next'

// ==================== ИСПРАВЛЕНО ====================
const { baseURL } = useApi()

const { data, pending } = await useFetch<Array<any>>(`${baseURL}/wp-json/wp/v2/details`, {
  key: 'footer-details',
  server: true,
  params: { per_page: 1 }
})
// ===================================================

const contact = computed(() => data.value?.[0] || null)
const workingHours = computed(() => contact.value?.time || '07:00 – 20:00')
const telegram = computed(() => contact.value?.telegram || '')
const vk = computed(() => contact.value?.vk || '')
const max = computed(() => contact.value?.max || '')
const phone = computed(() => contact.value?.phone || '')
const phoneRaw = computed(() => phone.value.replace(/[^0-9+]/g, ''))

const usefulLinksList = computed(() => {
  const raw = contact.value?.useful_links || ''
  if (!raw) return []

  const lines = raw.split(/\r?\n/).filter(line => line.trim() !== '')
  const links: { label: string; url: string }[] = []
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue
    const label = line.slice(0, colonIndex).trim()
    let url = line.slice(colonIndex + 1).trim()
    if (url && !url.startsWith('http')) {
      url = 'https://' + url
    }
    if (label && url) {
      links.push({ label, url })
    }
  }
  return links
})
</script>