<script setup lang="ts">
defineProps<{
  label: string
  title: string
  description: string
  bullets: string[]
  bg: string
  mockup: string
}>()

const target = useTemplateRef('target')
const isVisible = ref(false)

useIntersectionObserver(
  target,
  ([entry]) => {
    if (entry?.isIntersecting) {
      isVisible.value = true
    }
  },
  {
    threshold: 0.2,
  }
)
</script>

<template>
  <div ref="target" class="grid overflow-hidden border-b border-light-500 md:grid-cols-2">
    <div class="flex flex-col justify-center p-6 md:p-8">
      <span class="mb-4 text-sm font-semi-bold uppercase tracking-widest text-light-400">{{ label }}</span>
      <h2 class="mb-6 text-2xl font-semi-bold">{{ title }}</h2>
      <p class="mb-8 text-base font-regular leading-relaxed text-light-400">{{ description }}</p>

      <ul class="space-y-4">
        <li v-for="bullet in bullets" :key="bullet" class="flex items-center gap-4 text-sm font-regular text-white">
          <div class="flex size-1.5 rounded-full bg-light-500"></div>
          {{ bullet }}
        </li>
      </ul>
    </div>

    <div class="relative row-start-1 aspect-[3/2] w-full overflow-hidden md:row-auto">
      <img :src="bg" class="absolute inset-0 h-full w-full object-cover" alt="" loading="lazy" />
      <div class="absolute inset-0 flex items-end justify-center overflow-hidden">
        <img :src="mockup" class="w-full scale-125 transition-transform duration-700 ease-out" :class="isVisible ? 'translate-y-0' : 'translate-y-1/2'" :alt="mockup" loading="lazy" />
      </div>
    </div>
  </div>
</template>
