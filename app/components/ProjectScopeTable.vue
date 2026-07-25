<script setup lang="ts">
import type { Directive } from 'vue'
import { useToggle } from '@vueuse/core'

export interface DeliverableItem {
  id?: string
  title?: string
  description?: string
  points?: string[]
  rate?: number
  quantity?: number
}

const props = withDefaults(
  defineProps<{
    modelValue?: DeliverableItem[]
    budget?: number
  }>(),
  {
    modelValue: () => [],
    budget: 0,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: DeliverableItem[]]
}>()

const [isAddingService, toggleAddService] = useToggle(false)
const newService = ref<DeliverableItem>({ title: '', description: '', rate: 0, quantity: 1 })
const editingCell = ref<{ row: number; col: string } | null>(null)

const vFocus: Directive<HTMLElement> = {
  mounted: (el) => el.focus(),
}

const calculatedSubtotal = computed(() => {
  return (props.modelValue || []).reduce((acc: number, item: DeliverableItem) => {
    const rate = Number(item.rate) || 0
    const qty = Number(item.quantity) || 1
    return acc + rate * qty
  }, 0)
})

const calculatedTotal = computed(() => {
  return props.budget || calculatedSubtotal.value
})

function formatCurrency(amount: number | string | undefined): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '0'
  return new Intl.NumberFormat('en-IN').format(Number(amount))
}

function startAddingService(): void {
  newService.value = { title: '', description: '', rate: 0, quantity: 1 }
  toggleAddService(true)
}

function commitNewService(): void {
  if (!isAddingService.value) return

  if (newService.value.title?.trim() !== '') {
    const points = newService.value.description?.trim() ? [newService.value.description.trim()] : []
    const updatedDeliverables: DeliverableItem[] = [
      ...(props.modelValue || []),
      {
        title: newService.value.title?.trim() || '',
        points,
        rate: Number(newService.value.rate) || 0,
        quantity: Number(newService.value.quantity) || 1,
      },
    ]
    emit('update:modelValue', updatedDeliverables)
  }
  toggleAddService(false)
}

function removeService(index: number): void {
  const updatedDeliverables = (props.modelValue || []).filter((_, i) => i !== index)
  emit('update:modelValue', updatedDeliverables)
}

function startEditing(row: number, col: string): void {
  editingCell.value = { row, col }
}

function stopEditing(): void {
  editingCell.value = null
  emit('update:modelValue', [...(props.modelValue || [])])
}

function getDescription(item: DeliverableItem): string {
  if (item.points && item.points.length > 0) return item.points[0] || ''
  return item.description || ''
}

function updateDescription(item: DeliverableItem, value: string): void {
  item.description = value
  item.points = value.trim() ? [value.trim()] : []
}

defineExpose({
  startAddingService,
})
</script>

<template>
  <div class="space-y-4 pt-4">
    <div class="scrollbar-hidden -ml-8 overflow-x-auto py-1 pl-8">
      <table class="w-full min-w-[640px] table-fixed border-collapse text-left">
        <thead>
          <tr class="border-b border-dark-600 text-sm font-regular text-light-500">
            <th class="w-[28%] pb-3 pr-4 text-left font-regular">Service</th>
            <th class="w-[40%] pb-3 pr-4 text-left font-regular">Description</th>
            <th class="w-[12%] pb-3 text-right font-regular">Day Rate</th>
            <th class="w-[8%] pb-3 text-right font-regular">Days</th>
            <th class="w-[12%] pb-3 text-right font-regular">Amount</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-dark-600/60 text-sm md:text-base">
          <tr v-for="(item, idx) in modelValue" :key="idx" class="group">
            <td class="relative h-[52px] py-3 pr-4 align-middle font-semi-bold text-white">
              <button
                type="button"
                class="absolute -left-6 top-1/2 -translate-y-1/2 p-1 text-light-500 opacity-0 transition-opacity hover:text-alert-500 group-hover:opacity-100"
                title="Remove service"
                @click="removeService(idx)">
                <NuxtIcon name="local:grip" class="text-lg" />
              </button>
              <div v-if="editingCell?.row === idx && editingCell?.col === 'title'" class="w-full">
                <input
                  v-model="item.title"
                  v-focus
                  type="text"
                  class="h-[34px] w-full rounded bg-dark-400 px-2.5 font-semi-bold text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  @keydown.enter="stopEditing()"
                  @blur="stopEditing()" />
              </div>
              <div v-else class="flex h-[34px] w-full cursor-pointer items-center truncate rounded px-2 transition-colors hover:bg-white/5" @click="startEditing(idx, 'title')">
                <span class="truncate">{{ item.title || 'Untitled Service' }}</span>
              </div>
            </td>

            <td class="h-[52px] py-3 pr-4 align-middle text-light-400">
              <div v-if="editingCell?.row === idx && editingCell?.col === 'description'" class="w-full">
                <input
                  v-focus
                  :value="getDescription(item)"
                  type="text"
                  class="h-[34px] w-full rounded bg-dark-400 px-2.5 text-light-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  @input="updateDescription(item, ($event.target as HTMLInputElement).value)"
                  @keydown.enter="stopEditing()"
                  @blur="stopEditing()" />
              </div>
              <div v-else class="flex min-h-[34px] w-full cursor-pointer items-center rounded px-2 py-1 transition-colors hover:bg-white/5" @click="startEditing(idx, 'description')">
                <ul v-if="item.points && item.points.length" class="space-y-1">
                  <li v-for="(bullet, bIdx) in item.points" :key="bIdx" class="flex items-start gap-2">
                    <span class="shrink-0 text-light-500">•</span>
                    <span>{{ bullet }}</span>
                  </li>
                </ul>
                <span v-else-if="item.description">{{ item.description }}</span>
                <span v-else class="italic text-light-500">Click to add description...</span>
              </div>
            </td>

            <td class="h-[52px] py-3 text-right align-middle font-regular text-white">
              <div v-if="editingCell?.row === idx && editingCell?.col === 'rate'" class="w-full">
                <input
                  v-model.number="item.rate"
                  v-focus
                  type="number"
                  class="h-[34px] w-full rounded bg-dark-400 px-2 text-right font-regular text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  @keydown.enter="stopEditing()"
                  @blur="stopEditing()" />
              </div>
              <div v-else class="flex h-[34px] w-full cursor-pointer items-center justify-end rounded px-2 transition-colors hover:bg-white/5" @click="startEditing(idx, 'rate')">
                <span>{{ formatCurrency(item.rate) }}</span>
              </div>
            </td>

            <td class="h-[52px] py-3 text-right align-middle font-regular text-white">
              <div v-if="editingCell?.row === idx && editingCell?.col === 'quantity'" class="w-full">
                <input
                  v-model.number="item.quantity"
                  v-focus
                  type="number"
                  class="h-[34px] w-full rounded bg-dark-400 px-2 text-right font-regular text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  @keydown.enter="stopEditing()"
                  @blur="stopEditing()" />
              </div>
              <div v-else class="flex h-[34px] w-full cursor-pointer items-center justify-end rounded px-2 transition-colors hover:bg-white/5" @click="startEditing(idx, 'quantity')">
                <span>{{ item.quantity || 1 }}</span>
              </div>
            </td>

            <td class="h-[52px] py-3 text-right align-middle font-semi-bold text-white">
              <span>{{ formatCurrency((Number(item.rate) || 0) * (Number(item.quantity) || 1)) }}</span>
            </td>
          </tr>

          <tr v-if="!isAddingService" class="group cursor-pointer transition-colors hover:bg-dark-500/30" @click="startAddingService()">
            <td colspan="5" class="h-[52px] py-3 font-semi-bold text-light-400 group-hover:text-white">
              <div class="flex h-[34px] items-center gap-2 rounded px-2">
                <NuxtIcon name="local:plus" class="text-xl text-primary-400" />
                <span>Add service</span>
              </div>
            </td>
          </tr>
          <tr v-else class="h-[52px] text-sm md:text-base">
            <td class="h-[52px] py-3 pr-4 align-middle">
              <input
                v-model="newService.title"
                v-focus
                type="text"
                placeholder="Service name..."
                class="h-[34px] w-full rounded bg-dark-400 px-2.5 font-semi-bold text-white placeholder:text-light-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                @keydown.enter="commitNewService()"
                @blur="commitNewService()" />
            </td>
            <td class="h-[52px] py-3 pr-4 align-middle">
              <input
                v-model="newService.description"
                type="text"
                placeholder="Add bullet point description..."
                class="h-[34px] w-full rounded bg-dark-400 px-2.5 text-light-400 placeholder:text-light-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                @keydown.enter="commitNewService()"
                @blur="commitNewService()" />
            </td>
            <td class="h-[52px] py-3 align-middle">
              <input
                v-model="newService.rate"
                type="number"
                placeholder="0"
                class="h-[34px] w-full rounded bg-dark-400 px-2 text-right text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                @keydown.enter="commitNewService()"
                @blur="commitNewService()" />
            </td>
            <td class="h-[52px] py-3 align-middle">
              <input
                v-model="newService.quantity"
                type="number"
                placeholder="1"
                class="h-[34px] w-full rounded bg-dark-400 px-2 text-right text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                @keydown.enter="commitNewService()"
                @blur="commitNewService()" />
            </td>
            <td class="h-[52px] py-3 text-right align-middle font-semi-bold text-white">
              <span>{{ formatCurrency((Number(newService.rate) || 0) * (Number(newService.quantity) || 1)) }}</span>
            </td>
          </tr>

          <tr class="border-t border-dark-600">
            <td colspan="4" class="py-4 pr-4 text-sm font-semi-bold text-white md:text-base">Subtotal</td>
            <td class="py-4 text-right text-sm font-semi-bold text-white md:text-base">{{ formatCurrency(calculatedSubtotal) }}</td>
          </tr>

          <tr class="border-t border-dark-600">
            <td colspan="4" class="py-4 pr-4 text-sm font-semi-bold text-white md:text-base">Total</td>
            <td class="py-4 text-right text-sm font-semi-bold text-white md:text-base">{{ formatCurrency(calculatedTotal) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
table {
  font-variant-numeric: tabular-nums;
}
</style>
