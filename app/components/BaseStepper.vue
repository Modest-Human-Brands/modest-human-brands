<script setup lang="ts">
export interface Step {
  id: string
  name: string
}

const props = defineProps<{
  steps: Step[]
  currentStep: number // 0-based index
}>()

const getStepStatus = (index: number) => {
  if (index < props.currentStep) return 'complete'
  if (index === props.currentStep) return 'current'
  return 'upcoming'
}
</script>

<template>
  <nav aria-label="Progress">
    <ol role="list" class="flex items-center overflow-hidden rounded-lg border border-dark-600 bg-dark-400">
      <li v-for="(step, stepIdx) in steps" :key="step.name" class="relative flex-1">
        <div v-if="getStepStatus(stepIdx) === 'complete'" class="group flex w-full items-center justify-center md:justify-start">
          <span class="flex items-center px-2 py-3 text-sm font-semi-bold md:px-6 md:py-4">
            <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 md:h-10 md:w-10">
              <svg class="h-5 w-5 text-white md:h-6 md:w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                  clip-rule="evenodd" />
              </svg>
            </span>
            <span class="ml-4 hidden text-sm font-semi-bold text-white md:block">{{ step.name }}</span>
          </span>
        </div>

        <div v-else-if="getStepStatus(stepIdx) === 'current'" class="flex items-center justify-center px-2 py-3 text-sm font-semi-bold md:justify-start md:px-6 md:py-4" aria-current="step">
          <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary-500 md:h-10 md:w-10">
            <span class="text-xs text-primary-500 md:text-sm">{{ step.id }}</span>
          </span>
          <span class="ml-4 hidden text-sm font-semi-bold text-primary-500 md:block">{{ step.name }}</span>
        </div>

        <div v-else class="group flex items-center justify-center md:justify-start">
          <span class="flex items-center px-2 py-3 text-sm font-semi-bold md:px-6 md:py-4">
            <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-dark-600 md:h-10 md:w-10">
              <span class="text-xs text-light-400 md:text-sm">{{ step.id }}</span>
            </span>
            <span class="ml-4 hidden text-sm font-semi-bold text-light-400 md:block">{{ step.name }}</span>
          </span>
        </div>

        <template v-if="stepIdx !== steps.length - 1">
          <div class="absolute right-0 top-0 h-full w-5" aria-hidden="true">
            <svg class="h-full w-full text-dark-600" viewBox="0 0 22 80" fill="none" preserveAspectRatio="none">
              <path d="M0 -2L20 40L0 82" vector-effect="non-scaling-stroke" stroke="currentcolor" stroke-linejoin="round" />
            </svg>
          </div>
        </template>
      </li>
    </ol>
  </nav>
</template>
