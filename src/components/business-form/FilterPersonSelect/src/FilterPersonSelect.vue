<template>
  <BusinessPersonSelect
    v-bind="$attrs"
    class="filter-person-select"
  />
</template>

<style lang="scss" scoped>
.filter-person-select {
  &.ant-select-multiple.ant-select-lg {
    :deep(.ant-select-selector) {
      padding-inline-end: 0;
      min-height: $tool-input-height !important;
    }
    :deep(.ant-select-selector:after) {
      height: 28px;
    }
    :deep(.ant-select-selection-placeholder) {
      inset-inline-start: 8px;
      font-size: 14px;
      line-height: 32px;
    }
    :deep(.ant-select-arrow) {
      inset-inline-end: 8px;
    }
  }
  :deep(.ant-select-selection-overflow) {
    padding: 0 !important;
    display: flex;
    align-items: center;
  }
  :deep(.ant-select-selection-overflow-item) {
    margin: 0 !important;
    .ant-select-selection-item {
      min-height: $tool-input-height !important;
      .ant-select-selection-item-content {
        p {
          line-height: $tool-input-height !important;
        }
      }
    }
  }
  :deep(.choose-list .option-item) {
    height: 40px;
    .avatar {
      width: 28px !important;
      height: 28px !important;
    }
  }
}
</style>
