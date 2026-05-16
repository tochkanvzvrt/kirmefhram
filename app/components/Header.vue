<template>
  <header class="top-0 z-50 sticky bg-white/95 shadow-sm backdrop-blur-sm border-border border-b">
    <div class="mx-auto px-4 lg:px-8 max-w-[1400px] xl:max-w-[1600px]">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div class="flex justify-center items-center rounded-full w-12 h-12">
            <img src="/images/logo.png" alt="Логотип Кирилло-Мефодиевского храма" class="w-12 h-12" />
          </div>
          <div class="hidden lg:block">
            <div class="font-serif text-primary text-xl">Кирилло-Мефодиевский храм</div>
            <div class="text-muted-foreground text-sm">город Балашиха</div>
          </div>
        </NuxtLink>

        <!-- Desktop navigation -->
        <nav class="hidden lg:flex items-center gap-6 xl:gap-8 font-bold">
          <template v-for="item in menuItems" :key="item.path">
            <div v-if="item.hasDropdown" class="relative" @mouseenter="openDropdown(item.label)"
              @mouseleave="closeDropdown(item.label)">
              <button :class="[
                'text-sm transition-colors hover:text-primary flex items-center gap-1',
                isActive(item.path) || item.children?.some(child => isActive(child.path))
                  ? 'text-primary font-medium'
                  : 'text-foreground/80',
              ]">
                {{ item.label }}
                <ChevronDown class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': dropdownOpen[item.label] }" />
              </button>
              <Transition enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2">
                <div v-if="dropdownOpen[item.label]"
                  class="top-full left-0 absolute bg-white shadow-lg mt-2 py-2 border border-border rounded-lg min-w-[200px]">
                  <NuxtLink v-for="child in item.children" :key="child.path" :to="child.path"
                    class="block hover:bg-muted px-4 py-2 text-sm transition-colors"
                    :class="{ 'text-primary font-medium': isActive(child.path) }">
                    {{ child.label }}
                  </NuxtLink>
                </div>
              </Transition>
            </div>
            <NuxtLink v-else :to="item.path" :class="[
              'text-sm transition-colors hover:text-primary',
              isActive(item.path) ? 'text-primary font-medium' : 'text-foreground/80',
            ]">
              {{ item.label }}
            </NuxtLink>
          </template>
        </nav>

        <!-- Right side buttons -->
        <div class="hidden lg:flex items-center gap-3">
          <div class="relative" @mouseenter="announcementsOpen = true" @mouseleave="announcementsOpen = false">
            <Transition enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2">
              <div v-if="announcementsOpen"
                class="top-full right-0 absolute bg-white shadow-lg mt-2 py-2 border border-border rounded-lg w-80">
                <div class="px-4 py-2 border-border border-b">
                  <h4 class="font-serif text-primary text-sm">Анонсы</h4>
                </div>
                <NuxtLink v-for="announcement in announcements" :key="announcement.id" to="/announcements"
                  class="block hover:bg-muted px-4 py-3 border-border last:border-0 border-b transition-colors">
                  <div class="font-medium text-sm">{{ announcement.title }}</div>
                  <span class="text-muted-foreground text-xs">{{ announcement.date }}</span>
                </NuxtLink>
              </div>
            </Transition>
          </div>

          <NuxtLink to="/submit-note">
            <Button class="bg-[#C8A35F] hover:bg-accent/90 text-accent-foreground bg">
              Подать записку
            </Button>
          </NuxtLink>
        </div>

        <!-- Mobile menu button -->
        <button class="lg:hidden hover:bg-muted p-2 rounded-lg transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen">
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile menu -->
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-250 ease-in"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
        <div v-if="mobileMenuOpen" class="lg:hidden py-4 border-border border-t">
          <nav class="flex flex-col gap-2">
            <template v-for="item in menuItems" :key="item.path">
              <div v-if="item.hasDropdown">
                <button @click="toggleMobileDropdown(item.label)"
                  class="flex justify-between items-center hover:bg-muted px-4 py-2 rounded-lg w-full text-left transition-colors">
                  <span class="font-medium text-muted-foreground text-sm">{{ item.label }}</span>
                  <ChevronDown class="w-4 h-4 transition-transform duration-200"
                    :class="{ 'rotate-180': mobileDropdownOpen[item.label] }" />
                </button>
                <Transition enter-active-class="transition-all duration-200 ease-out"
                  enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-40"
                  leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 max-h-40"
                  leave-to-class="opacity-0 max-h-0">
                  <div v-if="mobileDropdownOpen[item.label]" class="overflow-hidden">
                    <NuxtLink v-for="child in item.children" :key="child.path" :to="child.path"
                      class="block px-8 py-2 rounded-lg transition-colors"
                      :class="{ 'bg-primary text-white': isActive(child.path), 'hover:bg-muted text-foreground': !isActive(child.path) }"
                      @click="mobileMenuOpen = false">
                      {{ child.label }}
                    </NuxtLink>
                  </div>
                </Transition>
              </div>
              <NuxtLink v-else :to="item.path" class="px-4 py-3 rounded-lg transition-colors"
                :class="{ 'bg-primary text-white': isActive(item.path), 'hover:bg-muted text-foreground': !isActive(item.path) }"
                @click="mobileMenuOpen = false">
                {{ item.label }}
              </NuxtLink>
            </template>

            <NuxtLink to="/donations" class="mt-2" @click="mobileMenuOpen = false">
              <Button variant="outline" class="gap-2 border-accent w-full text-accent">
                Пожертвования
              </Button>
            </NuxtLink>
            <NuxtLink to="/submit-note" class="mt-2" @click="mobileMenuOpen = false">
              <Button class="bg-accent hover:bg-accent/90 w-full text-accent-foreground">
                Подать записку
              </Button>
            </NuxtLink>
          </nav>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { Church, ChevronDown, Menu, X, Heart, Bell } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'

const route = useRoute()

const mobileMenuOpen = ref(false)
const announcementsOpen = ref(false)

// Dropdown states
const dropdownOpen = reactive<Record<string, boolean>>({
  'О храме': false,
  'Социальное служение': false,
})

const mobileDropdownOpen = reactive<Record<string, boolean>>({
  'О храме': false,
  'Социальное служение': false,
})

let timeoutId: ReturnType<typeof setTimeout> | null = null

const openDropdown = (label: string) => {
  if (timeoutId) clearTimeout(timeoutId)
  Object.keys(dropdownOpen).forEach(key => {
    dropdownOpen[key] = false
  })
  dropdownOpen[label] = true
}

const closeDropdown = (label: string) => {
  timeoutId = setTimeout(() => {
    dropdownOpen[label] = false
  }, 100)
}

const toggleMobileDropdown = (label: string) => {
  mobileDropdownOpen[label] = !mobileDropdownOpen[label]
}

const menuItems = [
  { label: 'Главная', path: '/' },
  { label: 'Анонсы', path: '/announcements' },
  { label: 'Новости', path: '/news' },
  { label: 'Расписание', path: '/schedule' },
  {
    label: 'О храме',
    path: '/about',
    hasDropdown: true,
    children: [
      { label: 'Духовенство', path: '/clergy' },
      { label: 'Историческая справка', path: '/about' },
      { label: 'Поддержать храм', path: '/donations' },
      { label: 'Контакты', path: '/contacts' }
    ],
  },
  { label: 'Галерея', path: '/gallery' },
  {
    label: 'Социальное служение',
    path: '/social-ministry',
    hasDropdown: true,
    children: [
      { label: 'Воскресная школа', path: '/sunday-school' },
      { label: 'Молодёжный кружок', path: '/youth-club' },
      { label: 'Взрослая воскресная школа', path: '/adultsundayschool' },
    ],
  },
  { label: 'Воскресная школа', path: '/sunday-school' },
]

const announcements = [
  { id: 1, title: 'Набор в воскресную школу', date: 'Продолжается', urgent: true },
  { id: 2, title: 'Молодёжная встреча', date: '16 марта', urgent: false },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

// Очистка таймеров при размонтировании
onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<style scoped>
.max-h-0 {
  max-height: 0;
}

.max-h-40 {
  max-height: 10rem;
}
</style>