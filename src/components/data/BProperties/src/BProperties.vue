<script setup lang="ts">
import { reactive, watchEffect } from 'vue'
import { getBadgeColor } from '@/utils/color'

interface Props {
  fontSize?: number
  text?: string
  keyName?: string
  xpadding?: number | string
  ypadding?: number | string
  width?: number | string
  maxWidth?: number | string
  id?: string
  bg?: string
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 14,
  text: '...',
  keyName: '',
  xpadding: 0,
  ypadding: 0,
  width: 0,
  maxWidth: 125,
  id: '',
  bg: '',
})

const tagStyles = reactive({
  fontSize: `${props.fontSize}px`,
  padding: calcTagPadding(),
  background: calcRandomColr(),
  width: calcTagWidth(),
  maxWidth: `${props.maxWidth}px`,
})

function calcRandomColr() {
  if (props.bg) {
    return props.bg
  }

  return getBadgeColor(props.text)
}

function calcTagPadding() {
  if (props.width) {
    return `${props.ypadding || 0}px ${0}px`
  }
  return `${props.ypadding || 0}px ${props.xpadding || 0}px`
}

function calcTagWidth() {
  if (props.width) {
    return `${props.width}px`
  }
  return 'fit-content'
}

watchEffect(() => {
  tagStyles.fontSize = `${props.fontSize}px`
  tagStyles.padding = calcTagPadding()
  tagStyles.background = calcRandomColr()
  tagStyles.width = calcTagWidth()
  tagStyles.maxWidth = `${props.maxWidth}px`
})
</script>

<template>
  <div class="default-tag pfm" :style="tagStyles">
    {{ props.text }}
  </div>
</template>

<style lang="scss" scoped>
.default-tag {
  line-height: 1;
  border-radius: 4px;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
