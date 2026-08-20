<script setup lang="ts">
const { loggedIn } = useUserSession()

if (loggedIn.value) {
  await navigateTo('/dashboard')
}

const title = 'Modest Human Brands'
const description = 'The collaborative workflow management app built for creatives.'

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

const socialLinks = [
  { icon: 'local:instagram', to: 'https://instagram.com/modesthumanbrands', alt: 'Instagram' },
  { icon: 'local:linkedin', to: 'https://linkedin.com/company/modest-human-brands', alt: 'LinkedIn' },
  { icon: 'local:youtube', to: 'https://youtube.com/@modesthumanbrands', alt: 'YouTube' },
]

const subHeroFeatures = [
  {
    title: 'Creative Project Management',
    description: 'Track shoots, tasks, and production schedules without the setup overhead.',
    image: '/images/progress-card.svg',
  },
  {
    title: 'End-to-End Agency OS',
    description: 'Unify contract sign-offs, asset storage, and client approvals in one pipeline.',
    image: '/images/micro-services.svg',
  },
  {
    title: 'Collaborative Creative Hub',
    description: 'Connect your team and clients with real-time feedback and asset sharing.',
    image: '/images/activity-bar.svg',
  },
]

const features = [
  {
    id: 'feature-0',
    label: 'MHB • Dashboard',
    title: 'Unified creative project pipeline',
    description: 'Track multi-project timelines, control budgets, and streamline creative workflows from planning to post-production.',
    bullets: [
      'Multi-project schedule timeline and stage tracking across all active shoots.',
      'Comprehensive budget scoping, service day rates, and deliverable breakdowns.',
      'Integrated brand visual identities, mood direction, and color palette specs.',
      'Seamless transition into crew roster, legal contracts, pre-production, and live sync.',
    ],
    bg: '/images/bg-texture-teal.webp',
    mockup: '/images/mockup-dashboard.webp',
  },
  {
    id: 'feature-1',
    label: 'MHB • MDOC',
    title: 'Frictionless client agreements',
    description: 'Generate SOWs, collect e-signatures, and issue invoices with extreme speed. Stay in the creative flow and keep projects moving.',
    bullets: [
      'Instant e-signatures for clients and internal teams',
      '10x faster SOW creation with pre-built agency templates',
      'Automated team onboarding & agreement workflows',
      'Integrated invoicing linked directly to project milestones',
    ],
    bg: '/images/bg-texture-purple.webp',
    mockup: '/images/mockup-document.webp',
  },
  // {
  //   id: 'feature-2',
  //   label: 'MHB • MCOORDINATE',
  //   title: 'Real-time team & shoot coordination',
  //   description: 'Eliminate WhatsApp chaos and scattered chat threads. Keep production crews, project managers, and internal teams connected on set or in the office.',
  //   bullets: [
  //     'Project-channeled chat and video calls for focused feedback',
  //     'Live location tracking for on-set field crew logistics',
  //     'Direct media streaming straight to MMedia workflows',
  //     'Automated real-time file sync with MDrive storage',
  //   ],
  //   bg: '/images/bg-texture-teal.webp',
  //   mockup: '/images/mockup-stream.webp',
  // },
  {
    id: 'feature-3',
    label: 'MHB • MSYNC',
    title: 'Live stream & media sync',
    description: 'Eliminate manual file transfers and broken links. Keep raw footage, project assets, and team updates synchronized across your entire production pipeline.',
    bullets: [
      'Instant background syncing directly to MDrive storage',
      'Continuous asset handoff from field crews to editing suites',
      'Automated media streaming and pre-set edit sync for MMedia',
      'Real-time state updates across team and client dashboards',
    ],
    bg: '/images/bg-texture-green.webp',
    mockup: '/images/mockup-stream.webp',
  },
  {
    id: 'feature-4',
    label: 'MHB • MDRIVE',
    title: 'Unified media storage & distribution',
    description: 'Organize raw production files, control client access, and store heavy media assets without storage limits or tier penalties.',
    bullets: [
      'Unified cloud storage for high-res video, audio, and photo assets',
      'Access-controlled distribution links for secure client handoffs',
      'Smart media organization built directly into project channels',
      'Native file sync with MSync and MMedia review tools',
    ],
    bg: '/images/bg-texture-orange.webp',
    mockup: '/images/mockup-media.webp',
  },
]

const pricingCards = [
  {
    label: 'INDIVIDUAL',
    title: 'For Solo Creators',
    description: 'For independent creators freelancers solo designers',
    price: '₹499',
    buttonText: 'Get Started',
    features: [
      { text: '1 Core Workspace Owner', icon: 'local:person' },
      { text: 'Simple Project Sharing', icon: 'local:chat' },
      { text: 'Fixed Standard Pipeline', icon: 'local:flow' },
      { text: 'Self-Serve Onboarding', icon: 'local:briefcase' },
    ],
    isRecommended: false,
  },
  {
    label: 'ENTERPRISE',
    title: 'For Studios',
    description: 'For agencies production houses and creative studios',
    price: '₹999',
    buttonText: 'Upgrade to Enterprise',
    features: [
      { text: 'Multi-Seat Core Team Access', icon: 'local:people' },
      { text: 'Detailed Project Sharing with Approvals', icon: 'local:approved' },
      { text: 'Fixed Standard Pipeline + Automated Integration', icon: 'local:branch' },
      { text: 'Automated Integrations', icon: 'local:link' },
      { text: 'Dedicated White-Glove Data Migration', icon: 'local:upload' },
    ],
    isRecommended: true,
  },
]

const footerLinks = [
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Cancellation', to: '/cancellation' },
  { label: 'License', to: '/license' },
]
</script>

<template>
  <div class="min-h-screen">
    <main class="mx-auto flex min-h-screen w-full max-w-7xl flex-col border-x border-light-500">
      <header class="sticky top-0 z-50 flex items-center justify-between border-b border-light-500 px-6 py-6 backdrop-blur-md md:px-12">
        <NuxtLink to="/" class="flex items-center gap-3" aria-label="Modest Human Brands Home">
          <NuxtIcon name="local:logo" class="text-[32px] md:text-[48px]" />
          <span class="hidden text-lg md:inline">Modest Human Brands</span>
        </NuxtLink>
        <div class="flex items-center gap-4">
          <NuxtLink
            v-for="link in socialLinks"
            :key="link.alt"
            external
            :href="link.to"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="link.alt"
            class="flex size-10 items-center justify-center rounded-full bg-white/5 transition hover:bg-white/10">
            <NuxtIcon :name="link.icon" class="text-xl" />
          </NuxtLink>
        </div>
      </header>

      <section class="relative border-b border-light-500 pt-8 text-center md:pt-16">
        <div class="relative z-10 flex flex-col items-center">
          <div class="mb-2 flex items-center justify-center">
            <NuxtIcon name="local:logo" class="text-[48px]" />
          </div>

          <h1 class="mb-4 text-2xl md:text-5xl">
            The Project <br />
            Management <span class="text-accent-500">Software</span>
          </h1>

          <p class="mb-8 w-4/5 text-base font-regular text-light-400 md:text-lg">Manage your projects, media assets, and client approvals with one tool.</p>

          <NuxtLink to="/waitlist" class="rounded-lg border border-accent-500 px-5 py-2 text-base shadow-xl shadow-white/10 transition-transform hover:scale-105"> Get Started </NuxtLink>

          <div class="mt-8 aspect-video w-full overflow-hidden bg-transparent">
            <video :src="'/videos/hero.mp4'" class="h-full w-full object-cover" autoplay muted loop playsinline disablePictureInPicture />
          </div>
        </div>
      </section>

      <section class="grid divide-y divide-light-500/10 border-b border-light-500 md:grid-cols-3 md:divide-x md:divide-y-0">
        <LandingSubHeroCard v-for="item in subHeroFeatures" :key="item.title" :title="item.title" :description="item.description" :image="item.image" />
      </section>

      <section class="border-b border-light-500">
        <div class="aspect-video w-full overflow-hidden">
          <img src="/images/hero-image-1.webp" alt="" class="w-full object-cover" loading="lazy" />
        </div>
      </section>

      <section class="flex flex-col">
        <LandingFeatureCard
          v-for="feature in features"
          :key="feature.id"
          :label="feature.label"
          :title="feature.title"
          :description="feature.description"
          :bullets="feature.bullets"
          :bg="feature.bg"
          :mockup="feature.mockup" />
      </section>

      <section class="border-b border-light-500 px-6 py-10 md:px-12">
        <span class="text-md mx-auto mb-8 block w-fit rounded-full bg-dark-600 px-6 py-1.5 text-center"> Pricing </span>

        <div class="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <LandingPricingCard v-for="card in pricingCards" :key="card.label" v-bind="card" />
        </div>
      </section>

      <section class="border-b border-light-500">
        <!-- <div class="relative flex min-h-96 flex-col items-center justify-center overflow-hidden text-center">
          <img src="/images/bg-texture-blue-purple.webp" class="absolute inset-0 h-full w-full object-cover" alt=""
            loading="lazy" />

          <div class="relative z-10 p-6 md:p-8">
            <h2 class="mb-10 text-lg md:text-3xl">
              Take your team's productivity to the next <br class="hidden md:block" />
              level with Modest Human Brands
            </h2>

            <NuxtLink to="/waitlist"
              class="rounded-lg bg-white px-5 py-2 text-base text-black shadow-xl shadow-white/10 transition-transform hover:scale-105">
              Get Started </NuxtLink>
          </div>
        </div> -->
        <div class="relative flex min-h-96 flex-col items-center justify-end overflow-hidden text-center">
          <img src="/images/workflow-pipeline.png" class="absolute inset-0 h-full w-full object-cover" alt="" loading="lazy" />

          <div class="relative z-10 p-6 md:p-8">
            <NuxtLink to="/waitlist" class="rounded-lg bg-accent-500 px-5 py-2 text-base text-white shadow shadow-black transition-transform hover:scale-105"> Get Started </NuxtLink>
          </div>
        </div>
      </section>

      <footer class="bg-dark-500/20 pb-8 pt-12">
        <nav class="mb-16 flex flex-col gap-5 px-6 md:px-12">
          <NuxtLink v-for="link in footerLinks" :key="link.label" :to="link.to" class="w-fit text-base font-semi-bold opacity-80 transition-opacity hover:opacity-100">
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="border-t border-light-500 pt-6">
          <div class="px-6 text-sm font-light md:px-12">© 2026 Modest Human Brands LLP</div>
        </div>
      </footer>
    </main>
  </div>
</template>
