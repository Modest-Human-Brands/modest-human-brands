<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const templateId = useRoute().params.id as string
</script>

<template>
  <SiteEditor :template-id="templateId" />
</template>
