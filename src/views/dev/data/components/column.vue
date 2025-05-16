<template>
  <el-col v-bind="$attrs">
    <slot />
  </el-col>
</template>

<style lang="scss" scoped>
.el-col {
  border: 1px solid transparent;
  &:hover {
    border-color: rgb(30 64 175);
  }
}
</style>
