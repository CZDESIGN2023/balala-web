<script setup lang="ts">
import dayjs from 'dayjs'
import { onMounted } from 'vue'

const emits = defineEmits(['onChange'])

function getTodayTime() {
  const startTime = dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss')
  const endTime = dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss')
  return {
    start: startTime,
    complete: endTime,
  }
}

onMounted(() => {
  const todayTime = getTodayTime()
  emits('onChange', todayTime)
})
</script>

<template>
  <div class="today">
    今天
  </div>
</template>

<style lang="scss" scoped>
.today {
  background-color: $color-input;
  padding: 0 8px;
  height: $tool-input-height;
  line-height: $tool-input-height;
  border-radius: 4px;
  &:hover {
    background-color: $color-input-hover;
  }
}
</style>
