<script lang="ts" setup>
import { ref } from 'vue'
import { StatusStyle } from '@/enum/NodeStatus'

const dialogVisible = ref(false)
function showDialog() {
  dialogVisible.value = true
}
function hideDialog() {
  dialogVisible.value = false
}
</script>

<template>
  <div class="node-legend flex-row-center" @mouseover="showDialog" @mouseleave="hideDialog">
    <a-popover
      :align="{ offset: [0, -4] }"
      trigger="hover"
      placement="bottomRight"
      overlay-class-name="node-legend-popover"
      destroy-tooltip-on-hide
    >
      <template #content>
        <div class="w280 node-legend-dialog">
          <p class="text14 title-color pfm">
            节点图例
          </p>
          <div class="flex-row-between flex-wrap pr0 pt12">
            <div
              v-for="(item, index) in Object.values(StatusStyle)"
              :key="index"
              class="w120 node-legend-item flex-row-start h40 mb4"
            >
              <div v-if="item.type === 'circle'" class="w36 h20 flex-row-center mr12">
                <p class="circle w12 h12 br6" :style="{ background: item.color }" />
              </div>
              <div v-if="item.type === 'icon'" class="w36 h20 flex-row-center mr12">
                <svg-icon name="node-restart" size="14" :color="item.color" />
              </div>
              <p
                v-if="item.type === 'div'"
                class="w36 h20 flex-row-center br4 mr12 text12 title-color"
                :style="{ background: item.color }"
              >
                延期
              </p>
              <p class="text14 icon-color">
                {{ item.label }}
              </p>
            </div>
          </div>
        </div>
      </template>
      <div class="w24 h24 flex-row-center">
        <svg-icon name="node-legend" size="16" color="#333333" />
      </div>
    </a-popover>
  </div>
</template>

<style lang="scss">
.node-legend-popover {
  &.ant-zoom-big-enter-active {
    animation: udZoomIn 0.2s ease;
    transform-origin: top right;
  }
  &.ant-zoom-big-leave-active {
    animation: udZoomIn 0.2s reverse;
    transform-origin: top right;
  }
  .ant-popover-content {
    .ant-popover-inner {
      padding: 0;
      box-shadow:
        0px 8px 16px 0px rgba(0, 0, 0, 0.08),
        0px 4px 4px 0px rgba(0, 0, 0, 0.04);
    }
  }
  .node-legend-dialog {
    background-color: #fff;
    // position: absolute;
    // top: 40px;
    // right: 0;
    box-shadow:
      0px 16px 32px 0px rgba(0, 0, 0, 0.08),
      0px 8px 16px 0px rgba(0, 0, 0, 0.04),
      0px 4px 4px 0px rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    padding: 16px;
    padding-top: 12px;
    padding-bottom: 12px;
    // &:after {
    //   content: '';
    //   position: absolute;
    //   width: 270px;
    //   height: 40px;
    //   top: -20px;
    //   right: 0;
    //   background-color: transparent;
    // }
  }
  .zoom-enter-active {
    animation: udZoomIn 0.2s ease;
    transform-origin: top right;
  }
  .zoom-leave-active {
    animation: udZoomIn 0.2s reverse;
    transform-origin: top right;
  }
}
</style>

<style lang="scss" scoped>
.node-legend {
  width: 24px;
  height: 24px;
  border: 1px solid $color-border-main;
  border-radius: 4px;
  position: absolute;
  right: 0;
  top: 8px;
  z-index: 20;
  cursor: pointer;
  &:hover {
    background: $color-bg-hover;
    border: 1px solid transparent;
  }
}
</style>
