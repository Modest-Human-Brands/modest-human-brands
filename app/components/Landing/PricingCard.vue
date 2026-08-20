<script setup lang="ts">
defineProps<{
  label: string
  title: string
  description: string
  price: string
  priceSuffix?: string
  buttonText: string
  features: { text: string; icon: string }[]
  isRecommended?: boolean
}>()
</script>

<template>
  <div :class="['flex flex-col rounded-lg p-8 md:p-10', isRecommended ? 'relative bg-gradient-to-b from-accent-600/10 to-dark-500 shadow-[0_0_50px_rgba(71,168,235,0.08)]' : 'bg-dark-500 shadow-lg']">
    <div v-if="isRecommended" class="absolute right-6 top-6 rounded-full bg-info-500/20 px-4 py-2 text-xs font-semi-bold uppercase tracking-widest text-info-400">Recommended</div>

    <div class="mb-2 text-sm font-semi-bold uppercase tracking-widest">{{ label }}</div>
    <h3 class="mb-2 text-2xl font-semi-bold md:text-3xl">{{ title }}</h3>
    <p class="mb-10 pr-8 text-base font-regular text-light-400">{{ description }}</p>

    <div class="mb-8 flex items-end gap-2">
      <span class="text-3xl font-semi-bold leading-none tracking-tight md:text-5xl">{{ price }}</span>
      <span class="pb-2 text-base font-regular text-light-400">{{ priceSuffix || '/ user / month' }}</span>
    </div>

    <NuxtLink
      to="/waitlist"
      :class="[
        'mb-12 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-base font-semi-bold transition-transform hover:scale-[1.02]',
        isRecommended ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'bg-white text-black',
      ]">
      <span v-if="isRecommended" class="text-xl">✦</span>
      {{ buttonText }}
    </NuxtLink>

    <ul class="space-y-5 font-regular">
      <li v-for="feature in features" :key="feature.text" class="flex items-center gap-4 text-base text-light-400">
        <div class="size-6">
          <NuxtIcon :name="feature.icon" class="text-xl" :class="[isRecommended ? 'text-accent-400 opacity-90' : 'text-light-400 opacity-70 shadow-accent-400 drop-shadow-sm']" />
        </div>
        <span>{{ feature.text }}</span>
      </li>
    </ul>
  </div>
</template>
