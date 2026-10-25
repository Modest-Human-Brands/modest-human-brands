<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const slug = useRoute().params.slug as string

const { data: site } = await useFetch<Site>(`/api/site/${slug}`)

if (!site.value) throw createError({ statusCode: 404, statusMessage: 'Site not found', fatal: true })
</script>

<template>
  <SiteEditor v-if="site" :key="site.slug" :template-id="site.templateId" :site="site" />
</template>
