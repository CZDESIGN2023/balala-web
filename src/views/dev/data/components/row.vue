<template>
  <el-row class="drag-btn">
    <slot />
    <div v-if="!$slots.default">
      没有插槽内容
    </div>
  </el-row>
</template>

<style lang="scss" scoped>
.el-row {
  width: 100%;
  border: 1px dotted rgb(30 64 175);
  border-radius: 4px;
  + .el-row {
    margin-top: 2px;
  }
}
</style>
