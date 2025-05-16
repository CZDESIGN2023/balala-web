<script lang="ts" setup>
interface Item {
  color: string
  label: string
  value: string
}

interface Props {
  title: string
  options: Item[]
  minWidth?: number
}

withDefaults(defineProps<Props>(), {
  title: '',
  options: () => [],
  minWidth: 160,
})
</script>

<template>
  <div class="hover-data text14" :style="{ 'min-width': `${minWidth}px` }">
    <div class="title p16">
      {{ $props.title }}
    </div>
    <div class="pb8">
      <div v-for="d in $props.options" :key="d.label" class="flex justify-between items-center px16 h32 ">
        <div class="label flex items-center justify-center ">
          <div v-if="d.color" :style="{ 'background-color': d.color }" class="dot w12 h12 rounded-full mr4" />
          {{ d.label }}
        </div>
        <div class="value">
          {{ d.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hover-data {
  color: #333;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #f4f5f7;
  backdrop-filter: blur(20px);
  box-shadow:
    0px 24px 48px 0px rgba(0, 0, 0, 0.04),
    0px 4px 16px 0px rgba(0, 0, 0, 0.02);
}
.title {
  background: #f7f8fa;
  line-height: 1;
}
.label {
  color: $color-minor;
}
.value {
  color: $color-icon;
  font-size: 14px;
}
</style>
