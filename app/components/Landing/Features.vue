<script setup lang="ts">
const features = [
  {
    key: 'mdrive',
    icon: 'mdi:harddisk',
    title: 'MDrive',
    description: 'Organize Media • Access Controlled Distribute • Unlimited Store Media',
    background: 'https://viteplus.dev/feature-dev-background-nostats.jpg',
  },
  {
    key: 'mwap',
    icon: 'mdi:application-outline',
    title: 'MWap',
    description: 'Website/App Builder • Service Deck Builder',
    background: 'https://viteplus.dev/feature-ui-background.jpg',
  },
  {
    key: 'massist',
    icon: 'mdi:robot-outline',
    title: 'MAssist',
    description: 'Gives Insights • Suggest Pipeline Upgrade • Automates tasks',
    background: 'https://viteplus.dev/feature-lint-background.jpg',
  },
  {
    key: 'mconnect',
    icon: 'mdi:share-variant-outline',
    title: 'MConnect',
    description: 'Message/Mail/Popup Template • Client Outreach/In-reach Tracking',
    background: 'https://viteplus.dev/feature-lib-background.jpg',
  },
  {
    key: 'mcoordinate',
    icon: 'mdi:refresh-circle',
    title: 'MCoordinate',
    description: 'Internal Team Chat/Call • Project Channelled Chat/Call',
    background: 'https://viteplus.dev/feature-test-background-nostats.jpg',
  },
  {
    key: 'msync',
    icon: 'mdi:sync',
    title: 'MSync',
    description: 'Stream to MMedia • Sync Media with MDrive',
    background: 'https://viteplus.dev/feature-dev-background-nostats.jpg',
  },
]
</script>

<template>
  <section id="features" class="relative mx-auto max-w-7xl px-6 py-24">
    <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_50%,rgba(72,254,167,0.03),transparent_50%)]" />

    <div class="mb-16 text-center">
      <div class="mb-4 inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-semi-bold text-white backdrop-blur-sm">INTEGRATED MODULES</div>
      <h2 class="md:text-6xl mb-4 text-4xl font-bold">The Unified Platform</h2>
      <p class="bg-gradient-to-r from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">for Creative Teams</p>
      <p class="mx-auto mt-4 max-w-2xl text-lg text-white/60">Eight integrated modules working together seamlessly</p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(feature, idx) in features"
        :key="feature.key"
        class="group relative overflow-hidden rounded-2xl border border-white/10 bg-dark-500/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/30 hover:shadow-2xl hover:shadow-white/10"
        :style="{ animationDelay: `${idx * 0.1}s` }">
        <div class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <NuxtImg :src="feature.background" :alt="feature.title" class="h-full w-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/70" />
        </div>

        <div class="relative p-6">
          <div class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-white/20">
            <NuxtIcon :name="feature.icon" class="text-3xl text-white" />
          </div>

          <h3 class="mb-3 text-xl font-bold">
            {{ feature.title }}
          </h3>

          <p class="text-sm leading-relaxed text-white/60 group-hover:text-white/80">
            {{ feature.description }}
          </p>

          <div class="mt-4 flex items-center gap-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <span class="text-sm font-semi-bold">Explore</span>
            <NuxtIcon name="mdi:arrow-right" class="text-lg transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
