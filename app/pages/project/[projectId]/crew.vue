<script setup lang="ts">
definePageMeta({
  layout: 'project',
  middleware: ['auth'],
})

const route = useRoute()
const projectId = route.params.projectId as string

const { data: crew, pending } = await useFetch<ProjectCrewMember[]>(`/api/project/${projectId}/crew`, { default: () => [] })
const crewMembers = computed(() => crew.value)
const hiredCrewMembers = computed(() => crewMembers.value.filter((member) => member.status === 'Hired'))

const statusStyles: Record<string, { badge: string; dot: string }> = {
  Hired: { badge: 'bg-info-500/20 text-info-400', dot: 'bg-info-400' },
  Negotiated: { badge: 'bg-warning-500/20 text-warning-400', dot: 'bg-warning-400' },
  Contacted: { badge: 'bg-light-500/10 text-light-400', dot: 'bg-light-500' },
  Rejected: { badge: 'bg-alert-500/20 text-alert-400', dot: 'bg-alert-400' },
}
const fallbackStyle = statusStyles.Contacted!

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '0'
  return new Intl.NumberFormat('en-IN').format(Number(amount))
}

function maskEmail(email: string | undefined): string {
  if (!email) return ''
  const [user, domain] = email.split('@')
  if (!domain) return email
  return `${user?.slice(0, 2)}***@${domain}`
}
</script>

<template>
  <div class="flex min-h-0 grow flex-col overflow-hidden lg:flex-row">
    <section class="scrollbar-hidden flex-1 space-y-6 overflow-y-auto p-4 md:space-y-8 md:p-8">
      <div v-if="pending" class="mx-auto max-w-6xl animate-pulse space-y-6">
        <div class="h-64 rounded-xl bg-dark-500" />
        <div class="h-64 rounded-xl bg-dark-500" />
      </div>

      <div v-else class="mx-auto max-w-6xl space-y-8">
        <!-- Crew List -->
        <div class="rounded-xl bg-dark-500 p-4 md:p-6">
          <h2 class="mb-4 text-lg font-semi-bold text-white">Crew List</h2>
          <p v-if="!crewMembers.length" class="py-6 text-center text-sm text-light-500">No crew linked to this project yet.</p>

          <div class="scrollbar-hidden overflow-x-auto">
            <table v-if="crewMembers.length" class="w-full min-w-[960px] border-collapse text-left text-sm text-light-500">
              <thead>
                <tr class="border-b border-dark-600 text-xs uppercase tracking-wide text-light-400">
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:user" class="shrink-0 text-base" />
                      Name
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:mask-happy" class="shrink-0 text-base" />
                      Department
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:mask-happy" class="shrink-0 text-base" />
                      Role
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:sparkle" class="shrink-0 text-base" />
                      Status
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:wallet" class="shrink-0 text-base" />
                      Rate
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:wallet" class="shrink-0 text-base" />
                      Rate Type
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:wallet" class="shrink-0 text-base" />
                      Total Agreed Rate
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:at" class="shrink-0 text-base" />
                      Email
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:phone" class="shrink-0 text-base" />
                      Phone
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:link" class="shrink-0 text-base" />
                      Portfolio Link
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:map-pin" class="shrink-0 text-base" />
                      Location
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:note" class="shrink-0 text-base" />
                      Notes
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in crewMembers" :key="member.id" class="border-b border-dark-600/60 last:border-b-0">
                  <td class="whitespace-nowrap py-3 pr-4 text-white">{{ member.name }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ member.department }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ member.role }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">
                    <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semi-bold" :class="(statusStyles[member.status] ?? fallbackStyle).badge">
                      <span class="size-2 rounded-full" :class="(statusStyles[member.status] ?? fallbackStyle).dot" />
                      {{ member.status }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ formatCurrency(member.rate) }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ member.rateType }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ formatCurrency(member.totalAgreedRate) }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ maskEmail(member.email) }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ member.phone || '—' }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ member.portfolioLink || '—' }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ member.location || '—' }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ member.notes || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Hired Crew List -->
        <div class="rounded-xl bg-dark-500 p-4 md:p-6">
          <h2 class="mb-4 text-lg font-semi-bold text-white">Hired Crew List</h2>

          <div class="scrollbar-hidden overflow-x-auto">
            <table class="w-full min-w-[560px] border-collapse text-left text-sm text-light-500">
              <thead>
                <tr class="border-b border-dark-600 text-xs uppercase tracking-wide text-light-400">
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:user" class="shrink-0 text-base" />
                      Name
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:mask-happy" class="shrink-0 text-base" />
                      Department
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:mask-happy" class="shrink-0 text-base" />
                      Role
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:sparkle" class="shrink-0 text-base" />
                      Status
                    </span>
                  </th>
                  <th class="whitespace-nowrap py-3 pr-4 font-regular">
                    <span class="flex items-center gap-2">
                      <NuxtIcon name="ph:wallet" class="shrink-0 text-base" />
                      Rate
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in hiredCrewMembers" :key="member.id" class="border-b border-dark-600/60 last:border-b-0">
                  <td class="whitespace-nowrap py-3 pr-4 text-white">{{ member.name }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ member.department }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ member.role }}</td>
                  <td class="whitespace-nowrap py-3 pr-4">
                    <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semi-bold" :class="(statusStyles[member.status] ?? fallbackStyle).badge">
                      <span class="size-2 rounded-full" :class="(statusStyles[member.status] ?? fallbackStyle).dot" />
                      {{ member.status }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap py-3 pr-4">{{ formatCurrency(member.rate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
