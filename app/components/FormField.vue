<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
const props = defineProps<{
  label: string
  schemaType: string
  modelValue: any
  errorMessage?: string
  schemaBlueprint?: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const typeLower = computed(() => props.schemaType.toLowerCase())
const isMarkdown = computed(() => typeLower.value.includes('markdown') || typeLower.value === 'textarea')
const isArray = computed(() => typeLower.value === 'array<string>')
const isArrayOfObjects = computed(() => typeLower.value === 'array<object>')
const isNumber = computed(() => typeLower.value === 'number')
const isBoolean = computed(() => typeLower.value === 'boolean')
const isDate = computed(() => typeLower.value === 'date')
const isTime = computed(() => typeLower.value === 'time')
const isDateTime = computed(() => typeLower.value === 'datetime' || typeLower.value === 'datetime-local')
const isEmail = computed(() => typeLower.value === 'email')
const isSignature = computed(() => typeLower.value === 'signature')
const isEnum = computed(() => props.schemaType.startsWith('enum:'))

const enumOptions = computed(() => {
  if (!isEnum.value) return []
  return props.schemaType.split(':')[1]?.split(',') || []
})

const hasNativePicker = computed(() => isDate.value || isTime.value || isDateTime.value)

const inputType = computed(() => {
  if (isNumber.value) return 'number'
  if (isDate.value) return 'date'
  if (isTime.value) return 'time'
  if (isDateTime.value) return 'datetime-local'
  if (isEmail.value) return 'email'
  return 'text'
})

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  let val: string | number | boolean = target.value

  if (isNumber.value) {
    val = val === '' ? '' : Number(val)
  }

  emit('update:modelValue', val)
}

function onCheckboxChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}

function updateArrayItem(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const newArray = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  newArray[index] = target.value
  emit('update:modelValue', newArray)
}

function addArrayItem() {
  const newArray = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  newArray.push('')
  emit('update:modelValue', newArray)
}

function removeArrayItem(index: number) {
  const newArray = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  newArray.splice(index, 1)
  emit('update:modelValue', newArray)
}

function updateObjectItem(index: number, key: string, val: any) {
  const newArray = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  newArray[index] = { ...newArray[index], [key]: val }
  emit('update:modelValue', newArray)
}

function addBlueprintItem() {
  const newArray = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const newItem: Record<string, any> = {}
  if (props.schemaBlueprint) {
    for (const [k, t] of Object.entries(props.schemaBlueprint)) {
      newItem[k] = t === 'number' ? null : t === 'array<string>' ? [''] : ''
    }
  }
  newArray.push(newItem)
  emit('update:modelValue', newArray)
}

function formatKeyToLabel(key: string): string {
  if (!key) return ''
  const cleanKey = key.split('-').pop() || key
  const spaced = cleanKey.replace(/([A-Z])/g, ' $1').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    emit('update:modelValue', e.target?.result as string)
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="group flex flex-col rounded-2xl border border-dark-400 bg-dark-500/50 p-5 shadow-sm transition-colors hover:border-dark-400">
    <h3 class="font-semibold mb-1 text-lg capitalize text-white">{{ label }}</h3>

    <p v-if="isArray || isArrayOfObjects" class="mb-4 text-sm text-light-500">(Respondents can add multiple items)</p>
    <p v-else-if="isSignature" class="mb-4 text-sm text-light-500">(Please upload an image of your signature)</p>
    <p v-else class="mb-4 text-sm text-light-500">(Required field)</p>

    <div class="relative flex w-full">
      <textarea
        v-if="isMarkdown"
        :value="modelValue as string"
        placeholder="Enter content..."
        rows="4"
        class="w-full rounded-xl border border-dark-400 bg-dark-500 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-light-500/50 focus:border-white focus:bg-dark-400"
        required
        @input="onInput"></textarea>

      <div v-else-if="isArray" class="flex w-full flex-col gap-3">
        <div v-for="(item, index) in Array.isArray(modelValue) ? modelValue : []" :key="index" class="flex items-center gap-2">
          <input
            :value="item"
            type="text"
            placeholder="Enter item..."
            class="w-full rounded-xl border border-dark-400 bg-dark-500 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-light-500/50 focus:border-white focus:bg-dark-400"
            required
            @input="updateArrayItem(index, $event)" />
          <button
            type="button"
            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-dark-600 text-light-500 transition-colors hover:bg-dark-400 hover:text-alert-500"
            @click="removeArrayItem(index)">
            <NuxtIcon name="local:cross" />
          </button>
        </div>
        <button type="button" class="font-semibold mt-1 flex w-fit items-center gap-2 text-sm text-primary-400 transition-colors hover:text-primary-500" @click="addArrayItem">
          <NuxtIcon name="local:plus" /> Add Item
        </button>
      </div>

      <div v-else-if="isArrayOfObjects" class="flex w-full flex-col gap-6">
        <div v-for="(item, index) in Array.isArray(modelValue) ? modelValue : []" :key="index" class="relative flex flex-col gap-4 rounded-xl border border-dark-400 bg-dark-500/30 p-4">
          <div class="flex items-center justify-between border-b border-dark-400/50 pb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-light-500">Item {{ index + 1 }}</span>
            <button type="button" class="font-semibold text-xs text-alert-500 transition-colors hover:text-alert-400" @click="removeArrayItem(index)">Remove</button>
          </div>

          <FormField
            v-for="(subType, subKey) in schemaBlueprint"
            :key="String(subKey)"
            :label="formatKeyToLabel(String(subKey))"
            :schema-type="String(subType)"
            :model-value="item?.[String(subKey)]"
            @update:model-value="updateObjectItem(index, String(subKey), $event)" />
        </div>

        <button type="button" class="font-semibold flex w-fit items-center gap-2 text-sm text-primary-400 transition-colors hover:text-primary-500" @click="addBlueprintItem">
          <NuxtIcon name="local:plus" /> Add Item
        </button>
      </div>

      <label v-else-if="isBoolean" class="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dark-400 bg-dark-500 px-4 py-3 transition-colors hover:bg-dark-400">
        <input type="checkbox" :checked="modelValue as boolean" class="accent-blue-500 size-5 cursor-pointer" @change="onCheckboxChange" />
        <span class="font-semibold text-sm text-white">{{ label }}</span>
      </label>

      <div v-else-if="isSignature" class="flex w-full flex-col gap-2">
        <label
          v-if="!modelValue"
          class="border-dark-300 flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-dark-500/30 text-light-500 transition-colors hover:border-primary-500 hover:bg-primary-500/10 hover:text-primary-400">
          <div class="flex items-center gap-2">
            <NuxtIcon name="local:upload" class="text-xl" />
            <span class="text-xs font-bold uppercase tracking-wider">Upload Signature</span>
          </div>
          <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
        </label>
        <div v-else class="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-success-500/30 bg-success-500/10">
          <img :src="modelValue as string" class="h-full object-contain p-2" />
          <label class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-xs font-bold text-white opacity-0 transition-opacity hover:opacity-100">
            Change Signature
            <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
          </label>
        </div>
      </div>

      <div v-else-if="isEnum" class="relative w-full">
        <select
          :value="modelValue"
          class="w-full appearance-none rounded-xl border border-dark-400 bg-dark-500 px-4 py-3 pr-10 text-sm text-white outline-none transition-colors focus:border-white focus:bg-dark-400"
          required
          @change="onInput">
          <option value="" disabled :selected="!modelValue">Select an option</option>
          <option v-for="opt in enumOptions" :key="opt" :value="opt">
            {{ formatKeyToLabel(opt) }}
          </option>
        </select>
        <NuxtIcon name="local:chevron-bold" class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-light-500" />
      </div>

      <input
        v-else
        :type="inputType"
        :value="modelValue"
        :placeholder="hasNativePicker ? '' : 'Enter data'"
        class="w-full rounded-xl border border-dark-400 bg-dark-500 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-light-500/50 focus:border-white focus:bg-dark-400"
        required
        @input="onInput" />
    </div>

    <span v-if="errorMessage" class="font-semibold mt-2 text-xs text-alert-500">{{ errorMessage }}</span>
  </div>
</template>
