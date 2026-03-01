<script setup lang="ts">
/* const slug = 'red-cat-pictures'
const { data: organizationData } = await useFetch(`/api/organization/${slug}`)

const DEFAULT_ORG = {
  name: 'Modest Human Brands',
  website: 'https://modesthumanbrands.com',
  branding: {
    logo: 'https://modesthumanbrands.com/logo.svg',
    color: { primary: '#4A85FF', accent: '' },
    font: '',
  },
  phone: '+912269711501',
  whatsapp: 'https://wa.me/912269711501',
}
const organization = computed(() => organizationData.value ?? DEFAULT_ORG as Organization) */
</script>

<template>
  <div class="relative flex min-h-screen w-screen items-center justify-start overflow-hidden">
    <!-- Large grid overlay with perspective -->
    <div class="pointer-events-none fixed inset-0 z-0">
      <div
        class="h-full w-full"
        style="
          background-image: linear-gradient(to right, rgba(72, 254, 167, 0.1) 2px, transparent 2px), linear-gradient(to bottom, rgba(72, 254, 167, 0.1) 2px, transparent 2px);
          background-size: 300px 300px;
          background-position: center center;
        " />
      <!-- Fade edges -->
      <div class="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      <div class="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
    </div>
    <main class="relative isolate z-10 mx-auto w-full grow gap-4 overflow-hidden px-2 md:px-4">
      <slot />
    </main>
  </div>
</template>
