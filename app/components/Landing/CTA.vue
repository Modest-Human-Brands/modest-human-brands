<script setup lang="ts">
defineProps<{
  loggedIn: boolean
}>()
</script>

<template>
  <section class="relative mx-auto max-w-7xl px-6 py-24">
    <div class="relative overflow-hidden rounded-3xl border border-white/30">
      <div class="absolute inset-0">
        <NuxtImg src="https://viteplus.dev/terminal-background.jpg" alt="CTA Background" class="h-full w-full object-cover opacity-30" />
        <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-black/80 to-dark-500/90" />
      </div>

      <div class="absolute inset-0">
        <div class="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-white/20 blur-[120px]" />
        <div class="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-white/10 blur-[120px]" />
      </div>

      <div class="relative p-12 text-center md:p-20">
        <div class="mb-6 inline-block animate-bounce rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semi-bold text-white backdrop-blur-sm">Join us today</div>

        <h2 class="md:text-6xl mb-6 text-4xl font-bold leading-tight">
          Ready to transform
          <br />
          <span class="bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent"> your workflow? </span>
        </h2>

        <p class="mx-auto mb-10 max-w-2xl text-lg text-white/70 md:text-xl">Join thousands of creative teams using Modest Human Brands to streamline their operations.</p>

        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <NuxtLink
            v-if="!loggedIn"
            to="/auth/signin"
            class="group relative overflow-hidden rounded-xl bg-white fill-black px-10 py-5 text-lg font-semi-bold text-black shadow-2xl shadow-white/30 transition-all hover:scale-105 hover:shadow-white/50">
            <span class="relative z-10 flex items-center justify-center gap-2">
              Start Free Trial
              <NuxtIcon name="local:chevron-bold" class="-scale-x-100 transform text-xl transition-transform group-hover:translate-x-1" />
            </span>
            <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </NuxtLink>

          <NuxtLink v-else to="/dashboard" class="group relative overflow-hidden rounded-xl bg-white px-10 py-5 text-base font-semi-bold text-black shadow-2xl shadow-white/30">
            <span class="relative z-10">Go to Dashboard</span>
          </NuxtLink>

          <NuxtLink
            to="/#pricing"
            class="group rounded-xl border border-white/20 bg-white/5 px-10 py-5 text-base font-semi-bold backdrop-blur-sm transition-all hover:scale-105 hover:border-white/30 hover:bg-white/10">
            View Pricing
            <NuxtIcon name="local:chevron-bold" class="ml-2 inline-block -scale-x-100 transform transition-transform group-hover:translate-x-1" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
