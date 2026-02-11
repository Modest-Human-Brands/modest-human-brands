<script setup lang="ts">
const links = {
  product: [
    { label: 'MDrive', to: '/drive' },
    { label: 'MWap', to: '/wap' },
    { label: 'Pricing', to: '/pricing' },
  ],
  company: [
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
  ],
  social: [
    { label: 'GitHub', icon: 'mdi:github', to: 'https://github.com' },
    { label: 'Twitter', icon: 'mdi:twitter', to: 'https://twitter.com' },
    { label: 'LinkedIn', icon: 'mdi:linkedin', to: 'https://linkedin.com' },
  ],
}
</script>

<template>
  <footer class="relative border-t border-white/10 bg-black/50 backdrop-blur-sm">
    <div class="mx-auto max-w-7xl px-6 py-12">
      <div class="grid gap-12 md:grid-cols-4">
        <div class="md:col-span-2">
          <div class="mb-4 text-xl font-bold">Modest Human Brands</div>
          <p class="mb-6 max-w-md text-sm text-white/60">Autonomous Next-Gen Media Operating System for creative teams</p>
          <div class="flex gap-4">
            <NuxtLink
              v-for="social in links.social"
              :key="social.label"
              :to="social.to"
              external
              class="grid h-10 w-10 place-items-center rounded-full bg-white/5 transition hover:bg-white/20 hover:text-white"
              :aria-label="social.label">
              <NuxtIcon :name="social.icon" class="text-xl" />
            </NuxtLink>
          </div>
        </div>

        <div>
          <div class="mb-4 text-sm font-semi-bold text-white/80">Product</div>
          <div class="space-y-3">
            <NuxtLink v-for="link in links.product" :key="link.label" :to="link.to" class="block text-sm text-white/60 transition hover:text-white">
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>

        <div>
          <div class="mb-4 text-sm font-semi-bold text-white/80">Company</div>
          <div class="space-y-3">
            <NuxtLink v-for="link in links.company" :key="link.label" :to="link.to" class="block text-sm text-white/60 transition hover:text-white">
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/40">© {{ new Date().getFullYear() }} Modest Human Brands. All rights reserved.</div>
    </div>
  </footer>
</template>
