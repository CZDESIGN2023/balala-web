<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'

const isFullScreen = defineModel()

const duration = 400
const introItemRef = ref()
const state = reactive({
  containerFullClass: false, // 容器是否全屏
  ghostStyle: {} as any,
  enterToStyle: {} as any,
})

const animateStyle = computed(() => {
  return Object.assign({}, state.enterToStyle)
})

watch(() => isFullScreen.value, (n) => {
  if (n) {
    fullScreen()
  }
  else {
    restoreScreen()
  }
})

function fullScreen() {
  state.containerFullClass = true

  const rect = introItemRef.value.getBoundingClientRect()

  state.ghostStyle = {
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  }
  // console.log(state.ghostStyle)
  nextTick(() => {
    state.enterToStyle = {
      width: `100%`,
      height: '100%',
      top: 0,
      left: 0,
      position: 'fixed',
      zIndex: '999',
      animation: `udZoomIn ${duration}ms ease`,
    }
  })
}

function restoreScreen() {
  // console.log('还原')
  state.enterToStyle.animation = `udZoomOut ${duration}ms ease`
  setTimeout(() => {
    // state.ghostStyle = {}
    state.enterToStyle = {}
    state.containerFullClass = false
  }, duration - 50)
}
defineExpose({
  fullScreen,
  restoreScreen,
})
</script>

<template>
  <div class="mb24" :class="{ 'full-screen': isFullScreen }">
    <Transition name="fade">
      <div
        v-if="isFullScreen"
        class="layer fixed w-full h-full left-0 top-0"
      />
    </Transition>
    <div v-if="state.containerFullClass" :style="state.ghostStyle" />
    <div ref="introItemRef" :style="animateStyle" :class="{ 'container-full': state.containerFullClass }" class="w-full">
      <div class="intro-item">
        <DragBtn class="absolute" name="intro-drag-btn" />
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layer {
  background: rgba(0, 0, 0, 0.35);
  z-index: 999;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.full-screen {
  :deep('.drag-btn') {
    display: none;
  }
}
.container-full {
  display: flex;
  align-items: center;
  justify-content: center;
  .intro-item {
    width: 1088px;
  }
}
.intro-item {
  padding: 24px;
  background: #ffffff;
  border: 1px solid #f7f8fa;
  border-radius: 8px;
  transition: 0.3s box-shadow;
  position: relative;
  transform-origin: center center;
  -webkit-animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  &:hover {
    box-shadow:
      0px 8px 24px 0px rgba(0, 0, 0, 0.06),
      0px 4px 4px 0px rgba(0, 0, 0, 0.02);
    .drag-btn {
      opacity: 1;
    }
  }
  .drag-btn {
    opacity: 0;
    top: 8px;
    left: 7px;
    transition: 0.3s opacity;
    &:hover {
      :deep(use) {
        fill: #666;
      }
    }
    :deep(use) {
      fill: #999;
    }
  }
  + .intro-wrap {
    margin-top: 24px;
  }
}
</style>
