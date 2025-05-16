<script lang="ts" setup>
const props = defineProps({
  rate: {
    type: String,
    required: true,
  },
})

// 获取进度
function getDasharray(rate: string) {
  const count = Number(rate)
  const start = `calc(2 * 3.1415 * (14 - 2) / 2 * (${count} / 100))`
  if (count === 0)
    return `stroke-dasharray: ${start}, 1000; opacity: 0;`

  return `stroke-dasharray: ${start}, 1000`
}
</script>

<template>
  <div class="rate-box flex-row-start">
    <svg class="rate-circle mr8">
      <!-- r (14 - 2)/2 -->
      <circle stroke="#e3e4e5" />
      <circle stroke="#0F87FF" :style="getDasharray(props.rate)" />
    </svg>
    <p class="minor-color text14">
      {{ props.rate }}%
    </p>
  </div>
</template>

<style lang="scss">
.rate-box {
  .rate-circle {
    width: 14px;
    height: 14px;
    transform: rotate(-90deg);
    padding-left: 0;
    circle {
      cx: 7px;
      cy: 7px;
      r: 6px;
      stroke-linecap: round;
      fill: none;
      stroke-width: 2px;
    }
    .dasharray {
      transition: stroke-dasharray 0.4s linear;
    }
  }
}
</style>
