<script lang="ts" setup>
import { ref } from 'vue'
import { getTextLength } from '@/utils'

// 定义Props接口
interface Props {
  title: string
  placeholder: string
}

// 使用withDefaults为Props设置默认值
const props = withDefaults(defineProps<Props>(), {
  title: '',
  placeholder: '',
})

// 定义Emits
const emit = defineEmits(['onAdd'])

// 定义响应式变量
const visibleAddPopover = ref(false)
const addName = ref('')
const errorText = ref('')

function handleCancel() {
  vaildate('')
  addName.value = ''
  visibleAddPopover.value = false
}

function handleBlur() {
  const length = getTextLength(addName.value.trim())
  if (!addName.value) {
    vaildate(`${props.title}名称不能为空`)
    return
  }
  if (length < 2 || length > 14) {
    vaildate('请输入有效格式(2 ~ 14个字符)')
  }
  else {
    addName.value = addName.value.trim()
    vaildate('')
  }
}

function handleConfirm() {
  if (!addName.value) {
    handleCancel()
    return
  }
  emit('onAdd', addName.value.trim())
}

// 校验
function vaildate(message: string) {
  errorText.value = message
}

defineExpose({
  vaildate,
  handleCancel,
})
</script>

<template>
  <div>
    <BPopover
      v-model:visible="visibleAddPopover"
      placement="bottom-start"
      :width="368"
      trigger="click"
      popper-class="intro-module-add-popover"
      :show-arrow="false"
      transition="zoom-top-left"
      @cancel="handleCancel"
      @confirm="handleConfirm"
    >
      <template #reference>
        <button class="add-btn flex-row-center text12 w55 h26 br4 pl8 pr8 gap2 pointer ml12">
          <svg-icon name="add-line" size="12" color="#333333" />添加
        </button>
      </template>
      <div class="add-box">
        <div class="title h16 flex-row-between mb24">
          <p class="text14 title-color pfm font-smoothing">
            添加{{ props.title }}
          </p>
          <div class="close-icon w16 h16 br4 pointer" @click="handleCancel">
            <svg-icon name="popover-close" size="16" color="#333333" />
          </div>
        </div>
        <b-input2
          v-model:value="addName"
          :placeholder="props.placeholder"
          :error="errorText.length > 0"
          size="large"
          @blur="handleBlur"
        />
        <p class="error-color mt8 text13">
          {{ errorText }}
        </p>
      </div>
    </BPopover>
  </div>
</template>

<style lang="scss" scoped>
.add-btn {
  background: #ffffff;
  border: 0;
  &:hover {
    background: $color-default-hover;
  }
  &:active {
    background: $color-default-active;
  }
}

.add-box {
  .close-icon {
    &:hover {
      background: $color-default-hover;
    }
    &:active {
      background: $color-default-active;
    }
  }
}
</style>

<style lang="scss">
.el-popper.intro-module-add-popover {
  border: 1px solid $tool-drop-box-border;
  box-shadow: $tool-drop-box-shadow2;
  background: #fff !important;
  padding: 24px;
  button {
    border-radius: 4px;
    padding: 4px 11.22px;
  }
  .cancel-btn {
    border-color: #edeef0;
  }
}
</style>
