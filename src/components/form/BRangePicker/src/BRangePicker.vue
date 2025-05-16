<script lang="ts" setup>
import { inject, ref } from 'vue'
import dayjs from 'dayjs'
import type { RadioChangeEvent } from 'ant-design-vue'

interface Props {
  value: string[] | null
  separator?: string
  format?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
  separator: '~',
  format: 'YYYY/MM/DD',
})

const emit = defineEmits(['update:value'])

const rangePickerRef = ref()
const diffDays = ref()
const tooltipText = ref('')
const view = inject('view', false)

// const timeRange = computed(() => {
//   return true
// })

function customFormat(val: dayjs.Dayjs) {
  if (!props.value)
    return ''
  if (dayjs(props.value[1]).format('YYYY/MM/DD') === val.format('YYYY/MM/DD')) {
    const diffInDays = dayjs(props.value[1]).diff(dayjs(props.value[0]), 'day')
    if (diffInDays === 6) {
      diffDays.value = 7
    }
    else if (diffInDays >= 300) {
      diffDays.value = 300
    }
    return diffInDays > 300 ? '长期' : val.format(props.format)
  }
  return val.format(props.format)
}

function onRadioChange(e: RadioChangeEvent) {
  switch (e.target.value) {
    case 7:
      updateValue([dayjs().format('YYYY/MM/DD'), dayjs().add(6, 'day').format('YYYY/MM/DD')])
      break
    case 300:
      updateValue([dayjs().format('YYYY/MM/DD'), dayjs().add(1, 'year').format('YYYY/MM/DD')])
      break
  }
}

function getTextWidth(text: string, fontSize = 14): number {
  const canvas = document.createElement('canvas')
  const context: any = canvas.getContext('2d')
  context.font = `${fontSize}px sans-serif`
  context.letterSpacing = '0.02em'
  const metrics = context.measureText(text)
  return metrics.width
}

function checkShowTooltip() {
  const inputs = rangePickerRef.value.$el.querySelectorAll('input')
  let isEllipsis = false
  for (let i = 0; i < inputs.length; i++) {
    const input: HTMLInputElement = inputs[i]
    if (getTextWidth(input.value) > input.clientWidth) {
      isEllipsis = true
    }
  }
  tooltipText.value = isEllipsis ? `${inputs[0].value} ${props.separator} ${inputs[1].value}` : ''
}

function updateValue(date: string[]) {
  emit('update:value', [`${date[0]} 00:00:00`, `${date[1]} 23:59:59`])
}
</script>

<template>
  <div
    class="inline-flex"
    @mouseover="checkShowTooltip"
  >
    <a-tooltip :title="tooltipText">
      <a-range-picker
        ref="rangePickerRef"
        v-bind="$attrs"
        :value
        :separator
        value-format="YYYY/MM/DD"
        :format="customFormat"
        :bordered="false"
        :class="{ 'b-range-picker-view': view }"
        class="b-range-picker"
        @update:value="updateValue($event)"
      >
        <template #renderExtraFooter>
          <div class="ml16">
            <a-radio-group
              v-model:value="diffDays"
              :options="[{ label: '7天', value: 7 }, { label: '长期', value: 300 }]"
              @change="onRadioChange"
            />
          </div>
        </template>
      </a-range-picker>
    </a-tooltip>
  </div>
</template>

<style lang="scss">
.b-range-picker {
  &.ant-picker {
    background-color: #f7f8fa !important;
    &.ant-picker-borderless {
      border: none;
      padding: 5.5px 11px;
    }
    &.ant-picker-focused {
      background-color: white !important;
      box-shadow: 0 0 0 2px #1d74f5 inset !important;
      &:hover {
        background-color: white !important;
      }
    }
    &:hover {
      background-color: #edeef0 !important;
    }
    // 尺寸重置
    &.ant-picker-large {
      &.ant-picker-borderless {
        border: none;
        padding: 8.7px 11px;
      }
    }
    .ant-picker-active-bar {
      display: none;
    }
    .ant-picker-input > input {
      text-overflow: ellipsis;
    }
    .ant-picker-range-separator {
      padding: 0 5px;
    }
  }
}
</style>
