<script lang="ts" setup>
import { type Ref, nextTick, ref, watch } from 'vue'
import NestedDrag from '../components/NestedDrag.vue'

interface Props {
  modelValue: any[]
  sort?: boolean
  handle?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  sort: true,
  handle: '',
})

const bDragLayoutRef = ref() as Ref<HTMLElement>
const draging = ref(false)

watch(() => props.sort, (n) => {
  if (props.handle) {
    nextTick(() => {
      const handleDomList = bDragLayoutRef.value.querySelectorAll(props.handle);
      (handleDomList as unknown as HTMLElement[]).forEach((item) => {
        item.style.display = n ? 'flex' : 'none'
      })
    })
  }
}, { immediate: true })
</script>

<template>
  <div ref="bDragLayoutRef" :class="{ draging }" class="b-drag-layout">
    <NestedDrag
      v-bind="$attrs"
      :items="props.modelValue"
      :sort
      :handle
      @start="draging = true"
      @end="draging = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.b-drag-layout {
  &.draging {
    cursor: grabbing;
  }
}
</style>
