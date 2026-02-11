<script setup lang="ts"></script>

<template>
  <div class="flex h-screen w-screen items-center justify-start">
    <!-- <LazyAppHeader  /> -->
    <main class="relative isolate mx-auto w-full grow gap-4 overflow-hidden px-2 md:mb-8 md:px-4">
      <slot />
    </main>
    <!-- <LazyAppFooter v-if="showFooter" hydrate-on-visible /> -->
  </div>
</template>
