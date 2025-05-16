<script lang="ts" setup>
import { computed } from 'vue'
import sideBar from './sidebar/index.vue'
import collapse from './sidebar/collapse.vue'
import appMain from './main/index.vue'
import { useProjectStore } from '@/stores/modules/project'

const projectStore = useProjectStore()
const isCollapse = computed(() => projectStore.isCollapse)
const activeComment = computed(() => {
  if (isCollapse.value)
    return collapse

  return sideBar
})

const transitionName = computed(() => {
  if (isCollapse.value)
    return 'slide-left'

  return 'slide-right'
})
</script>

<template>
  <div class="app-layout">
    <Transition :name="transitionName">
      <component :is="activeComment" @change-collapse="projectStore.setisCollapse" />
    </Transition>
    <app-main :is-collapse="isCollapse" />
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  width: 100%;
  position: fixed;
  overflow: hidden;
  height: 100%;
  // position: relative;
  // display: flex;
  // justify-items: stretch;
}

.slide-left-enter-active {
  transition: all 0.3s;
}

.slide-left-leave-active {
  transition: all 0.3s;
}

.slide-left-enter-from {
  opacity: 0;
}

.slide-left-enter-to {
  opacity: 1;
}

.slide-left-leave-from {
  opacity: 1;
  overflow: hidden;
  white-space: nowrap;
}

.slide-left-leave-to {
  width: $sidebar-width-is-collapse;
  overflow: hidden;
  white-space: nowrap;
}

.slide-right-enter-active {
  transition: all 0.3s;
}

.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  width: $sidebar-width-is-collapse;
  overflow: hidden;
  white-space: nowrap;
}

.slide-right-enter-to {
  width: $sidebar-width;
  overflow: hidden;
  white-space: nowrap;
}

.slide-right-leave-from {
  opacity: 1;
}

.slide-right-leave-to {
  opacity: 0;
}
</style>
