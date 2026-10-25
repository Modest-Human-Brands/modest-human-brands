<script setup lang="ts">
// Renders any slice of a site's `data` payload: text, toggles, nested groups and card lists
defineOptions({ name: 'SiteContentNode' })

const props = defineProps<{
  modelValue: unknown
  label?: string
  name?: string
  schema?: SiteSchemaNode
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const inputClass = 'w-full rounded-lg border border-dark-400 bg-dark-500 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-accent-500'

const isObject = computed(() => props.modelValue !== null && typeof props.modelValue === 'object' && !Array.isArray(props.modelValue))
const isLong = computed(() => typeof props.modelValue === 'string' && (props.modelValue.length > 60 || ['body', 'description', 'subtitle'].includes(props.name ?? '')))

function setKey(key: string, value: unknown) {
  emit('update:modelValue', { ...(props.modelValue as Record<string, unknown>), [key]: value })
}

function setItem(index: number, value: unknown) {
  const next = [...(props.modelValue as unknown[])]
  next[index] = value
  emit('update:modelValue', next)
}

function blank(value: unknown): unknown {
  if (typeof value === 'string') return ''
  if (typeof value === 'boolean') return true
  if (typeof value === 'number') return 0
  if (Array.isArray(value)) return []
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, blank(child)]))
  return ''
}

const itemCount = computed(() => (Array.isArray(props.modelValue) ? props.modelValue.length : 0))
const canAdd = computed(() => props.schema?.maxItems === undefined || itemCount.value < props.schema.maxItems)
const canRemove = computed(() => itemCount.value > (props.schema?.minItems ?? 0))

function addItem() {
  const list = props.modelValue as unknown[]
  emit('update:modelValue', [...list, blank(list.at(-1) ?? '')])
}

function removeItem(index: number) {
  emit(
    'update:modelValue',
    (props.modelValue as unknown[]).filter((_, i) => i !== index)
  )
}
</script>

<template>
  <label v-if="typeof modelValue === 'boolean'" class="flex items-center gap-2 text-sm text-light-400">
    <input type="checkbox" :checked="modelValue" class="size-4 accent-accent-500" @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)" />
    {{ label }}
  </label>

  <div v-else-if="typeof modelValue === 'string' || typeof modelValue === 'number'" class="flex flex-col gap-1">
    <span v-if="label" class="text-xs font-semi-bold text-light-500">{{ label }}</span>
    <textarea v-if="isLong" :value="modelValue" rows="3" :class="inputClass" @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" />
    <input
      v-else
      :value="modelValue"
      :type="typeof modelValue === 'number' ? 'number' : 'text'"
      :class="inputClass"
      @input="emit('update:modelValue', typeof modelValue === 'number' ? Number(($event.target as HTMLInputElement).value) : ($event.target as HTMLInputElement).value)" />
  </div>

  <div v-else-if="Array.isArray(modelValue)" class="flex flex-col gap-2">
    <span v-if="label" class="text-xs font-semi-bold text-light-500"
      >{{ label }}<template v-if="schema?.maxItems"> ({{ itemCount }}/{{ schema.maxItems }})</template></span
    >
    <div v-for="(item, index) in modelValue" :key="index" class="flex items-start gap-2 rounded-lg border border-dark-400 p-3">
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <SiteContentNode :model-value="item" :schema="schema?.items" @update:model-value="setItem(index, $event)" />
      </div>
      <button
        type="button"
        :disabled="!canRemove"
        class="shrink-0 text-xs text-light-500 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        @click="removeItem(index)">
        Remove
      </button>
    </div>
    <button
      type="button"
      :disabled="!canAdd"
      class="hover:text-accent-300 self-start text-xs font-semi-bold text-accent-400 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      @click="addItem">
      + Add
    </button>
  </div>

  <div v-else-if="isObject" class="flex flex-col gap-3">
    <span v-if="label" class="text-xs font-semi-bold uppercase tracking-wider text-light-500">{{ label }}</span>
    <SiteContentNode
      v-for="(value, key) in modelValue as Record<string, unknown>"
      :key="key"
      :model-value="value"
      :name="String(key)"
      :label="formatKeyToLabel(String(key))"
      :schema="schema?.properties?.[String(key)]"
      @update:model-value="setKey(String(key), $event)" />
  </div>
</template>
