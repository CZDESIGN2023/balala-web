<script lang="ts" setup>
import { h, reactive, ref } from 'vue'
import { SvgIcon } from '@/components/SvgIcon'

interface Props {
  isOpen: boolean
}

withDefaults(defineProps<Props>(), {
  isOpen: false,
})

const emits = defineEmits(['onSuccess', 'onReset'])
const verifyRef = ref()
const sliderRef = ref()
const btnRef = ref()
const verifyData = reactive<{
  isVerified: boolean
  text: string
  startX: number
  isDragging: boolean
  btnBorderWidth: number
}>({
  // 是否验证通过
  isVerified: false,
  // 提示文字
  text: '请按住滑块，拖动到最右边验证',
  // 滑块起始位置
  startX: 0,
  // 是否在拖动滑块
  isDragging: false,
  btnBorderWidth: 4,
})

// 鼠标按下滑块 添加移动事件
function rangeMove(event: MouseEvent) {
  // 如果验证通过 禁止拖动
  if (verifyData.isVerified)
    return

  // 开启拖动滑块
  verifyData.startX = event.clientX
  verifyData.isDragging = true

  // 添加拖动事件
  document.addEventListener('mousemove', startMove)
  document.addEventListener('mouseup', stopMove)
}

// 拖动滑块 开始
function startMove(event: MouseEvent) {
  if (verifyData.isDragging) {
    const offset = event.clientX - verifyData.startX
    const containerWidth = verifyRef.value?.clientWidth
    const btnWidth = btnRef.value?.offsetWidth
    // 确保偏移量不超过容器的宽度减去滑块的宽度
    const maxOffset = containerWidth - btnWidth - verifyData.btnBorderWidth
    const normalizedOffset = Math.max(0, Math.min(offset, maxOffset))

    sliderRef.value.style.width = `${normalizedOffset + btnWidth}px`
    btnRef.value.style.left = `${normalizedOffset}px`

    if (normalizedOffset >= maxOffset) {
      verifyData.isVerified = true
      verifyData.text = '验证通过'
      stopMove()
      emits('onSuccess')
    }
  }
}

// 拖动滑块 结束
function stopMove() {
  verifyData.isDragging = false

  // 清除拖动事件
  document.removeEventListener('mousemove', startMove)
  document.removeEventListener('mouseup', stopMove)

  // 判断是否滑动到右边，如果没有则回到开始位置
  if (!verifyData.isVerified) {
    btnRef.value.style.left = '0px'
    sliderRef.value.style.width = `${btnRef.value?.offsetWidth}px`
  }
}

// 重置验证状态
function resetStatu() {
  verifyData.isVerified = false
  verifyData.text = '请按住滑块，拖动到最右边验证'
  btnRef.value.style.left = '0px'
  sliderRef.value.style.width = `${btnRef.value?.offsetWidth}px`
  emits('onReset')
}

// 动态渲染拖动图标
function renderIcon() {
  const iconProps = {
    name: verifyData.isVerified ? 'verify-success' : 'verify-arrow',
    size: verifyData.isVerified ? 16 : 24,
    color: verifyData.isVerified ? '#08C479' : '#999',
  }

  return h(SvgIcon, iconProps)
}

defineExpose({
  resetStatu,
})
</script>

<template>
  <a-tooltip title="请先验证" effect="dark" :open="isOpen">
    <div
      ref="verifyRef"
      class="verify-box flex-row-end"
      :class="{ 'slide-success': verifyData.isVerified }"
    >
      <div ref="sliderRef" class="slider">
        <div ref="btnRef" class="btn flex-row-center select-none" @mousedown.left="rangeMove">
          <component :is="renderIcon" />
        </div>
      </div>
      <p class="text mr37">
        {{ verifyData.text }}
      </p>
    </div>
  </a-tooltip>
</template>

<style lang="scss" scoped>
.verify-box {
  width: $login-input-width;
  height: $login-input-height;
  background: #f7f8fa;
  border-radius: $login-input-radius;
  position: relative;
  margin-bottom: 24px;
  .slider {
    width: 44px;
    height: 44px;
    left: 2px;
    top: 2px;
    right: 2px;
    bottom: 2px;
    border-radius: 6px;
    position: absolute;
    background: #fff;
    .btn {
      position: absolute;
      width: 44px;
      height: 44px;
      border-radius: 4px;
      z-index: 1;
      background: #fff;
      border: 1px solid $color-border-main;
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.06);
      cursor: pointer;
    }
  }
  .text {
    width: 100%;
    font-size: 14px;
    color: #999999;
    position: absolute;
    left: 75px;
    user-select: none;
    -webkit-user-select: none;
  }
  &.slide-success {
    .text {
      color: #08c479;
      left: 108px;
    }
  }
}
</style>
