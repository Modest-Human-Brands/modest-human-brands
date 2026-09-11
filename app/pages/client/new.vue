<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const router = useRouter()
const isCreating = ref(false)
const errorMessage = ref('')

const form = reactive({
  name: '',
  company: '',
  type: 'Client',
  status: 'Active',
  email: '',
  phone: '',
  pocName: '',
  pocEmail: '',
  pocPhone: '',
  address: '',
})

async function handleCreateClient() {
  if (!form.name.trim()) {
    errorMessage.value = 'Client or Brand Name is required.'
    return
  }

  isCreating.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/client', {
      method: 'POST',
      body: form,
    })

    await navigateTo('/client')
  } catch (error) {
    console.error('[Client] Failed to create client:', error)
    errorMessage.value = error?.data?.statusMessage || 'Failed to create client. Please try again.'
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <main class="flex size-full justify-center overflow-y-auto bg-dark-400 p-4 md:p-8">
    <div class="w-full max-w-2xl pb-16">
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-1">
        <h2 class="text-2xl font-bold tracking-tight text-white">Add New Client</h2>
        <p class="text-sm text-light-500">Create and register a client or brand contact into your workspace.</p>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="handleCreateClient">
        <!-- Client / Brand Details -->
        <FormField v-model="form.name" label="Client or Brand Name" schema-type="text" :required="true" :error-message="errorMessage && !form.name ? errorMessage : undefined" />

        <FormField v-model="form.company" label="Company / Legal Entity" schema-type="text" :required="false" />

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField v-model="form.type" label="Type" schema-type="enum:Client,Brand,Vendor,Partner" />

          <FormField v-model="form.status" label="Status" schema-type="enum:Active,Inactive,Researched,External Contact" />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField v-model="form.email" label="Company Email" schema-type="email" :required="false" />

          <FormField v-model="form.phone" label="Phone Number" schema-type="text" :required="false" />
        </div>

        <FormField v-model="form.address" label="Address / Location" schema-type="text" :required="false" />

        <!-- Point of Contact Details -->
        <div class="pt-2">
          <h3 class="mb-3 text-base font-semi-bold text-white">Point of Contact</h3>

          <div class="flex flex-col gap-4">
            <FormField v-model="form.pocName" label="Contact Person Name" schema-type="text" :required="false" />

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField v-model="form.pocEmail" label="Contact Person Email" schema-type="email" :required="false" />

              <FormField v-model="form.pocPhone" label="Contact Person Phone" schema-type="text" :required="false" />
            </div>
          </div>
        </div>

        <!-- Error Feedback -->
        <p v-if="errorMessage" class="text-sm font-semi-bold text-alert-500">
          {{ errorMessage }}
        </p>

        <!-- Form Actions -->
        <div class="mt-4 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button type="button" class="rounded-xl px-5 py-2.5 text-sm text-light-500 transition-colors hover:text-white" @click="router.back()">Cancel</button>
          <button
            type="submit"
            :disabled="isCreating || !form.name.trim()"
            class="flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-semi-bold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50">
            <NuxtIcon v-if="isCreating" name="local:loader" class="animate-spin text-base" />
            {{ isCreating ? 'Creating Client...' : 'Create Client' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
