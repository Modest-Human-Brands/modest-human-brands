<script setup lang="ts">
const title = 'Waitlist | Modest Human Brands'
const description = 'Join the waitlist for the upcoming release of Modest Human Brands.'

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
  ogUrl: `${siteUrl}/waitlist`,
})

const isSubmitting = ref(false)
const isSubmitted = ref(false)

const { r$ } = useRegleSchema(
  {
    name: '',
    phone: '',
    email: '',
    company: '',
    description: '',
  },
  waitlistSchema
)

const onSubmit = async () => {
  const isValid = await r$.$validate()

  if (isValid) {
    isSubmitting.value = true

    try {
      await $fetch('/api/waitlist', {
        method: 'POST',
        body: r$.$value,
      })

      isSubmitted.value = true
    } catch (error) {
      console.error('Failed to submit to waitlist:', error)
    } finally {
      isSubmitting.value = false
    }
  }
}

// const waitingQueueCount = ref(0)
const targetDate = new Date('2026-09-01T00:00:00')
const now = useNow()

const timeRemaining = computed(() => Math.max(0, targetDate.getTime() - now.value.getTime()))

const days = computed(() =>
  Math.floor(timeRemaining.value / (1000 * 60 * 60 * 24))
    .toString()
    .padStart(2, '0')
)
const hours = computed(() =>
  Math.floor((timeRemaining.value / (1000 * 60 * 60)) % 24)
    .toString()
    .padStart(2, '0')
)
const mins = computed(() =>
  Math.floor((timeRemaining.value / 1000 / 60) % 60)
    .toString()
    .padStart(2, '0')
)

const formattedTargetDate = computed(() => {
  return targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

const countdownUnits = computed(() => [
  { label: 'Days', value: days.value },
  { label: 'Hours', value: hours.value },
  { label: 'Min', value: mins.value },
])

const halfFields = [
  { id: 'name', type: 'text', placeholder: 'Full Name' },
  { id: 'phone', type: 'tel', placeholder: 'Phone Number' },
] as const

const fullFields = [
  { id: 'email', type: 'email', placeholder: 'Email Address' },
  { id: 'company', type: 'text', placeholder: 'Company Name' },
] as const

// const avatarGradients = ['from-info-400 to-accent-500', 'from-success-400 to-info-500', 'from-warning-400 to-alert-500', 'from-accent-400 to-accent-600']
</script>

<template>
  <div class="relative flex w-full flex-col items-center pt-16 selection:bg-accent-500">
    <div class="pointer-events-none absolute inset-0 z-0 flex justify-center opacity-10">
      <img src="/images/bg-grid.svg" alt="" class="w-full max-w-6xl object-cover object-top opacity-50" />
    </div>

    <div class="pointer-events-none absolute left-1/2 top-1/4 z-0 aspect-square w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/10 blur-3xl"></div>

    <main class="relative z-10 my-auto flex w-full max-w-3xl flex-col items-center px-6 py-8 text-center">
      <div class="mb-2 flex items-center justify-center">
        <NuxtIcon name="local:logo" class="text-[48px]" />
      </div>
      <h1 class="mb-4 text-3xl font-semi-bold tracking-tight md:text-5xl">Modest Human Brands</h1>
      <p class="mb-6 max-w-lg text-lg font-regular leading-relaxed text-light-400">Annoncing upcoming release</p>

      <div class="mb-4 flex items-center gap-4">
        <div
          v-for="unit in countdownUnits"
          :key="unit.label"
          class="flex aspect-[1/2] size-24 flex-col items-center justify-center rounded-lg border border-light-500/5 bg-dark-500/30 shadow-xl backdrop-blur-sm">
          <span class="text-4xl font-semi-bold">{{ unit.value }}</span>
          <span class="mt-1 text-xs font-semi-bold uppercase tracking-widest text-light-400">{{ unit.label }}</span>
        </div>
      </div>

      <div class="mb-12 text-sm font-regular text-light-500/60">{{ formattedTargetDate }}</div>

      <div class="relative w-full max-w-md">
        <transition name="fade-slide" mode="out-in">
          <div v-if="isSubmitted" class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-light-500/10 bg-dark-500/40 p-12 shadow-xl backdrop-blur-md">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-success-500/20">
              <NuxtIcon name="local:check" class="text-2xl text-success-400" />
            </div>
            <h3 class="text-2xl font-semi-bold text-white">You're on the list</h3>
            <p class="text-base font-regular text-light-400">Thank you for your interest. We will notify you as soon as early access is available.</p>
          </div>

          <form v-else class="flex w-full flex-col gap-5 text-left" @submit.prevent="onSubmit">
            <div class="grid gap-6 md:grid-cols-2">
              <div v-for="field in halfFields" :key="field.id" class="flex flex-col gap-2">
                <input
                  v-model="r$.$value[field.id]"
                  :type="field.type"
                  :placeholder="field.placeholder"
                  class="w-full rounded-xl border border-light-500/20 bg-dark-500/50 px-4 py-4 text-base text-white shadow-inner outline-none backdrop-blur-sm transition-colors placeholder:text-light-500/50 focus:border-accent-500 focus:bg-dark-500/80"
                  :class="{ 'border-alert-500 focus:border-alert-500': r$[field.id]?.$error }"
                  :disabled="isSubmitting" />
                <span v-if="r$[field.id]?.$error" class="pl-1 text-sm font-semi-bold text-alert-500">
                  {{ r$[field.id]?.$errors[0] }}
                </span>
              </div>
            </div>

            <div v-for="field in fullFields" :key="field.id" class="flex flex-col gap-2">
              <input
                v-model="r$.$value[field.id]"
                :type="field.type"
                :placeholder="field.placeholder"
                class="w-full rounded-xl border border-light-500/20 bg-dark-500/50 px-4 py-4 text-base text-white shadow-inner outline-none backdrop-blur-sm transition-colors placeholder:text-light-500/50 focus:border-accent-500 focus:bg-dark-500/80"
                :class="{ 'border-alert-500 focus:border-alert-500': r$[field.id]?.$error }"
                :disabled="isSubmitting" />
              <span v-if="r$[field.id]?.$error" class="pl-1 text-sm font-semi-bold text-alert-500">
                {{ r$[field.id]?.$errors[0] }}
              </span>
            </div>

            <div class="flex flex-col gap-2">
              <textarea
                v-model="r$.$value.description"
                placeholder="Tell us a little about your agency/workflow needs..."
                class="h-32 w-full resize-y rounded-xl border border-light-500/20 bg-dark-500/50 px-4 py-4 text-base text-white shadow-inner outline-none backdrop-blur-sm transition-colors placeholder:text-light-500/50 focus:border-accent-500 focus:bg-dark-500/80"
                :class="{ 'border-alert-500 focus:border-alert-500': r$.description.$error }"
                :disabled="isSubmitting"></textarea>
              <span v-if="r$.description.$error" class="pl-1 text-sm font-semi-bold text-alert-500">
                {{ r$.description.$errors[0] }}
              </span>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="mt-2 flex w-full items-center justify-center rounded-xl bg-white py-4 text-base font-semi-bold text-black transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-70">
              <span v-if="!isSubmitting">Request Access</span>
              <NuxtIcon v-else name="local:loader" class="animate-spin text-xl text-black" />
            </button>
          </form>
        </transition>
      </div>

      <!-- <div class="mt-12 flex items-center gap-4">
        <div class="flex -space-x-2">
          <div v-for="gradient in avatarGradients.slice(0, Math.min(avatarGradients.length, waitingQueueCount))"
            :key="gradient" :class="['size-8 rounded-full border border-dark-400 bg-gradient-to-br', gradient]" />
        </div>
        <span class="text-md font-regular text-light-400"> {{ waitingQueueCount }} waiting for release </span>
      </div>
      -->
    </main>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}
</style>
