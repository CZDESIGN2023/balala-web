<!-- TaskBadge.vue -->
<script setup>
defineOptions({ name: 'BBadge' })
defineProps({
  label: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  minWidth: {
    type: String,
    default: 'auto',
  },
  height: {
    type: String,
    default: '24px',
  },
  customClass: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div
    class="b-badge br4 flex-row-center text14 title-color pfm flex-shrink-0"
    :class="customClass"
    :style="{
      background: color,
      minWidth,
      height,
    }"
  >
    {{ label }}
  </div>
</template>

<style scoped>
.b-badge {
  padding: 0 8px;
  font-weight: normal;
}
</style>
