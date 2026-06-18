<script setup lang="ts">
const props = defineProps<{
  label: string
  schemaType: string
  modelValue: string | number | undefined
  errorMessage?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const inputType = computed(() => {
  if (props.schemaType === 'number') return 'number'
  return 'text'
})

const isMultiline = computed(() => props.schemaType === 'array<string>')

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  let val: string | number = target.value

  if (props.schemaType === 'number') {
    val = val === '' ? '' : Number(val)
  }

  emit('update:modelValue', val)
}
</script>

<template>
  <div class="hover:border-dark-300 mb-5 flex flex-col rounded-xl border border-dark-400 bg-dark-500 p-5 shadow-sm transition-colors">
    <h3 class="mb-1 text-lg font-bold capitalize text-white">{{ label.replace(/([A-Z])/g, ' $1').trim() }}</h3>

    <p v-if="schemaType === 'array<string>'" class="mb-4 text-sm text-light-500">(Respondents can select as many as they like, comma separated)</p>
    <p v-else class="mb-4 text-sm text-light-500">(Required field)</p>

    <div class="relative flex w-full">
      <textarea
        v-if="isMultiline"
        :value="modelValue"
        placeholder="Respondent's answer"
        rows="2"
        class="w-full rounded-md border border-dark-400 bg-transparent px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-light-500/50 focus:border-white focus:bg-dark-400"
        @input="onInput"></textarea>

      <input
        v-else
        :type="inputType"
        :value="modelValue"
        placeholder="Respondent's answer"
        class="w-full rounded-md border border-dark-400 bg-transparent px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-light-500/50 focus:border-white focus:bg-dark-400"
        @input="onInput" />
    </div>

    <span v-if="errorMessage" class="mt-2 text-xs font-bold text-alert-500">{{ errorMessage }}</span>
  </div>
</template>
