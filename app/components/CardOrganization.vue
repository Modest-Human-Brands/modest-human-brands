<script setup lang="ts">
defineProps<{ organization: Organization }>()

const cardRef = useTemplateRef<HTMLDivElement>('card')
const open = useElementHover(cardRef, { delayLeave: 700 })
</script>

<template>
  <div class="flex justify-center">
    <div
      ref="card"
      class="relative flex items-center overflow-hidden bg-dark-400/95 p-2 shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out"
      :class="open ? 'gap-1 rounded-full py-2 md:pr-8' : 'rounded-full'"
      :style="{ boxShadow: `0 0 0 2px color-mix(in srgb, ${organization.branding.color.primary} 80%, transparent)` }">
      <!-- Shimmer sweep -->
      <div class="shimmer pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500" />
      <!-- Glow pulse -->
      <div
        class="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500"
        style="
          box-shadow:
            0 0 0 1px rgb(74 133 255 / 25%),
            0 0 24px rgb(74 133 255 / 12%);
        " />
      <!-- Logo -->
      <div class="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full p-1 transition-all duration-300 md:size-16">
        <div
          class="absolute inset-0 rounded-full transition-opacity duration-300"
          :class="open ? 'opacity-100' : 'opacity-0'"
          style="background: radial-gradient(circle, rgb(74 133 255 / 18%) 0%, transparent 70%)" />
        <NuxtImg :src="organization.branding.logo" :alt="organization.name" class="relative size-full object-contain" />
      </div>

      <!-- Expanded panel -->
      <div class="flex flex-col gap-1 overflow-hidden transition-all duration-500 ease-in-out md:gap-2" :class="open ? 'max-w-sm opacity-100' : 'max-w-0 opacity-0'">
        <p class="whitespace-nowrap text-xs font-bold tracking-wider text-white md:text-base">
          {{ organization.name }}
        </p>

        <div class="flex items-center gap-1.5">
          <!-- Visit website -->
          <NuxtLink
            :to="organization.website"
            external
            target="_blank"
            rel="noopener"
            class="flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-colors"
            :style="{
              color: organization.branding.color.primary,
              backgroundColor: `color-mix(in srgb, ${organization.branding.color.primary} 15%, transparent)`,
              borderColor: `color-mix(in srgb, ${organization.branding.color.primary} 30%, transparent)`,
            }"
            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = `color-mix(in srgb, ${organization.branding.color.primary} 25%, transparent)`)"
            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = `color-mix(in srgb, ${organization.branding.color.primary} 15%, transparent)`)">
            <NuxtIcon name="local:link" class="text-[14px]" />
            Visit Us
          </NuxtLink>

          <!-- Call -->
          <NuxtLink
            v-if="organization.phone"
            :to="`tel:${organization.phone}`"
            external
            class="flex size-7 items-center justify-center rounded-full bg-dark-600 text-light-400 transition-colors hover:bg-success-500/20 hover:text-[oklch(76.8%_0.233_130.85)]"
            :title="`Call ${organization.phone}`">
            <NuxtIcon name="local:phone" class="text-[14px]" />
          </NuxtLink>

          <!-- WhatsApp -->
          <NuxtLink
            v-if="organization.whatsapp"
            :to="`https://wa.me/${organization.whatsapp.replace(/\D/g, '')}`"
            target="_blank"
            rel="noopener"
            class="flex size-7 items-center justify-center rounded-full bg-dark-600 text-light-400 transition-colors hover:bg-success-500/20 hover:text-[oklch(72.3%_0.219_149.579)]"
            title="WhatsApp">
            <NuxtIcon name="local:whatsapp" class="text-[14px]" />
          </NuxtLink>

          <div v-if="organization.socials && Object.values(organization.socials).some(Boolean)" class="mx-0.5 h-4 w-px bg-white/10" />

          <!-- Instagram -->
          <NuxtLink
            v-if="organization.socials?.instagram"
            :to="organization.socials.instagram"
            external
            target="_blank"
            rel="noopener"
            class="hover:bg-pink-500/20 flex size-7 items-center justify-center rounded-full bg-dark-600 text-light-400 transition-colors hover:text-[oklch(71.8%_0.202_349.761)]">
            <NuxtIcon name="local:instagram" class="text-[14px]" />
          </NuxtLink>

          <!-- Facebook -->
          <NuxtLink
            v-if="organization.socials?.facebook"
            :to="organization.socials.facebook"
            external
            target="_blank"
            rel="noopener"
            class="hover:bg-blue-500/20 flex size-7 items-center justify-center rounded-full bg-dark-600 text-light-400 transition-colors hover:text-[oklch(70.7%_0.165_254.624)]">
            <NuxtIcon name="local:facebook" class="text-[14px]" />
          </NuxtLink>

          <!-- YouTube -->
          <NuxtLink
            v-if="organization.socials?.youtube"
            :to="organization.socials.youtube"
            external
            target="_blank"
            rel="noopener"
            class="flex size-7 items-center justify-center rounded-full bg-dark-600 text-light-400 transition-colors hover:bg-alert-500/20 hover:text-[oklch(71.2%_0.194_13.428)]">
            <NuxtIcon name="local:youtube" class="text-[14px]" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shimmer {
  background: linear-gradient(105deg, transparent 20%, rgb(255 255 255 / 4%) 40%, rgb(255 255 255 / 8%) 50%, rgb(255 255 255 / 4%) 60%, transparent 80%);
  background-size: 200% 100%;
  animation: shimmer 2.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% center;
  }

  100% {
    background-position: -200% center;
  }
}
</style>
