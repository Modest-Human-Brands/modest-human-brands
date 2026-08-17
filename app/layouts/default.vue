<template>
  <div class="relative flex min-h-screen w-screen items-center justify-start overflow-hidden">
    <!-- Fixed background grid -->
    <div class="pointer-events-none absolute left-0 right-0 top-56 z-10 flex justify-center opacity-40">
      <img src="/images/bg-grid.svg" alt="" class="w-full max-w-[1080px] object-top" />
    </div>

    <!-- Scrollable content -->
    <main class="relative isolate z-20 mx-auto w-full grow gap-4 px-4 md:px-6">
      <slot />
    </main>
  </div>
</template>
