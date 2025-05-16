<script lang="ts" setup>
import { computed } from 'vue'
import type { ModuleItemStats } from '@/api/project/intro/types'

type keys = 'completed' | 'processing' | 'expired' | 'closedOrTerminated'

// 定义Props接口
interface Props {
  title: string
  stats: ModuleItemStats
}

interface Colors {
  [key: string]: {
    default: string
    hover?: string
  }
}

// 使用withDefaults为Props设置默认值
const props = withDefaults(defineProps<Props>(), {
  title: '',
  stats: () => ({} as ModuleItemStats),
})

// 定义指标颜色
const colors: Colors = {
  completed: {
    default: 'linear-gradient(270deg, #66B2FF 0%, #7DD9FA 100%)',
    hover: 'linear-gradient(270deg, #0F87FF 0%, #17B1EA 100%)',
  },
  processing: {
    default: 'linear-gradient(270deg, #FFC166 0%, #FFDB66 100%)',
    hover: 'linear-gradient(270deg, #FF9800 0%, #FFC300 99%)',
  },
  expired: {
    default: 'linear-gradient(270deg, #FD7272 0%, #FFA180 100%)',
    hover: 'linear-gradient(270deg, #FD4C4C 0%, #FF7D4E 100%)',
  },
  closedOrTerminated: {
    default: '#E6E7EB',
    hover: '#DCDDE0',
  },
  none: {
    default: '#F7F8FA',
    hover: '#F7F8FA',
  },
}

// 计算每个指标的百分比
const computedPercentages = computed(() => {
  // const total = Number.parseInt(props.stats.total, 10)

  const keysToCalculate: keys[] = ['completed', 'processing', 'expired', 'closedOrTerminated']
  const total = keysToCalculate.reduce((acc, key) => {
    return acc + Number.parseInt(props.stats[key], 10)
  }, 0)

  if (total === 0) {
    return { none: 100 } // 如果total为0，则显示暂无指标占满整个进度条
  }

  const percentages: { [key in keys]: string } = {} as ModuleItemStats

  keysToCalculate.forEach((key) => {
    const value = Number.parseInt(props.stats[key], 10)
    const percentage = ((value / total) * 100).toFixed(2)
    if (percentage !== '0.00') { // 如果百分比不是0%，则添加到对象中
      percentages[key] = percentage
    }
  })

  return percentages
})
</script>

<template>
  <div class="bar-chart pl16">
    <div class="box flex-row-center">
      <div
        v-for="(percentage, key) in computedPercentages"
        :key="key"
        class="item"
        :class="key"
        :style="{
          flex: `0 1 ${percentage}%`,
          background: `${colors[key].default}`,
        }"
      />
    </div>
  </div>
</template>

<style lang="scss">
.bar-chart {
  width: 100%;
  .box {
    width: 100%;
    height: 16px;
    box-shadow:
      0px 4px 24px 0px rgba(12, 20, 33, 0.01),
      0px 4px 4px 0px rgba(12, 20, 33, 0.02);
    border-radius: 8px;
    background: #fff;
    padding: 2px;
    .item {
      height: 100%;
      margin-right: 1px;
      transition: background-color 0.3s ease;
      &:first-child {
        border-radius: 8px 0 0 8px;
      }
      &:last-child {
        border-radius: 0 8px 8px 0;
        margin-right: 0;
      }
      &:only-child {
        border-radius: 8px;
      }
    }
    &:hover {
      .completed {
        background: v-bind('colors.completed.hover') !important;
      }
      .processing {
        background: v-bind('colors.processing.hover') !important;
      }
      .expired {
        background: v-bind('colors.expired.hover') !important;
      }
      .closedOrTerminated {
        background: v-bind('colors.closedOrTerminated.hover') !important;
      }
      .none {
        background: v-bind('colors.none.hover');
      }
    }
  }
}
</style>
