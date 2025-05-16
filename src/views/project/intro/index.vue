<script lang="ts" setup>
import { type ComponentOptions, defineComponent, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectTempConfig, setProjectTempConfig } from '@/api/project'
import { usePermission } from '@/hooks/usePermission'
import { Perm } from '@/enum/permission'

defineOptions({ name: 'IntroView' })

defineEmits(['onUpdate'])

// 自动加载 widgets 目录下的组件
const widgets = import.meta.glob('./widgets/*.vue', { eager: true })
const components = Object.keys(widgets)
  .map(item => ({ [item.replace(/^\.\/widgets\/([^/]+)\.vue$/, '$1')]: widgets[item] }))
  .reduce((acc, item) => {
    const [key, value] = Object.entries(item)[0]
    acc[key] = defineComponent((value as ComponentOptions).default)
    return acc
  }, {})

const { checkPerm } = usePermission()
const params = useRoute().params
const state = reactive({
  loading: true,
  layoutData: [
    { id: 1, name: 'panel' },
    { id: 2, name: 'module' },
    { id: 3, name: 'version' },
    { id: 4, name: 'user' },
  ],
})

function onDragChange(dragData: any) {
  if (dragData.moved)
    setProjectTempConfig({ spaceId: params.id as string, configs: { overview_order: JSON.stringify(state.layoutData) } })
}

function getConfig() {
  state.loading = true
  getProjectTempConfig({ spaceId: params.id as string, keys: ['overview_order'] })
    .then(({ data }) => {
      if (data.overview_order) {
        const serverData = JSON.parse(data.overview_order)
        const newWidgets = state.layoutData.filter((item) => {
          return !serverData.find((ele: any) => ele.name === item.name)
        })
        serverData.push(...newWidgets)
        state.layoutData = serverData
      }
    })
    .finally(() => {
      state.loading = false
    })
}

onMounted(() => {
  getConfig()
})
</script>

<template>
  <div class="project-intro">
    <div v-if="state.loading" v-loading="state.loading" class="loading-intro h300 flex items-center justify-center" />
    <BDragLayout
      v-else
      v-model="state.layoutData"
      :components
      :sort="checkPerm(Perm.SortWidgets)"
      :put="false"
      pull="clone"
      handle=".intro-drag-btn"
      @change="onDragChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.project-intro {
  width: 1152px;
  margin: 0 auto;
}
</style>
