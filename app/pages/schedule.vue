<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <Calendar class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-5xl md:text-6xl">Расписание богослужений</h1>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div class="flex justify-between items-center mx-auto mb-8 max-w-md">
        <Button variant="outline" size="icon" @click="prevMonth">
          <ChevronLeft class="w-5 h-5" />
        </Button>
        <h2 class="font-serif text-primary text-3xl">{{ currentMonthName }}</h2>
        <Button variant="outline" size="icon" @click="nextMonth">
          <ChevronRight class="w-5 h-5" />
        </Button>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="border-primary border-t-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>

      <div v-else-if="scheduleDataForMonth.length"
        class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-7xl">
        <Card v-for="(item, index) in scheduleDataForMonth" :key="index" class="p-6 hover:shadow-lg transition-all">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="font-serif text-primary text-4xl">{{ item.date }}</div>
              <div class="mt-1 text-muted-foreground text-sm">{{ item.day }}</div>
            </div>
          </div>

          <div v-if="item.liturgical" class="liturgical-day schedule-text" v-html="item.liturgical"></div>

          <div v-if="item.services" class="services-time schedule-text" v-html="item.services"></div>

          <div v-if="!item.liturgical && !item.services" class="text-muted-foreground">
            <em>Нет описания</em>
          </div>
        </Card>
      </div>

      <div v-else class="text-center py-20 text-muted-foreground">
        <p>Нет расписания на выбранный месяц</p>
      </div>

      <div class="bg-muted/50 mx-auto mt-12 p-8 rounded-lg max-w-3xl">
        <h3 class="mb-4 font-serif text-primary text-2xl">Дополнительная информация</h3>
        <div class="space-y-3 text-muted-foreground">
          <p>• Храм открыт ежедневно с 07:00 до 20:00</p>
          <p>• Требы совершаются по предварительной договоренности</p>
          <p>
            • По вопросам расписания можно обращаться по телефону:
            <a href="tel:+74950702646" class="text-primary hover:underline">+7 (495) 070-26-46</a>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import { useContentStore } from '~/stores/content'

const store = useContentStore()
const loading = ref(true)

const currentYear = ref(new Date().getFullYear())
const currentMonthIndex = ref(new Date().getMonth())

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const currentMonthName = computed(() => `${monthNames[currentMonthIndex.value]} ${currentYear.value}`)

const scheduleDataForMonth = computed(() => {
  const monthStr = `${currentYear.value}-${String(currentMonthIndex.value + 1).padStart(2, '0')}`
  return store.schedule
    .filter((item) => item.fullDate.startsWith(monthStr))
    .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
    .map((item) => ({
      date: item.date,
      day: item.day,
      liturgical: item.liturgical || '',
      services: item.services || '',
    }))
})

const loadData = async () => {
  loading.value = true
  if (store.schedule.length === 0) {
    await store.fetchSchedule()
  }
  loading.value = false
}

onMounted(() => {
  loadData()
})

const prevMonth = () => {
  if (currentMonthIndex.value === 0) {
    currentMonthIndex.value = 11
    currentYear.value -= 1
  } else {
    currentMonthIndex.value -= 1
  }
}

const nextMonth = () => {
  if (currentMonthIndex.value === 11) {
    currentMonthIndex.value = 0
    currentYear.value += 1
  } else {
    currentMonthIndex.value += 1
  }
}
</script>

<style scoped>
.schedule-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
}

.schedule-text :deep(strong),
.schedule-text :deep(b) {
  font-weight: 700 !important;
}

.schedule-text :deep([style*="font-weight"]) {}

.schedule-text :deep(em),
.schedule-text :deep(i) {
  font-style: italic !important;
}

.liturgical-day {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.liturgical-day :deep(p) {
  margin: 0 0 0.75rem 0;
}

.liturgical-day :deep(strong),
.liturgical-day :deep(b) {
  font-size: 1.25rem;
  font-weight: 700 !important;
}

.services-time {
  font-size: 0.95rem;
}

.services-time :deep(p) {
  margin: 0.5rem 0;
}
</style>