<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useLineChart } from '@/echart'

const circleRef = ref()

onMounted(() => {
  const data = {
    x: [],
    y: [],
  }
  for (let i = 0; i < 100; i++) {
    data.x.push('6-21')
    data.y.push(Math.random() * 100)
  }

  useLineChart(circleRef.value, data)
})
</script>

<template>
  <div ref="circleRef" class="circle" />
</template>

<style lang="scss" scoped>
.circle {
  width: 100%;
  height: 245px;
}
</style>
