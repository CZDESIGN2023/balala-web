<script lang="ts" setup>
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { DateFormat } from '@/enum/dateFormat'

interface Props {
  title: string
  icon: string
  total: number
  isFullScreen: boolean
}
const props = withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  total: 0,
  isFullScreen: false,
})

const emits = defineEmits(['onChangeDate', 'onZoomIn', 'onZoomOut'])

const dateRef = ref()

// 当前选择的时间区间
const activeKey = ref('week')
// 是否显示时间选择器
const isTimePickerShow = ref<boolean>(false)
// 自定义时间范围
const customTime = ref<{ startTime: string, endTime: string }>({
  startTime: '',
  endTime: '',
})

// 时间区间
const tabs = computed(() => {
  const weekDate = getDateRange('week')
  const monthDate = getDateRange('month')
  return [
    {
      key: 'week',
      name: '本周',
      tip: weekDate?.tip,
      value: weekDate?.value,
      selected: activeKey.value === 'week',
    },
    {
      key: 'month',
      name: '本月',
      tip: monthDate?.tip,
      value: monthDate?.value,
      selected: activeKey.value === 'month',
    },
  ]
})

const customTab = computed(() => {
  const customDate = getDateRange('custom')
  return {
    key: 'custom',
    name: '自定义',
    tip: customDate?.tip,
    value: customDate?.value,
    active: isTimePickerShow.value,
    selected: activeKey.value === 'custom' && customTime.value.startTime,
  }
})

// 更改筛选条件
function changeTab(item: any) {
  const { key, value } = item
  if (key !== 'custom') {
    activeKey.value = key
    isTimePickerShow.value = false
    customTime.value = {
      startTime: '',
      endTime: '',
    }
    dateChange(key, value.startTime, value.endTime)
  }
}

// 箭头日期改变
function dateChange(_activeKey: string = 'week', startUnixSec?: number, endUnixSec?: number) {
  const defaultDateRange = getDateRange(_activeKey)

  const startTime = dayjs(startUnixSec ? startUnixSec * 1000 : (defaultDateRange?.value.startTime as number * 1000)).format(`${DateFormat.DATE} 00:00:00`)
  const endTime = dayjs(endUnixSec ? endUnixSec * 1000 : (defaultDateRange?.value.endTime as number * 1000)).format(`${DateFormat.DATE} 23:59:59`)

  const dateRange = {
    startTime,
    endTime,
  }

  activeKey.value = _activeKey
  emits('onChangeDate', dateRange, _activeKey)
}

function customDateShow() {
  isTimePickerShow.value = true
}

function customDateClose() {
  if (!customTime.value.startTime || !customTime.value.endTime) {
    isTimePickerShow.value = false
    customTime.value = {
      startTime: '',
      endTime: '',
    }
  }
}

// 获取日期
function getDateRange(key: string) {
  const now = dayjs()
  const startOfWeek = now.startOf('week')
  const endOfWeek = now.endOf('week')
  const startOfMonth = now.startOf('month')
  const endOfMonth = now.endOf('month')
  const startOfCustom = dayjs(Number(customTime.value.startTime) * 1000)
  const endOfCustom = dayjs(Number(customTime.value.endTime) * 1000)
  switch (key) {
    case 'week':
      return {
        tip: `${startOfWeek.format(DateFormat.DATE)} ~ ${endOfWeek.format(DateFormat.DATE)}`,
        value: {
          startTime: startOfWeek.unix(),
          endTime: endOfWeek.unix(),
        },
      }
    case 'month':
      return {
        tip: `${startOfMonth.format(DateFormat.DATE)} ~ ${endOfMonth.format(DateFormat.DATE)}`,
        value: {
          startTime: startOfMonth.unix(),
          endTime: endOfMonth.unix(),
        },
      }
    case 'custom':
      return {
        tip: `${startOfCustom.format(DateFormat.DATE)} ~ ${endOfCustom.format(DateFormat.DATE)}`,
        value: {
          startTime: `${customTime.value.startTime}`,
          endTime: `${customTime.value.endTime}`,
        },
      }
  }
}

// 选择自定义时间 暂时中转处理，日期选择器应该传时间戳出来,格式自己定义
function changeCustomDate(data: { start: string, complete: string, startUnix: number, endUnix: number }) {
  customTime.value = {
    startTime: String(data.startUnix),
    endTime: String(data.endUnix),
  }
  dateChange('custom', data.startUnix, data.endUnix)
}

// 放大全屏
function zoomIn() {
  emits('onZoomIn')
}

// 缩小全屏
function zoomOut() {
  emits('onZoomOut')
}

defineExpose({
  dateChange,
})
</script>

<template>
  <div class="intro-module-head flex-row-between mb16">
    <div class="left flex-row-start">
      <svg-icon class="mr6" :name="props.icon" size="16" color="#999999" />
      <p class="h16 text14 icon-color pfm font-smoothing flex-row-start">
        {{ props.title }} <span v-if="props.total" class="total ml6 text12 minor-color">共 {{ props.total }}</span>
      </p>
      <slot name="leftTool" />
    </div>
    <div class="right flex-row-start gap8">
      <template
        v-for="item in tabs"
        :key="item.key"
      >
        <el-tooltip :content="item.tip" placement="top" :disabled="!item.value?.startTime" :show-after="50" :hide-after="0" :offset="10">
          <div
            class="flex-row-center tab pointer"
            :class="{ selected: item.selected, active: item.key === activeKey }"
            @click="changeTab(item)"
          >
            {{ item.name }}
          </div>
        </el-tooltip>
      </template>

      <b-input-date ref="dateRef" v-model="customTab.value" :format="DateFormat.DATE" @on-change="changeCustomDate" @on-show="customDateShow" @on-close="customDateClose">
        <template #reference>
          <div
            class="flex-row-center tab pointer"
            :class="{ active: customTab.active, selected: customTab.selected }"
            @click="changeTab(customTab)"
          >
            {{ customTab.value?.startTime ? customTab.tip : customTab.name }}
          </div>
        </template>
      </b-input-date>
      <div v-if="!props.isFullScreen" class="zoom w24 h24 br4 flex-row-center" @click="zoomIn">
        <el-tooltip content="放大" placement="top" :offset="13">
          <svg-icon name="zoom-out" size="16" color="#808080" />
        </el-tooltip>
      </div>
      <div v-else class="zoom w24 h24 br4 flex-row-center" @click="zoomOut">
        <el-tooltip content="缩小" placement="top" :offset="13">
          <svg-icon name="zoom-in" size="16" color="#808080" />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.intro-module-head {
  .right {
    .tab {
      height: 26px;
      border-radius: 4px;
      text-align: center;
      padding: 0 8px;
      flex-shrink: 0;
      font-size: 12px;
      color: #333333;
      transition: all 0.3s;
      &:hover {
        background: $color-default-hover;
      }
      &:active,
      &.active {
        background: $color-default-active;
      }
      &.selected {
        background: $color-primary-active;
        color: $color-primary;
      }
    }
    .zoom {
      flex-shrink: 0;
      margin-left: -8px;
      cursor: pointer;
      transition: all 0.3s;
      &:hover {
        background: $color-default-hover;
        :deep(.svg-icon) {
          transition: all 0.3s;
          use {
            fill: $color-icon;
          }
        }
      }
      &:active {
        background: $color-default-active;
      }
    }
  }
}
</style>
