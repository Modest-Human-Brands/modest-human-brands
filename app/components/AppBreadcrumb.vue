<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string | object
  icon?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav aria-label="Breadcrumb" class="flex whitespace-nowrap">
    <ol class="flex items-center text-sm">
      <li v-for="(item, index) in items" :key="index" class="flex items-center">
        <span v-if="index !== 0" class="text-gray-500 mx-1 select-none">
          <NuxtIcon name="local:chevron-bold" class="scale-[-1] text-[16px]" />
        </span>

        <template v-if="item.to && index !== items.length - 1">
          <NuxtLink :to="item.to" class="text-gray-500 flex items-center gap-2 transition-colors duration-200 hover:text-white">
            <NuxtIcon v-if="item.icon" :name="item.icon" class="text-[20px]" />
            <span>
              {{ item.label }}
            </span>
          </NuxtLink>
        </template>

        <template v-else>
          <span class="font-medium flex items-center gap-2 text-white" aria-current="page">
            <NuxtIcon v-if="item.icon" :name="item.icon" class="text-[20px]" />
            <span>
              {{ item.label }}
            </span>
          </span>
        </template>
      </li>
    </ol>
  </nav>
</template>
