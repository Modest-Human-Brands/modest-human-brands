<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stats = [
  { label: 'Projects Delivered', value: 70, suffix: '+', icon: 'local:target-fill' },
  { label: 'Active Teams', value: 2, suffix: '+', icon: 'local:person' },
  { label: 'Media Files Managed', value: 1200, suffix: '+', icon: 'local:mountain' },
  { label: 'Hours Saved Monthly', value: 336, suffix: '+', icon: 'local:hour' },
]

const isVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true
      }
    },
    { threshold: 0.3 }
  )

  const section = document.querySelector('#stats')
  if (section) observer.observe(section)
})
</script>

<template>
  <section id="stats" class="relative mx-auto max-w-7xl px-6 py-24">
    <div class="mb-16 text-center">
      <h2 class="mb-4 text-3xl font-bold md:text-5xl">
        Trusted by creative teams
        <br />
        <span class="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"> worldwide </span>
      </h2>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(stat, idx) in stats"
        :key="stat.label"
        class="group relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/30 hover:shadow-2xl hover:shadow-white/10"
        :style="{ animationDelay: `${idx * 0.1}s` }">
        <div class="absolute inset-0">
          <NuxtImg
            src="https://viteplus.dev/feature-test-background-nostats.jpg"
            alt="Stats Background"
            class="h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
          <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0" />
        </div>

        <div class="relative p-8 text-center">
          <div class="mb-4 flex justify-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-all group-hover:scale-110 group-hover:bg-white/20">
              <NuxtIcon :name="stat.icon" class="text-2xl text-white" />
            </div>
          </div>

          <div class="md:text-6xl mb-2 text-5xl font-bold text-white">
            <AnimatedCounter v-if="isVisible" :target="stat.value" :suffix="stat.suffix" />
            <span v-else>0{{ stat.suffix }}</span>
          </div>

          <div class="text-sm font-semi-bold text-white/60 group-hover:text-white/80">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
