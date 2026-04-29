<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <FileText class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-5xl md:text-6xl">Подать записку</h1>
        <p class="opacity-90 mx-auto max-w-2xl text-xl">
          Подайте записку о здравии или упокоении
        </p>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div class="mx-auto max-w-3xl">
        <Card class="p-8">
          <div id="vonmi-widget" data-id="7cc3b649bd4c30816c55d065261b65dd"></div>
        </Card>

        <div class="mt-8 text-muted-foreground text-sm text-center">
          <p>
            Если у вас возникли вопросы, свяжитесь с нами по телефону
            <a href="tel:+74950702646" class="text-primary hover:underline">+7 (495) 070-26-46</a>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { FileText } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'

onMounted(() => {
  const oldScript = document.querySelector('script[src="https://cdn.vonmi.org/widget/vonmi-x.js"]')
  if (oldScript) oldScript.remove()
  const script = document.createElement('script')
  script.src = 'https://cdn.vonmi.org/widget/vonmi-x.js'
  script.async = true
  document.body.appendChild(script)
})
</script>