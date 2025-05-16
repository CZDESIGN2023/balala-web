<script lang="ts" setup>
import { markRaw, reactive, ref, shallowRef } from 'vue'
import projectAdmin from './components/userManage/projectAdmin.vue'
import projectMemberManage from './components/userManage/projectMemberManage.vue'

const emits = defineEmits(['handleLoading'])

const menuList = reactive([
  {
    title: '项目管理员',
    component: markRaw(projectAdmin),
  },
  {
    title: '项目成员',
    component: markRaw(projectMemberManage),
  },
])
const loadingEnd = ref<boolean>(false)
function handleLoading(val: boolean) {
  emits('handleLoading', val)
  loadingEnd.value = !val
}
const currentComponent = shallowRef(projectAdmin)
const curryIndex = ref<number>(0)

function changeMenu(component: any, index: number) {
  curryIndex.value = index
  currentComponent.value = component
}
</script>

<template>
  <div class="project-user-module">
    <div class="menu">
      <div
        v-for="(item, index) in menuList"
        :key="item.title"
        class="menu-item mb4 pointer"
        :class="curryIndex === index ? 'curry-item pfm' : ''"
        @click="changeMenu(item.component, index)"
      >
        {{ item.title }}
      </div>
    </div>

    <div v-show="loadingEnd" class="main">
      <component :is="currentComponent" @handle-loading="handleLoading" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project-user-module {
  display: flex;
  height: calc(100vh - 66px);
  padding: 0 24px;

  .menu {
    width: 208px;
    height: 100%;
    border-right: 1px solid $color-border-main;
    padding: 24px 16px 24px 0px;
  }

  .menu-item {
    width: 192px;
    height: 40px;
    line-height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    color: #333333;
  }

  .curry-item {
    background: rgba(29, 116, 245, 0.08);
  }

  .main {
    width: 100%;
    padding: 24px 0 24px 16px;
  }
}
</style>
