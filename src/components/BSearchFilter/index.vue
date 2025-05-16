<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { saveFile } from 'balala-vxe-table'
import { message } from 'ant-design-vue'
import filterItem from './item.vue'
import filterShift from './shift.vue'
import type {
  ConditionGroup,
  QueryConditionGroup,
} from './interface'
import { configFilterTag } from './index'
import { checkObjectsWithoutThirdSelectVal, filterObjectsWithoutThirdSelectVal, formatConditionData, generateUniqueConditionName, getConditionsCount, getFirstValidConditionOfGroup, parseToUIData } from '@/mixins/condition'
import { getElementOrParentWithClass } from '@/utils/dom'
import { useProjectStore } from '@/stores/modules/project'
import router from '@/router'
import { getFilterTag, setFilterTag } from '@/api/project'
import { throttle } from '@/utils'

defineOptions({ name: 'BSearchFilter' })

const props = withDefaults(defineProps<Props>(), {
  isProject: false,
})

const emits = defineEmits(['onChange'])

interface Props {
  isProject?: boolean
}

const workbenchTabkey: any = inject('workbenchTabkey', '')

const projectStore = useProjectStore()

const filterItemRef = ref()
const filterShiftGroup = ref()
const filterPopup = ref()
const filterWrapperRef = ref()

const visible = ref<boolean>(false)
const conditionData = ref<ConditionGroup>({
  conjunction: 'AND',
  conditions: [],
  conditionGroup: [],
})

const state = reactive({
  conditionTagActive: '',
  filterShowText: '',
  filterContentWidth: 628,
})

const cacheKey = computed(() => `project_list_${props.isProject ? workbenchTabkey.value : router.currentRoute.value.params.id}`)

const judegConditionStyle = computed(() => {
  return !conditionData.value.conditions.length && (conditionData.value.conditionGroup ? conditionData.value.conditionGroup.length <= 1 : true)
})

const homeFilterText = computed(() => {
  return projectStore.getFilterData(cacheKey.value)?.text || ''
})

const isShowClearCondition = computed(() => {
  const { conditions = [], conditionGroup = [] } = conditionData.value || {}
  return conditions?.length + conditionGroup?.length > 0
})

// 是否显示保存条件按钮
const isShowSaveCondition = computed(() => {
  const isShow = checkObjectsWithoutThirdSelectVal(conditionData.value)
  return isShow
})

// 获取筛选条件文案
async function getFilterText(data: any) {
  const countData = getConditionsCount(data)
  if (countData.conditionCount === 0) {
    return ''
  }
  else if (countData.conditionCount === 1) {
    const obj = await getFirstValidConditionOfGroup(data)
    return obj?.filterText as string
  }
  else {
    return `筛选·${countData.conditionCount}`
  }
}

// 重置视图
function clearOption() {
  projectStore.setFilterData(cacheKey.value, [] as any, [] as any, '')
  conditionData.value = {
    conjunction: 'AND',
    conditions: [],
    conditionGroup: [],
  }
  clearFilterTagActive()
  visible.value = false
  updateTableData(conditionData.value)
}

// 获取本地存储的筛选条件
function getFilterStoreData() {
  if (conditionData.value.conditions.length || conditionData.value.conditionGroup?.length) {
    return
  }

  const storeData = projectStore.getFilterData(cacheKey.value)
  const noCompleteData = !storeData || (!getConditionsCount(storeData.data).conditionCount && !getConditionsCount(storeData.data).groupsCount)

  if (noCompleteData) {
    const conditions = props.isProject && !configFilterTag.value.length
      ? [{
          oneSelectVal: null,
          twoOptions: [],
          twoSelectVal: null,
          thirdSelectVal: [],
          isOpen: true,
        }]
      : []
    conditionData.value = {
      conjunction: 'AND',
      conditions,
      conditionGroup: [],
    }
  }
  else {
    conditionData.value = storeData.data
    updateTableData(conditionData.value, false)
  }
}

async function renderData(postData: QueryConditionGroup) {
  const renderData = parseToUIData(postData)
  conditionData.value = renderData

  if (!renderData || (!getConditionsCount(renderData).conditionCount && !getConditionsCount(renderData).groupsCount)) {
    conditionData.value = {
      conjunction: 'AND',
      conditions: [],
      conditionGroup: [],
    }
  }

  await setFilterData(renderData, postData)
  clearFilterTagActive()
  updateTableData(renderData)
}

// 筛选数据发生变化
async function onChangeFilterData(options: any = {}) {
  const defaultOptions = {
    renderData: {},
    isClearFilterTag: false,
    isUpdateTable: true,
  }
  // 合并提供的选项和默认选项
  const finalOptions = { ...defaultOptions, ...options }
  const { renderData, isClearFilterTag, isUpdateTable } = finalOptions

  // 清空筛选组高亮
  if (isClearFilterTag) {
    clearFilterTagActive()
  }
  // 设置筛选数据
  conditionData.value = renderData
  const postData = formatConditionData(renderData)
  await setFilterData(renderData, postData)
  // 更新表格
  if (isUpdateTable) {
    updateTableData(conditionData.value)
  }
}

// 更新
async function updateTableData(renderData: ConditionGroup, isChange: boolean = true) {
  emits('onChange', isChange)
}

// 设置本地筛选数据
async function setFilterData(renderData: ConditionGroup, postData: QueryConditionGroup) {
  const texts = await getFilterText(renderData) || ''
  projectStore.setFilterData(cacheKey.value, renderData, postData, texts)
}

function getFilterContentWidth() {
  requestAnimationFrame(() => {
    const filterWrapper = filterWrapperRef.value
    let width = filterWrapper ? filterWrapper.clientWidth : 0

    if (width < 600)
      width = 628

    state.filterContentWidth = width
  })
}

// 保存条件 生成新的筛选组
const saveFilterData = throttle(async () => {
  const conditionFilterObj: { [key: string]: string } = {}
  const workTab = projectStore.getHomeTabData()
  const key = `condition_${props.isProject ? workTab : router.currentRoute.value.params.id}`

  // 过滤出没有选择条件的选项
  const filterConditionData = filterObjectsWithoutThirdSelectVal(conditionData.value)

  const newConditionName = generateUniqueConditionName(configFilterTag.value)
  // 这里可以添加将新条件添加到条件列表的逻辑
  const filterItem = {
    id: Math.random().toString(36).substring(2, 16),
    name: `${newConditionName}`,
    conditionData: filterConditionData,
    isEdit: false,
  }
  configFilterTag.value.unshift(filterItem)
  conditionFilterObj[key] = JSON.stringify(configFilterTag.value)
  await setFilterTag(conditionFilterObj)
  message.success('筛选组保存成功', 2)
}, 600)

// 清除筛选组id
function clearFilterTagActive() {
  if (filterShiftGroup.value) {
    filterShiftGroup.value && filterShiftGroup.value.clearConditionTagActive()
  }
  else {
    const key = `condition_${props.isProject ? workbenchTabkey.value : router.currentRoute.value.params.id}`
    projectStore.setProjectFilterTagId(key, '')
  }
}

// 获取筛选组数据
async function getFilterTagData() {
  const key = `condition_${props.isProject ? workbenchTabkey.value : router.currentRoute.value.params.id}`
  const res = await getFilterTag([key])
  try {
    configFilterTag.value = JSON.parse(res.data[key]) || []
  }
  catch (error) {
    console.log('error', error)
    configFilterTag.value = []
  }
}

async function updateOpen(filterPopupShow: boolean) {
  if (filterPopupShow) {
    configFilterTag.value = []
    await getFilterTagData()
    getFilterStoreData()
  }
}

// 当筛选项发生改变时, 重置筛选组宽度
watch(() => conditionData, () => {
  getFilterContentWidth()
}, { deep: true })

watch(cacheKey, () => {
  setTimeout(() => {
    conditionData.value = {
      conjunction: 'AND',
      conditions: [],
      conditionGroup: [],
    }
  }, 100)
})

// 处理筛选组点击删除会关闭筛选弹窗
onClickOutside(filterPopup, (event: Event) => {
  const target = event.target as unknown as HTMLModElement
  const isModal = getElementOrParentWithClass(target, 'ant-modal')
  const isDrop = getElementOrParentWithClass(target, 'ant-popover')
  const isTooltip = getElementOrParentWithClass(target, 'ant-tooltip')
  if (isModal || isDrop || isTooltip) {
    return
  }
  if (visible.value)
    visible.value = false
})

defineExpose({
  clearOption,
  renderData,
})
</script>

<template>
  <a-popover
    :open="visible"
    placement="bottomLeft"
    :align="{ offset: [0, -4] }"
    trigger="click"
    :destroy-tooltip-on-hide="false"
    overlay-class-name="pop-order project-filter-popover-box-shadow filter-sort-style"
    @open-change="updateOpen"
  >
    <template #content>
      <div ref="filterPopup" class="filter-container">
        <div class="order-title pfm color-title line14 mb16">
          快速筛选
        </div>
        <filter-shift
          ref="filterShiftGroup"
          :is-project="isProject"
          :width="state.filterContentWidth"
          @on-change-filter-data="onChangeFilterData"
        />
        <div ref="filterWrapperRef" class="filter-wrapper" :class="{ 'filter-no-condition': judegConditionStyle }">
          <filter-item
            ref="filterItemRef"
            :data="conditionData"
            :is-project="isProject"
            @on-change-filter-data="onChangeFilterData"
          >
            <template #footer>
              <div class="condition-control">
                <p v-show="isShowSaveCondition" class="order-clear item" @click="saveFilterData">
                  保存条件
                </p>
                <p v-show="isShowClearCondition" class="order-clear item" @click="clearOption">
                  清空条件
                </p>
              </div>
            </template>
          </filter-item>
        </div>
      </div>
    </template>
    <!-- 单条件单选 -->
    <div class="item flex-row-center" :class="homeFilterText && 'active'" @click="visible = !visible">
      <svg-icon name="filter" size="16" />
      <p class="name ml4 flex-one ss-line-1" :class="{ pr0: homeFilterText }">
        <b-ellipsis-text :content="homeFilterText || '筛选'">
          <span>{{ homeFilterText || '筛选' }}</span>
        </b-ellipsis-text>
      </p>
    </div>
  </a-popover>
</template>

<style lang="scss">
.filter-tag-drop-edit {
  .ant-popover-content {
    opacity: 0;
    display: none;
  }
}
.filter-drop-down-control-box {
  .ant-popover-content {
    .ant-popover-inner {
      width: 64px;
      height: 32px;
      border-radius: 4px;
      padding: 8px;
      background: #fff;
      border: 1px solid $tool-drop-box-border;
      box-shadow: $tool-drop-box-shadow;
      position: relative;
      .filter-tag-control {
        display: flex;
        justify-content: space-between;
      }
      &:before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 1px;
        height: 14px;
        background-color: $color-border-main;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.condition-control {
  display: flex;
  justify-content: end;
  margin-top: -32px;
  min-height: 32px;
  .item {
    display: flex;
    align-items: center;
    &:first-child {
      position: relative;
      margin-right: 16px;
      &:after {
        content: '';
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: -8px;
        width: 1px;
        height: 16px;
        background: $color-border-main;
      }
    }
  }
}
.filter-container {
  display: flex;
  flex-direction: column;
}
.filter-wrapper {
  align-self: flex-start;
}
.pop-order .order-ul {
  margin: 0 !important;
}
</style>
