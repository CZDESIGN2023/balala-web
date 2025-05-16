<script lang="ts" setup>
import { computed, markRaw, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import spaceBasic from './basic.vue'
import spaceModule from './module.vue'
import versionModule from './version.vue'
import userModule from './user.vue'
import processModule from './process.vue'
import operationModule from './operation.vue'
import { Perm } from '@/enum/permission'
import { usePermission } from '@/hooks/usePermission'

defineOptions({ name: 'ProjectManage' })

withDefaults(defineProps<Props>(), {
  // 是否显示弹框
  dialogVisible: false,
  spaceId: 0,
})

/** EMITS */

const emits = defineEmits(['onClose'])

interface Props {
  dialogVisible: boolean
  spaceId?: number
}

/** PROPS */

const { checkPerm } = usePermission()

/** DATA */
const currentType = ref<string>('basic')
const componentProps = ref<{ [key: string]: any }>({})

// drawer 配置
const drawerConfig = reactive({
  width: 1200,
  closable: false,
  push: {
    distance: 0,
  },
})
const tabLoading = ref<boolean>(false)
// 动态组件
const currentComponent = shallowRef(spaceBasic) as any
function handleLoading(val: boolean) {
  tabLoading.value = val
}
const componentData = reactive([
  {
    name: '基础设置',
    type: 'basic',
    icon: 'space-basic',
    component: markRaw(spaceBasic),
  },
  {
    name: '模块管理',
    type: 'module',
    icon: 'space-module',
    component: markRaw(spaceModule),
  },
  {
    name: '版本管理',
    type: 'version',
    icon: 'space-version',
    component: markRaw(versionModule),
  },
  {
    name: '成员管理',
    type: 'user',
    icon: 'space-user',
    component: markRaw(userModule),
  },
  {
    name: '流程管理',
    type: 'process',
    icon: 'space-process',
    isBeta: true,
    component: markRaw(processModule),
  },
  {
    name: '操作日志',
    type: 'operation',
    icon: 'space-operation',
    hide: !checkPerm(Perm.SpaceOperationLogRouter),
    component: markRaw(operationModule),
  },
])

// 切换组件
function changeComponent(type: string = '', refresh: boolean = false) {
  if (tabLoading.value && !refresh)
    return

  currentType.value = type

  const component = componentData.find(item => item.type === type)?.component
  currentComponent.value = component
}

const calcCurrentType = computed(() => {
  return `main-${currentType.value}`
})

// 关闭弹框
async function handleClose() {
  emits('onClose')
}

// watch(
//   () => props.dialogVisible,
//   (isShow) => {
//     if (!isShow)
//       return
//     componentData.forEach((item) => {
//       if (item.type === 'operation')
//         item.hide = !checkPerm(Perm.SpaceOperationLogRouter)
//     })
//   },
//   {
//     immediate: true,
//   },
// )

defineExpose({
  changeComponent,
})
</script>

<template>
  <div class="b-project-space">
    <a-drawer
      root-class-name="project-space-drawer"
      destroy-on-close
      :closable="drawerConfig.closable"
      :open="dialogVisible"
      :width="drawerConfig.width"
      :push="drawerConfig.push"
      :z-index="2200"
      @close="handleClose"
    >
      <div class="top-box flex-row-between">
        <div class="flex-row-start">
          <div class="text18 title mr32 lh1 pfm-smoothing">
            项目管理
          </div>
          <div class="tab flex-row-start">
            <div
              v-for="item in componentData"
              :key="item.icon"
              class="tab-item mr12 pointer flex-row-center"
              :class="{ 'curry-item pfm': currentType === item.type, 'hide': item.hide }"
              @click="changeComponent(item.type)"
            >
              <svg-icon
                :name="item.icon"
                size="16"
                :color="currentType === item.type ? '#1D74F5' : '#666666'"
              />
              <span class="tab-item-name ml4 text14 lh1"> {{ item.name }}</span>
              <div v-if="item.isBeta" class="beta">
                Beta
              </div>
            </div>
          </div>
        </div>
        <div class="close flex-row-center pointer ml16" @click="handleClose">
          <svg-icon name="drawer-close" color="#333" size="16" />
        </div>
      </div>
      <div :class="calcCurrentType" class="main">
        <template v-if="tabLoading">
          <b-table-loading />
        </template>
        <component
          :is="currentComponent"
          v-bind="componentProps"
          @handle-loading="handleLoading"
        />
      </div>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.project-space-drawer {
  width: 100%;
  .top-box {
    padding: 24px 24px 0 24px;
    border-bottom: 1px solid $color-border-main;
    position: sticky;
    background: #ffffff;
    z-index: 10;
    top: 0;
    padding: 16px 24px;
    position: relative;
    min-height: 64px;
    .title {
      color: #333;
      position: relative;
      &:before {
        content: '';
        position: absolute;
        top: 50%;
        right: -20.5px;
        transform: translateY(-50%);
        width: 1px;
        height: 16px;
        background-color: #edeef0;
      }
    }
  }
  .close {
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    border: 1px solid $color-border-main;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
}

.tab-item {
  padding: 8px;
  border-radius: 6px;
  color: #333333;
  position: relative;
  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
  &.hide {
    display: none;
  }
  .beta {
    position: absolute;
    width: 38px;
    height: 17px;
    border-radius: 12px;
    right: -8px;
    top: -10px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 3px 6px 2px 6px;
    gap: 10px;
    background: #ffffff;
    border: 1px solid #f7f8fa;
    box-shadow: $tool-drop-box-shadow;
    z-index: 2;
    font-size: 12px;
    color: #9e9e9e;
  }
}

.curry-item {
  border-radius: 6px;
  background: rgba(29, 116, 245, 0.08);
  color: #1d74f5;
  &:hover {
    background: rgba(29, 116, 245, 0.08);
  }
}

.divider {
  border-bottom: 1px solid $color-border-main;
}

.main-basic {
  height: calc(100% - 205px);
}

.main {
  height: calc(100% - 158px);
  &.main-operation {
    height: calc(100% - 91px);
  }
}
</style>

<style lang="scss">
.project-space-drawer {
  z-index: 999;
  .ant-drawer-body {
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    .main-process {
      flex: 1;
    }
  }
}
</style>
