<script setup lang="ts">
const capabilities = [
  { text: 'Styling/Branding Management', icon: 'mdi:palette-outline' },
  { text: 'Project Management', icon: 'mdi:folder-outline' },
  { text: 'Media Management', icon: 'mdi:image-multiple-outline' },
  { text: 'Website/App Content Management', icon: 'mdi:web' },
  { text: 'Team Management', icon: 'mdi:account-group-outline' },
  { text: 'Client Management', icon: 'mdi:briefcase-outline' },
  { text: 'Communication Management', icon: 'mdi:chat-outline' },
  { text: 'Finance Management', icon: 'mdi:cash-multiple' },
]
</script>

<template>
  <section class="relative mx-auto max-w-7xl px-6 py-24">
    <div class="relative overflow-hidden rounded-3xl border border-white/10">
      <div class="absolute inset-0">
        <NuxtImg src="https://viteplus.dev/feature-lib-background.jpg" alt="Platform Background" class="h-full w-full object-cover opacity-20" />
        <div class="absolute inset-0 bg-gradient-to-br from-dark-500/95 via-black/90 to-dark-400/95" />
      </div>

      <div class="relative p-8 md:p-16">
        <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div class="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semi-bold text-white backdrop-blur-sm">CORE PLATFORM</div>

            <h2 class="mb-6 text-3xl font-bold leading-tight md:text-5xl">
              Everything you need to
              <br />
              <span class="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent"> run your creative business </span>
            </h2>

            <p class="mb-8 text-lg leading-relaxed text-white/70">From client onboarding to final delivery, MHB handles every aspect of your workflow in one unified system.</p>

            <NuxtLink to="/about" class="group inline-flex items-center gap-2 text-lg text-white transition-all hover:gap-3">
              <span class="font-semi-bold">Learn more about the platform</span>
              <NuxtIcon name="mdi:arrow-right" class="text-2xl" />
            </NuxtLink>
          </div>

          <div class="space-y-3">
            <div
              v-for="(capability, idx) in capabilities"
              :key="capability.text"
              class="group relative overflow-hidden rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
              :style="{ animationDelay: `${idx * 0.05}s` }">
              <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

              <div class="relative flex items-center gap-4 p-4">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 transition-all group-hover:scale-110 group-hover:bg-white/30">
                  <NuxtIcon :name="capability.icon" class="text-xl text-white" />
                </div>
                <span class="font-semi-bold">{{ capability.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
