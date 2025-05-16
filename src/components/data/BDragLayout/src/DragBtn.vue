<template>
  <div :class="{ [`${$attrs.name}`]: !!$attrs.name }" class="drag-btn inline-flex cursor-grab w16 h16 align-sub mr2">
    <svg-icon name="drag_icon" size="16" />
  </div>
</template>

<style lang="scss">
.drag-parent {
  position: relative;
  &:hover {
    .drag-btn {
      opacity: 1;
      pointer-events: initial;
    }
  }
  .drag-btn {
    opacity: 0;
    pointer-events: none;
  }
}
</style>

<style lang="scss" scoped>
.drag-btn {
  user-select: none;
  :deep(.svg-icon) {
    use {
      fill: #d8d8d8;
    }
  }
  &:hover {
    :deep(.svg-icon) {
      use {
        fill: #333;
      }
    }
  }
  &:active {
    cursor: grabbing;
  }
}
</style>
