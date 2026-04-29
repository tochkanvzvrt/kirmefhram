<template>
  <div class="w-full">
    <section class="bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div class="mx-auto px-4 lg:px-8 text-center container">
        <div class="inline-flex justify-center items-center bg-white/10 mb-6 rounded-full w-20 h-20">
          <Heart class="w-10 h-10" />
        </div>
        <h1 class="mb-4 font-serif text-5xl md:text-6xl">Пожертвования</h1>
        <p class="opacity-90 mx-auto max-w-2xl text-xl">
          Ваша помощь в строительстве и содержании храма
        </p>
      </div>
    </section>

    <section class="mx-auto px-4 lg:px-8 py-16 container">
      <div class="mx-auto max-w-4xl">
        <div class="mb-12 text-center">
          <p class="text-muted-foreground text-lg leading-relaxed">
            Дорогие братья и сестры! Благодарим вас за желание помочь нашему храму.
            Ваши пожертвования идут на содержание прихода, проведение богослужений,
            благоустройство храма и благотворительную деятельность.
          </p>
        </div>

        <div class="mb-12">
          <Card class="p-7">
            <VonmiDonation />
          </Card>
        </div>
        <div class="mt-12 text-center">
          <p class="mb-2 font-serif text-primary text-xl">Спаси Господи!</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Heart, Info } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import VonmiDonation from '~/components/VonmiDonation.vue' 
</script>