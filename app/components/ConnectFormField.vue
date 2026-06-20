<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  schemaType: string
  modelValue: number | string | boolean | (number | string | boolean)[]
  errorMessage?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string | boolean | (number | string | boolean)[]): void
}>()

const isMarkdown = computed(() => props.schemaType.toLowerCase().includes('markdown') || props.schemaType === 'textarea')
const isArray = computed(() => props.schemaType === 'array<string>')
const isNumber = computed(() => props.schemaType === 'number')
const isBoolean = computed(() => props.schemaType === 'boolean')
const isDate = computed(() => props.schemaType === 'date')
const isEmail = computed(() => props.schemaType === 'email')

const inputType = computed(() => {
  if (isNumber.value) return 'number'
  if (isDate.value) return 'date'
  if (isEmail.value) return 'email'
  return 'text'
})

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
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
  const newArray = Array.isArray(props.modelValue) ? [...props.modelValue] : ([] as (number | string | boolean)[])
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
</script>

<template>
  <div class="group flex flex-col rounded-2xl border border-dark-400 bg-dark-500/50 p-5 shadow-sm transition-colors hover:border-dark-400">
    <h3 class="font-semibold mb-1 text-lg capitalize text-white">{{ label }}</h3>

    <p v-if="isArray" class="mb-4 text-sm text-light-500">(Respondents can add multiple items)</p>
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
        <button type="button" class="font-semibold text-blue-400 hover:text-blue-300 mt-1 flex w-fit items-center gap-2 text-sm transition-colors" @click="addArrayItem">
          <NuxtIcon name="local:plus" /> Add Item
        </button>
      </div>

      <label v-else-if="isBoolean" class="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dark-400 bg-dark-500 px-4 py-3 transition-colors hover:bg-dark-400">
        <input type="checkbox" :checked="modelValue as boolean" class="accent-blue-500 size-5 cursor-pointer" @change="onCheckboxChange" />
        <span class="font-semibold text-sm text-white">{{ label }}</span>
      </label>

      <input
        v-else
        :type="inputType"
        :value="modelValue"
        :placeholder="isDate ? '' : 'Enter data'"
        class="w-full rounded-xl border border-dark-400 bg-dark-500 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-light-500/50 focus:border-white focus:bg-dark-400"
        required
        @input="onInput" />
    </div>

    <span v-if="errorMessage" class="font-semibold mt-2 text-xs text-alert-500">{{ errorMessage }}</span>
  </div>
</template>
