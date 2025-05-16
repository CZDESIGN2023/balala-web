<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'

interface Props {
  content?: string
  width?: string
  fs?: string
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  width: '100%',
  fs: '14',
  contentClass: '',
})

const contentRef = ref<HTMLElement | null>(null)
const isContentOverflow = ref(false)

onMounted(() => {
  isShowTips()
})

watch(props, (newContent) => {
  if (newContent)
    isShowTips()
}, {
  immediate: true,
})

// 判断是否显示 tip
function isShowTips() {
  if (contentRef.value) {
    setTimeout(() => {
      isContentOverflow.value = contentRef.value?.scrollWidth !== undefined && contentRef.value.scrollWidth - 1 > contentRef.value?.clientWidth
    }, 1)
  }
}
</script>

<template>
  <el-tooltip :content="props.content" placement="top" :disabled="!isContentOverflow">
    <div
      ref="contentRef"
      class="b-ellipsis-text"
      :class="contentClass"
      :style="{ width: props.width, fontSize: `${props.fs}px` }"
    >
      {{ props.content }}
    </div>
  </el-tooltip>
</template>

<style lang="scss" scoped>
.b-ellipsis-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  user-select: none;
  -webkit-user-select: none;
  span {
    user-select: auto;
    -webkit-user-select: auto;
    white-space: pre;
  }
}
</style>
