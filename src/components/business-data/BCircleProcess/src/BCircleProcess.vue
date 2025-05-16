<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useCircleProgessChart } from '@/echart'

const props = defineProps({
  progressData: {
    type: Object,
    default: () => {
      return {}
    },
  },
})

const circleRef = ref()

onMounted(() => {
  useCircleProgessChart(circleRef.value, props.progressData)
})
</script>

<template>
  <div ref="circleRef" class="circle" />
</template>

<style lang="scss" scoped>
.circle {
  width: 100%;
  height: 128px;
}
</style>
