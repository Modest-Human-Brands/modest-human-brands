<script setup lang="ts">
const links = {
  company: [
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
  ],
  social: [
    { label: 'whatsapp', icon: 'local:whatsapp', to: 'https://wa.me/c/918910489578' },
    { label: 'instagram', icon: 'local:instagram', to: 'https://www.instagram.com/modesthumanbrands' },
    { label: 'facebook', icon: 'local:facebook', to: 'https://www.facebook.com/modesthumanbrands' },
    { label: 'linkedin', icon: 'local:linkedin', to: 'https://www.linkedin.com/company/modest-human-brands' },
    { label: 'youtube', icon: 'local:youtube', to: 'https://www.youtube.com/@modest-human-brands' },
    { label: 'google-map', icon: 'local:map', to: 'https://maps.app.goo.gl/a5RZtb1rxHC8MoaY6' },
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
              target="__blank__"
              class="grid size-10 place-items-center rounded-full bg-white/5 text-white transition hover:bg-white/20"
              :aria-label="social.label">
              <NuxtIcon :name="social.icon" class="text-xl" />
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
