<script lang="ts" setup>
import { ref } from 'vue'
import example from '../components/example.vue'
import box1 from './components/box1.vue'
import box2 from './components/box2.vue'
import row from './components/row.vue'
import column from './components/column.vue'

const data = ref([])
const components = {
  row,
  column,
  box1,
  box2,
}
</script>

<template>
  <div>
    <h1>BDrag Layout拖放布局</h1>
    <example>
      <p>内容区域：</p>
      <BDragLayout
        v-model="data"
        :components
      />
      <p>工具区：</p>

      <BDragLayout
        :model-value="[
          {
            id: 10,
            name: 'row',
            put: false,
            children: [
              { id: 11, name: 'column', children: [], config: { span: 12 } },
              { id: 11, name: 'column', children: [], config: { span: 11 } },
            ],
          },
          { id: 4, name: 'box1' },
          { id: 5, name: 'box2' },
        ]"
        :sort="false"
        :components
        pull="clone"
        tools
      />
    </example>
  </div>
</template>
