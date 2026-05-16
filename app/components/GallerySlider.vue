<template>
  <div v-if="images.length" class="gallery-slider">
    <button class="slider-btn left" @click="scroll(-1)" :disabled="currentIndex === 0">‹</button>
    <div class="slider-track" ref="trackRef">
      <img
        v-for="(img, i) in images"
        :key="i"
        :src="img"
        :alt="`Фото ${i + 1}`"
        class="slider-img"
        loading="lazy"
        @click="$emit('imageClick', img)"
      />
    </div>
    <button class="slider-btn right" @click="scroll(1)" :disabled="currentIndex >= images.length - 1">›</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  images: string[]
}>()

defineEmits<{
  imageClick: [src: string]
}>()

const trackRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)

const scroll = (dir: number) => {
  if (!trackRef.value) return
  const slides = trackRef.value.children as HTMLCollectionOf<HTMLElement>
  let newIndex = currentIndex.value + dir
  if (newIndex < 0) newIndex = 0
  if (newIndex >= slides.length) newIndex = slides.length - 1
  currentIndex.value = newIndex
  
  // Скроллим к конкретному слайду по его offsetLeft
  const targetSlide = slides[newIndex]
  if (targetSlide) {
    trackRef.value.scrollTo({ left: targetSlide.offsetLeft, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.gallery-slider {
  position: relative;
  display: flex;
  align-items: stretch; /* чтобы дорожка тянулась на всю высоту */
  margin: 2rem 0;
  border-radius: 1rem;
  padding: 0.5rem;
}

.slider-track {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  flex: 1;
  -ms-overflow-style: none;
  scrollbar-width: none;
  align-items: center; /* выравнивание фото по центру дорожки */
}

.slider-track::-webkit-scrollbar {
  display: none;
}

.slider-img {
  scroll-snap-align: start;
  scroll-snap-stop: always;
  flex-shrink: 0;
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.slider-img:hover {
  transform: scale(1.02);
}

.slider-btn {
  background: rgba(0, 0, 0, 0.3);
  border: none;
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  position: absolute;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  backdrop-filter: blur(4px);
  transition: background 0.2s;
  line-height: 1;
  padding: 0;
  text-align: center;
}

.slider-btn:hover {
  background: rgba(0, 0, 0, 0.5);
}

.slider-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.slider-btn.left { left: 10px; }
.slider-btn.right { right: 10px; }

@media (max-width: 768px) {
  .slider-img {
    max-height: 300px;
  }
  .slider-btn {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
  }
}
</style>