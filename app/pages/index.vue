<script setup lang="ts">
const { loggedIn } = useUserSession()

if (loggedIn.value) {
  await navigateTo('/dashboard')
}

const title = 'Modest Human Brands'
const description = 'Autonomous Next-Gen Media Operating System'

const {
  public: { siteUrl },
} = useRuntimeConfig()

const imageUrl = `${siteUrl}/previews/landing.webp`

useSeoMeta({
  title,
  ogTitle: title,
  twitterTitle: title,
  description,
  ogDescription: description,
  twitterDescription: description,
  ogImage: imageUrl,
  twitterImage: imageUrl,
  ogUrl: siteUrl,
})

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [{ name: 'Home', item: '/' }],
  }),
])
</script>

<template>
  <div class="relative">
    <LandingHero :logged-in="loggedIn" />
    <LandingFeatures />
    <LandingPlatform />
    <LandingStats />
    <LandingCTA :logged-in="loggedIn" />
    <LandingFooter />
  </div>
</template>
