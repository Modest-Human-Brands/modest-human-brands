<script setup lang="ts">
import type * as z from 'zod'

definePageMeta({
  middleware: ['guest'],
})

type UserFormData = z.infer<typeof userFormSchema>
type OrganizationFormData = z.infer<typeof organizationFormSchema>

const { r$ } = useRegleSchema(
  {
    name: '',
    dob: '',
    gender: 'male',
    phone: '',
    organizationId: '',
  },
  userFormSchema
)

const { r$: orgR$ } = useRegleSchema(
  {
    name: '',
    foundedYear: new Date().getFullYear(),
    invites: [],
  },
  organizationFormSchema
)

const isCreatingOrg = computed(() => r$.$value.organizationId === 'create-new')
const inviteEmail = ref('')

const { data: organizations } = useAPI('/api/organization', {
  method: 'GET',
})

function showError(field: keyof UserFormData) {
  return r$[field].$dirty && r$[field].$error
}

function showOrgError(field: keyof OrganizationFormData) {
  return orgR$[field].$dirty && orgR$[field].$error
}

function addInvite() {
  if (inviteEmail.value && inviteEmail.value.includes('@')) {
    orgR$.$value.invites = [...(orgR$.$value.invites || []), inviteEmail.value]
    inviteEmail.value = ''
  }
}

function removeInvite(index: number) {
  orgR$.$value.invites = orgR$.$value.invites?.filter((_, i) => i !== index)
}

const { status, execute } = useAPI('/api/user', {
  method: 'POST',
  body: computed(() => ({
    ...r$.$value,
    ...(isCreatingOrg.value && { organization: orgR$.$value }),
  })),
  immediate: false,
  watch: false,
})

async function onSubmit() {
  const { valid } = await r$.$validate()

  if (isCreatingOrg.value) {
    const { valid: orgValid } = await orgR$.$validate()
    if (!orgValid) return
  }

  if (!valid || status.value === 'pending') return

  await execute()

  if (status.value === 'success') {
    await navigateTo('/dashboard')
  }
}
</script>

<template>
  <main class="flex min-h-screen w-full items-center justify-center p-5">
    <section class="flex w-full max-w-2xl flex-col gap-6 rounded-2xl bg-dark-500 p-6 shadow-xl ring-1 ring-dark-600" aria-labelledby="signup-heading">
      <header>
        <h1 id="signup-heading" class="text-xl text-white">Sign up</h1>
        <p class="mt-1 text-light-600">Fill out the form to apply as a user</p>
      </header>
      <form class="flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Name -->
          <div class="flex flex-col gap-3">
            <label for="name" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Full name</label>
            <input
              id="name"
              v-model="r$.$value.name"
              type="text"
              autocomplete="name"
              placeholder="Your full name"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
              :aria-invalid="showError('name') ? 'true' : 'false'" />
            <p v-if="showError('name')" class="text-xs text-alert-500">{{ r$.name.$errors[0] }}</p>
          </div>
          <!-- DOB -->
          <div class="flex flex-col gap-3">
            <label for="dob" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Date of birth</label>
            <input
              id="dob"
              v-model="r$.$value.dob"
              type="date"
              placeholder="YYYY-MM-DD"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
              :aria-invalid="showError('dob') ? 'true' : 'false'" />
            <p v-if="showError('dob')" class="text-xs text-alert-500">{{ r$.dob.$errors[0] }}</p>
          </div>
          <!-- Gender -->
          <div class="flex flex-col gap-3">
            <label class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Gender</label>
            <div class="mt-2 flex gap-3">
              <label class="inline-flex items-center gap-2">
                <input v-model="r$.$value.gender" type="radio" value="male" />
                <span class="text-sm">Male</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input v-model="r$.$value.gender" type="radio" value="female" />
                <span class="text-sm">Female</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input v-model="r$.$value.gender" type="radio" value="other" />
                <span class="text-sm">Other</span>
              </label>
            </div>
            <p v-if="showError('gender')" class="text-xs text-alert-500">{{ r$.gender.$errors[0] }}</p>
          </div>
          <!-- Phone -->
          <div class="flex flex-col gap-3">
            <label for="phone" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Phone</label>
            <input
              id="phone"
              v-model="r$.$value.phone"
              type="tel"
              inputmode="tel"
              placeholder="9876543210"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
              :aria-invalid="showError('phone') ? 'true' : 'false'" />
            <p v-if="showError('phone')" class="text-xs text-alert-500">{{ r$.phone.$errors[0] }}</p>
          </div>
          <!-- Organization -->
          <div class="col-span-full flex flex-col gap-3">
            <label for="organization" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']"> Organization </label>
            <div class="relative">
              <select
                id="organization"
                v-model="r$.$value.organizationId"
                class="text-slate-200 w-full appearance-none rounded-lg bg-dark-500 px-4 py-3 pr-10 ring-2 ring-dark-600 transition focus:outline-none focus:ring-2 focus:ring-primary-400"
                :class="showError('organizationId') ? 'ring-alert-500' : 'ring-dark-600'"
                :aria-invalid="showError('organizationId') ? 'true' : 'false'">
                <option value="" disabled class="bg-dark-500 text-white/60">Select an organization</option>
                <option v-for="org in organizations" :key="org.id" :value="org.id" class="bg-dark-500 text-white">
                  {{ org.name }}
                </option>
                <option value="create-new" class="bg-dark-500 text-primary-400">+ Create new organization</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <NuxtIcon name="mdi:chevron-down" class="text-xl text-white/60" />
              </div>
            </div>
            <p v-if="showError('organizationId')" class="text-xs text-alert-500">
              {{ r$.organizationId.$errors[0] }}
            </p>
          </div>
          <!-- Organization Creation (Notion-style) -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[600px]"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 max-h-[600px]"
            leave-to-class="opacity-0 max-h-0">
            <div v-if="isCreatingOrg" class="col-span-full flex flex-col gap-5">
              <!-- Organization Name -->
              <div class="flex flex-col gap-3">
                <label for="org-name" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']"> Organization name </label>
                <input
                  id="org-name"
                  v-model="orgR$.$value.name"
                  type="text"
                  placeholder="Acme Corp"
                  class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
                  :aria-invalid="showOrgError('name') ? 'true' : 'false'" />
                <p v-if="showOrgError('name')" class="text-xs text-alert-500">
                  {{ orgR$.name.$errors[0] }}
                </p>
              </div>
              <!-- Founded Year -->
              <div class="flex flex-col gap-3">
                <label for="founded-year" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']"> Founded year </label>
                <input
                  id="founded-year"
                  v-model="orgR$.$value.foundedYear"
                  type="number"
                  min="1900"
                  :max="new Date().getFullYear()"
                  placeholder="2020"
                  class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
                  :aria-invalid="showOrgError('foundedYear') ? 'true' : 'false'" />
                <p v-if="showOrgError('foundedYear')" class="text-xs text-alert-500">
                  {{ orgR$.foundedYear.$errors[0] }}
                </p>
              </div>
              <!-- Invite Members -->
              <div class="flex flex-col gap-3">
                <label for="invite-email" class="font-medium text-slate-300 text-sm">
                  Invite team members
                  <span class="ml-1 text-xs text-white/60">(optional)</span>
                </label>

                <div class="flex gap-2">
                  <input
                    id="invite-email"
                    v-model="inviteEmail"
                    type="email"
                    placeholder="colleague@example.com"
                    class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
                    @keydown.enter.prevent="addInvite" />
                  <button
                    type="button"
                    class="font-medium rounded-lg bg-primary-400/10 px-4 py-2.5 text-sm text-primary-400 ring-2 ring-primary-400/30 transition hover:bg-primary-400/20"
                    @click="addInvite">
                    Add
                  </button>
                </div>

                <div v-if="orgR$.$value.invites && orgR$.$value.invites.length > 0" class="mt-2 flex flex-wrap gap-2">
                  <div
                    v-for="(email, index) in orgR$.$value.invites"
                    :key="email"
                    class="group flex items-center gap-2 rounded-lg bg-primary-400/10 px-3 py-1.5 text-sm text-primary-400 ring-1 ring-primary-400/30">
                    <span>{{ email }}</span>
                    <button type="button" class="text-primary-400/60 transition hover:text-alert-500" @click="removeInvite(index)">
                      <NuxtIcon name="mdi:close" class="text-base" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        <!-- Actions -->
        <button
          type="submit"
          :disabled="r$.$invalid"
          class="font-medium flex w-full items-center justify-center gap-1.5 rounded-lg py-3 text-base transition-all disabled:cursor-not-allowed disabled:opacity-60"
          :class="!r$.$invalid ? 'bg-white text-black' : 'bg-black text-white'">
          <NuxtIcon v-if="status === 'pending'" name="local:loader" class="text-[24px]" />Submit
        </button>
      </form>
    </section>
  </main>
</template>
