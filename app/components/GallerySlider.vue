<template>
  <!-- Основной контейнер — показывается только если есть хотя бы одно изображение -->
  <div v-if="images.length" class="gallery-slider">
    
    <!-- Кнопка «назад» — фиксирована слева, скрывается/блокируется на первом слайде -->
    <button class="slider-btn left" @click="scroll(-1)" :disabled="currentIndex === 0">‹</button>
    
    <!-- Дорожка со всеми изображениями — по ней происходит скролл -->
    <div class="slider-track" ref="trackRef">
      <!-- Каждое переданное изображение рендерим как отдельный слайд -->
      <img
        v-for="(img, i) in images"
        :key="i"
        :src="img"
        :alt="`Фото ${i + 1}`"
        class="slider-img"
        loading="lazy"
      />
    </div>
    
    <!-- Кнопка «вперёд» — фиксирована справа, скрывается/блокируется на последнем слайде -->
    <button class="slider-btn right" @click="scroll(1)" :disabled="currentIndex >= images.length - 1">›</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Принимаем массив URL-ов изображений от родителя
const props = defineProps<{
  images: string[]
}>()

// Ссылка на DOM-элемент дорожки, чтобы управлять скроллом
const trackRef = ref<HTMLElement | null>(null)

// Индекс текущего видимого слайда (нужен для блокировки кнопок)
const currentIndex = ref(0)

// Прокручивает дорожку на один слайд влево (-1) или вправо (+1)
const scroll = (dir: number) => {
  if (!trackRef.value) return
  
  // Ширина одного слайда равна ширине видимой области дорожки
  const step = trackRef.value.clientWidth
  
  // Вычисляем новый индекс, не выходя за границы
  const newIndex = Math.max(0, Math.min(currentIndex.value + dir, props.images.length - 1))
  currentIndex.value = newIndex
  
  // Плавно скроллим к нужной позиции
  trackRef.value.scrollTo({ left: step * newIndex, behavior: 'smooth' })
}
</script>

<style scoped>
/* Основной контейнер слайдера */
.gallery-slider {
  position: relative;          /* чтобы кнопки позиционировались внутри */
  display: flex;
  align-items: center;
  margin: 2rem 0;
  background: #f8fafc;        /* светло-серый фон */
  border-radius: 1rem;
  padding: 1rem;
}

/* Горизонтальная дорожка, по которой ездят слайды */
.slider-track {
  display: flex;
  gap: 10px;                   /* расстояние между слайдами */
  overflow-x: auto;            /* разрешаем горизонтальный скролл */
  scroll-snap-type: x mandatory; /* прилипание к слайдам */
  scroll-behavior: smooth;     /* плавный скролл */
  flex: 1;
  -ms-overflow-style: none;    /* скрываем скроллбар в IE */
  scrollbar-width: none;       /* скрываем скроллбар в Firefox */
}

/* Скрываем скроллбар в Chrome/Safari */
.slider-track::-webkit-scrollbar {
  display: none;
}

/* Каждое изображение внутри слайдера */
.slider-img {
  scroll-snap-align: start;    /* прилипает к началу при скролле */
  flex-shrink: 0;              /* не сжимается */
  width: 100%;                 /* занимает всю видимую ширину */
  max-height: 500px;           /* ограничение по высоте */
  object-fit: contain;         /* вписывается целиком без обрезки */
  border-radius: 12px;
  background: #fff;
}

/* Кнопки «влево» и «вправо» */
.slider-btn {
  background: rgba(255, 255, 255, 0.5);  /* более прозрачный фон */
  border: 1px solid rgba(255, 255, 255, 0.3);  /* едва заметная граница */
  font-size: 2rem;
  padding: 0;                    /* убираем внутренние отступы */
  width: 48px;                   /* фиксированная ширина */
  height: 48px;                  /* фиксированная высота */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;            /* идеальный круг */
  position: absolute;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);  /* более лёгкая тень */
  color: #333;
  backdrop-filter: blur(4px);    /* размытие фона под кнопкой */
  transition: background 0.2s, box-shadow 0.2s;
}

.slider-btn:hover {
  background: rgba(255, 255, 255, 0.7);  /* становится плотнее при наведении */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Состояние неактивной кнопки (крайнее положение) */
.slider-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

/* Фиксируем кнопку слева */
.slider-btn.left {
  left: 10px;
}

/* Фиксируем кнопку справа */
.slider-btn.right {
  right: 10px;
}

/* На мобильных устройствах уменьшаем кнопки */
@media (max-width: 768px) {
  .slider-btn {
    font-size: 1.5rem;
    padding: 0.1em 0.3em;
  }
}
</style>