<script lang="ts" setup>
import Logo from './logo.vue'
import Menu from './menu.vue'
import Foot from './foot.vue'
</script>

<template>
  <div class="app-sidebar flex-column-between">
    <div class="top">
      <Logo />
      <el-tooltip content="收起" placement="right" :offset="8">
        <div class="collapse-icon pointer flex-row-center" @click="$emit('changeCollapse', true)">
          <svg-icon name="arrow-l" size="16" color="#666666" />
        </div>
      </el-tooltip>
      <Menu />
    </div>
    <Foot />
  </div>
</template>

<style lang="scss" scoped>
.app-sidebar {
  position: fixed;
  top: 0;
  overflow: hidden;
  white-space: nowrap;
  bottom: 0;
  left: 0;
  z-index: 889;
  width: $sidebar-width;
  height: 100%;
  background: $sidebar-bg;
  box-shadow: -1px 0px 12px 0px rgba(0, 0, 0, 0.02);
  padding: 0 0 24px;
  transition: all 0.3s;
  .top {
    height: calc(100% - 64px);
  }
}
</style>
