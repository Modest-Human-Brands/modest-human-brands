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

type Field = Exclude<keyof ProjectCrewMember, 'id'>

// Column widths follow the Figma Vendor Table (distance between column starts)
const columns: { key: Field; label: string; icon: string; width: string; type: 'text' | 'number' | 'status' }[] = [
  { key: 'name', label: 'Name', icon: 'local:person', width: 'min-w-[177px]', type: 'text' },
  { key: 'department', label: 'Department', icon: 'local:theater-mask', width: 'min-w-[193px]', type: 'text' },
  { key: 'role', label: 'Role', icon: 'local:theater-mask', width: 'min-w-[150px]', type: 'text' },
  { key: 'status', label: 'Status', icon: 'local:status', width: 'min-w-[150px]', type: 'status' },
  { key: 'rate', label: 'Rate', icon: 'local:wallet', width: 'min-w-[102px]', type: 'number' },
  { key: 'rateType', label: 'Rate Type', icon: 'local:wallet', width: 'min-w-[111px]', type: 'text' },
  { key: 'totalAgreedRate', label: 'Total Agreed Rate', icon: 'local:wallet', width: 'min-w-[198px]', type: 'number' },
  { key: 'email', label: 'Email', icon: 'local:email', width: 'min-w-[200px]', type: 'text' },
  { key: 'phone', label: 'Phone', icon: 'local:phone', width: 'min-w-[130px]', type: 'text' },
  { key: 'portfolioLink', label: 'Portfolio Link', icon: 'local:link', width: 'min-w-[160px]', type: 'text' },
  { key: 'location', label: 'Location', icon: 'local:map', width: 'min-w-[138px]', type: 'text' },
  { key: 'notes', label: 'Notes', icon: 'local:note', width: 'min-w-[200px]', type: 'text' },
]

// Chip colours from the Figma Vendor Table: 40% tinted pill, solid 12px dot
const statusStyles: Record<string, { badge: string; dot: string }> = {
  Hired: { badge: 'bg-info-400/40', dot: 'bg-info-500' },
  Negotiated: { badge: 'bg-warning-400/40', dot: 'bg-warning-400' },
  Contacted: { badge: 'bg-light-500/30', dot: 'bg-light-500' },
  Rejected: { badge: 'bg-alert-400/40', dot: 'bg-alert-500' },
}
const fallbackStyle = statusStyles.Contacted!

// The Notion Status options, plus any other status a member already has
const statusOptions = computed(() => [...new Set(['Contacted', 'Negotiated', 'Hired', ...crewMembers.value.map(({ status }) => status)])])
const departments = computed(() => [...new Set(crewMembers.value.map(({ department }) => department).filter(Boolean))])
const rateTypes = computed(() => [...new Set(['Day', 'Project', 'Hour', ...crewMembers.value.map(({ rateType }) => rateType).filter(Boolean)])])

const rowError = ref('')
const isAddingRow = ref(false)

function replaceMember(member: ProjectCrewMember) {
  crew.value = crew.value.map((existing) => (existing.id === member.id ? member : existing))
}

// A cell is saved when it loses focus or Enter is pressed: shown at once, put back if Notion refuses
async function saveCell(member: ProjectCrewMember, field: Field, raw: string) {
  const type = columns.find(({ key }) => key === field)!.type
  const value = type === 'number' ? (raw.trim() === '' ? null : Number(raw)) : raw.trim()

  if (type === 'number' && value !== null && Number.isNaN(value)) return
  if ((value ?? 0) === (member[field] ?? (type === 'number' ? 0 : ''))) return

  rowError.value = ''
  replaceMember({ ...member, [field]: value ?? 0 })

  try {
    replaceMember(await $fetch<ProjectCrewMember>(`/api/project/${projectId}/crew/${member.id}`, { method: 'PATCH', body: { [field]: value } }))
  } catch {
    replaceMember(member)
    rowError.value = `Could not save ${columns.find(({ key }) => key === field)!.label.toLowerCase()} for ${member.name || 'this row'}. Check the value and try again.`
  }
}

// Like Notion, a new row appears empty at once and is filled in place
async function addRow() {
  if (isAddingRow.value) return

  isAddingRow.value = true
  rowError.value = ''

  try {
    const member = await $fetch<ProjectCrewMember>(`/api/project/${projectId}/crew`, { method: 'POST', body: {} })
    crew.value = [...crew.value, member]
    await nextTick()
    document.querySelector<HTMLInputElement>(`[data-crew="${member.id}"][data-field="name"]`)?.focus()
  } catch {
    rowError.value = 'Could not add a row. Try again.'
  } finally {
    isAddingRow.value = false
  }
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '0'
  return new Intl.NumberFormat('en-IN').format(Number(amount))
}

const cellClass = 'h-[25px] w-full rounded bg-transparent px-1 text-center text-sm text-white outline-none transition-colors placeholder:text-white/20 hover:bg-white/5 focus:bg-dark-600'
</script>

<template>
  <div class="flex min-h-0 grow flex-col overflow-hidden lg:flex-row">
    <section class="scrollbar-hidden flex-1 space-y-6 overflow-y-auto p-4 md:space-y-8 md:p-8">
      <div v-if="pending" class="mx-auto max-w-6xl animate-pulse space-y-6">
        <div class="h-64 rounded-lg bg-dark-500" />
        <div class="h-64 rounded-lg bg-dark-500" />
      </div>

      <div v-else class="mx-auto max-w-6xl space-y-6 md:space-y-8">
        <!-- Crew List (Figma: Vendor Table) -->
        <div class="scrollbar-hidden flex flex-col gap-4 overflow-x-auto rounded-lg bg-dark-500 px-6 py-4">
          <h2 class="text-base text-white">Crew List</h2>
          <p v-if="rowError" class="text-sm text-alert-400">{{ rowError }}</p>

          <table class="w-full min-w-max border-collapse text-left text-sm text-white">
            <thead>
              <tr class="border-b border-white">
                <th v-for="column in columns" :key="column.key" class="whitespace-nowrap pb-1.5 pr-6 text-left font-regular" :class="column.width">
                  <span class="flex items-center gap-2">
                    <NuxtIcon :name="column.icon" class="shrink-0 text-base" />
                    {{ column.label }}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in crewMembers" :key="member.id" class="border-b border-white/20">
                <td v-for="column in columns" :key="column.key" class="py-1.5 pr-6" :class="column.width">
                  <div v-if="column.type === 'status'" class="relative flex justify-center">
                    <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm" :class="(statusStyles[member.status] ?? fallbackStyle).badge">
                      <span class="size-3 rounded-full" :class="(statusStyles[member.status] ?? fallbackStyle).dot" />
                      {{ member.status }}
                    </span>
                    <select
                      :value="member.status"
                      :data-crew="member.id"
                      data-field="status"
                      aria-label="Status"
                      class="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
                      @change="saveCell(member, 'status', ($event.target as HTMLSelectElement).value)">
                      <option v-for="option in statusOptions" :key="option" :value="option" class="bg-dark-500">{{ option }}</option>
                    </select>
                  </div>
                  <input
                    v-else
                    :value="member[column.key] ?? ''"
                    :type="column.type === 'number' ? 'number' : 'text'"
                    :data-crew="member.id"
                    :data-field="column.key"
                    :aria-label="column.label"
                    :list="column.key === 'department' ? 'crew-departments' : column.key === 'rateType' ? 'crew-rate-types' : undefined"
                    :class="[cellClass, column.key === 'name' ? '!text-left' : '']"
                    @change="saveCell(member, column.key, ($event.target as HTMLInputElement).value)"
                    @keydown.enter="($event.target as HTMLInputElement).blur()" />
                </td>
              </tr>
              <tr>
                <td :colspan="columns.length" class="py-1.5">
                  <button type="button" :disabled="isAddingRow" class="flex items-center gap-2 text-sm text-light-500 transition-colors hover:text-white disabled:opacity-50" @click="addRow">
                    <NuxtIcon name="local:plus" class="shrink-0 text-base" />
                    {{ isAddingRow ? 'Adding...' : 'New' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <datalist id="crew-departments">
            <option v-for="department in departments" :key="department" :value="department" />
          </datalist>
          <datalist id="crew-rate-types">
            <option v-for="rateType in rateTypes" :key="rateType" :value="rateType" />
          </datalist>
        </div>

        <!-- Hired Crew List (Figma: Vendor Table) -->
        <div class="scrollbar-hidden flex flex-col gap-4 overflow-x-auto rounded-lg bg-dark-500 px-6 py-4">
          <h2 class="text-base text-white">Hired Crew List</h2>
          <table class="w-full min-w-max border-collapse text-left text-sm text-white">
            <thead>
              <tr class="border-b border-white">
                <th v-for="column in columns.slice(0, 5)" :key="column.key" class="whitespace-nowrap pb-1.5 pr-6 text-left font-regular" :class="column.width">
                  <span class="flex items-center gap-2">
                    <NuxtIcon :name="column.icon" class="shrink-0 text-base" />
                    {{ column.label }}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in hiredCrewMembers" :key="member.id" class="border-b border-white/20 last:border-b-0">
                <td class="whitespace-nowrap py-1.5 pr-6">{{ member.name || 'Untitled' }}</td>
                <td class="whitespace-nowrap px-1 py-1.5 pr-6 text-center">{{ member.department }}</td>
                <td class="whitespace-nowrap px-1 py-1.5 pr-6 text-center">{{ member.role }}</td>
                <td class="py-1.5 pr-6 text-center">
                  <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm" :class="(statusStyles[member.status] ?? fallbackStyle).badge">
                    <span class="size-3 rounded-full" :class="(statusStyles[member.status] ?? fallbackStyle).dot" />
                    {{ member.status }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-1 py-1.5 pr-6 text-center">{{ formatCurrency(member.rate) }}</td>
              </tr>
              <tr v-if="!hiredCrewMembers.length">
                <td colspan="5" class="py-1.5 text-light-500">No one hired yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>
