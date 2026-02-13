<script setup lang="ts">
defineProps<{
  loggedIn: boolean
}>()

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 2,
}))
</script>

<template>
  <section class="relative mx-auto h-screen max-w-7xl px-6 pb-32 pt-24 md:pt-32">
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="absolute h-1 w-1 rounded-full bg-white/30"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          animation: `float ${particle.duration}s ease-in-out infinite`,
          animationDelay: `${particle.delay}s`,
        }" />
    </div>

    <div class="flex flex-col items-center text-center">
      <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-success-500/20 bg-success-500/5 px-4 py-2 text-sm backdrop-blur-sm">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-500 opacity-75" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
        </span>
        <span class="text-white">Early Beta Release</span>
      </div>

      <h1 class="md:text-7xl lg:text-8xl mb-6 block bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-5xl font-bold leading-tight text-transparent">Modest Human Brands</h1>

      <div class="mb-6 overflow-hidden">
        <p class="animate-slide-up text-xl text-white/90 md:text-2xl lg:text-3xl" style="animation-delay: 0.2s">Autonomous</p>
        <p class="animate-slide-up text-xl text-white/70 md:text-2xl lg:text-3xl" style="animation-delay: 0.4s">Next-Gen Media Operating System</p>
      </div>

      <p class="animate-slide-up mx-auto mb-10 max-w-2xl text-base text-white/50 md:text-lg" style="animation-delay: 0.6s">
        A unified platform for content creation, project management, and media delivery. Built for modern creative teams who demand speed, control, and scalability.
      </p>

      <div class="animate-slide-up flex flex-col gap-4 sm:flex-row" style="animation-delay: 0.8s">
        <NuxtLink
          v-if="!loggedIn"
          to="/auth/signin"
          class="group relative overflow-hidden rounded-xl bg-white fill-black px-8 py-4 text-base font-semi-bold text-black shadow-lg shadow-white/20 transition hover:shadow-white/40">
          <span class="relative z-10 flex items-center justify-center gap-2">
            Get Started
            <NuxtIcon name="local:chevron-bold" class="-scale-x-100 transform text-lg transition-transform group-hover:translate-x-1" />
          </span>
          <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </NuxtLink>

        <NuxtLink v-else to="/drive" class="group relative overflow-hidden rounded-xl bg-white px-8 py-4 text-base font-semi-bold text-black shadow-lg shadow-white/20">
          <span class="relative z-10">Go to Dashboard</span>
        </NuxtLink>

        <NuxtLink to="/#features" class="group rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semi-bold backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10">
          Explore Platform
          <NuxtIcon name="local:chevron-bold" class="ml-2 inline-block -scale-x-100 transform transition-transform group-hover:translate-x-1" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }

  50% {
    transform: translateY(-20px) translateX(10px);
  }
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out;
  animation-fill-mode: both;
  opacity: 0;
}
</style>
