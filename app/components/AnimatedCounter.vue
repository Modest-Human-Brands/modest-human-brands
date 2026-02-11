<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  target: number
  suffix?: string
  duration?: number
}>()

const count = ref(0)

const animate = () => {
  const duration = props.duration || 2000
  const increment = props.target / (duration / 16)

  const timer = setInterval(() => {
    count.value += increment
    if (count.value >= props.target) {
      count.value = props.target
      clearInterval(timer)
    }
  }, 16)
}

onMounted(() => {
  animate()
})

watch(
  () => props.target,
  () => {
    count.value = 0
    animate()
  }
)
</script>

<template>
  <span>{{ Math.floor(count).toLocaleString() }}{{ suffix }}</span>
</template>
