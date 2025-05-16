<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import SocketClient from './socket'
import notice from './views/notice/index.vue'
import { useUserStore } from '@/stores/modules/user'
import router from '@/router'
import { useNoticeStore } from '@/stores/modules/notice'
import { useProjectStore } from '@/stores/modules/project'

const useNotice = useNoticeStore()
const isNotice = computed(() => useNotice.showNotice)

const userStore = useUserStore()
const socketClient = new SocketClient()
const projectStore = useProjectStore()
const isCollapse = computed(() => projectStore.isCollapse)

const { currentRoute } = router
provide('socketClient', socketClient)

const key = computed(() =>
  currentRoute.value.name === 'project'
    ? `project_${currentRoute.value.params.id}`
    : (currentRoute.value.name as string),
)

onMounted(() => {
  if (socketClient._readyState === 3)
    socketClient.init(userStore.token)

  window.addEventListener('resize', changeResize)
})

// 监听屏幕大小
function changeResize() {
  // 屏幕小于800--收缩
  if (!isCollapse.value && window.innerWidth <= 800)
    projectStore.setisCollapse(true)
}

onUnmounted(() => {
  window.removeEventListener('resize', changeResize, true)
  socketClient.closeWebsocket()
})
</script>

<template>
  <a-config-provider :auto-insert-space-in-button="false" :locale="zhCN">
    <!-- 通知面板 -->
    <transition name="zoom">
      <notice v-if="isNotice" @on-close="useNotice.setShowNotice(false)" />
    </transition>
    <router-view :key="key" />
  </a-config-provider>
</template>

<style lang="scss" scoped>
.zoom-enter-active {
  animation: udZoomIn 0.1s ease;
  transform-origin: top left;
  -webkit-animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}

.zoom-leave-active {
  animation: udZoomIn 0.1s reverse;
  transform-origin: top left;
  -webkit-animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}
</style>
