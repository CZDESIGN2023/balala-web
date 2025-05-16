<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import type { Component } from 'vue'
import Draggable from 'vuedraggable'

defineOptions({ name: 'NestedDrag' })

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  components: () => ({}) as { [key: string]: { component: Component } },
  name: '',
  animation: 400,
  put: true,
  pull: undefined,
  sort: true,
})
const emit = defineEmits(['change'])
interface Item {

}

interface Props {
  items: Item[]
  components: { [key: string]: { component: Component } }
  name?: string
  animation?: number
  pull?: string | undefined
  put?: boolean
  sort?: boolean
}

function updateData(params: any) {
  if (params.added) {
    const newElement = cloneDeep(params.added.element)
    newElement.id = Math.random()
    props.items[params.added.newIndex] = newElement
  }
  emit('change', params)
}
</script>

<template>
  <Draggable
    v-bind="$attrs"
    :list="$props.items"
    :group="{ name: 'nested-drag', put: $props.put, pull: $props.pull }"
    :animation
    :sort
    :class="{ [$props.items?.length === 0 ? `${$props.name}-empty` : '']: true }"
    class="dragArea"
    item-key="name"
    @change="updateData"
  >
    <template #item="{ element }">
      <component :is="$props.components?.[element.name]" v-bind="element.config">
        {{ element.config?.slot }}
        <nested-drag
          :items="element.children"
          :name="element.name"
          :animation="$props.animation"
          :put="element.put"
          :pull="element.pull"
          :components
          :sort
        />
      </component>
    </template>
  </Draggable>
</template>

<style scoped>
.dragArea {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}
.column-empty {
  &::before {
    content: '拖拽组件或模板到这里';
    height: 50px;
    width: 100%;
    font-size: 14px;
    color: #a7b1bd;
    background-color: #f0f0f0;
    border: 1px dotted;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.row-empty {
  &::before {
    content: '容器行';
    height: 50px;
    width: 100%;
    font-size: 14px;
    color: #a7b1bd;
    background-color: #f0f0f0;
    border: 1px dotted;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
