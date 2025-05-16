<script lang="ts" setup>
import { computed, inject, reactive } from 'vue'
import { SvgIcon } from '../SvgIcon'
import type {
  ConditionGroup,
  FilterOneOptions,
  TSDate,
  TSTwoItem,
} from './interface'
import { oneList, twoList } from './config'
import today from './today.vue'
import { hasValidCondition, projectAddIcon } from '@/mixins/condition'
import { isEmptyObject } from '@/utils'
import { FilterEnum } from '@/enum'

defineOptions({ name: 'ItemIndex' })

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    conjunction: 'AND',
    conditions: [],
    conditionGroup: [],
  }),
  supportOneSelect: () => {
    return ['work_object_id', 'directors', 'user_id', 'participators', 'priority', 'work_item_status', 'work_item_flow_id', 'version_id', 'plan_time', 'created_at', 'plan_complete_at']
  },
  isSupportGroup: true,
  addText: '添加筛选条件',
  isProject: false,
})
const emits = defineEmits(['onChangeFilterData'])
interface Props {
  data: ConditionGroup
  addText?: string
  isProject?: boolean
  isSupportGroup?: boolean
  supportOneSelect?: string[]
}

const state = reactive({
  currentLiIndex: -1,
  visibleGroupAdd: false,
})

const filterData = computed(() => {
  return props.data
})

const oneSelectList = computed(() => {
  return oneList.filter((item: any) => props.supportOneSelect.includes(item.value))
})

// 是否显示且或切换按钮
const isShowConjunction = computed(() => {
  const { conditions = [], conditionGroup = [] } = filterData.value || {}
  return conditions.length + conditionGroup.length > 1
})

// 且 或 文字
const conjunctionLabel = computed(() => (filterData.value.conjunction === 'OR' ? '或' : '且'))

// 是否存在条件列表
const conditionsAndGroupLength = computed(() => {
  return props.data.conditions.length + (props.data.conditionGroup ? props.data.conditionGroup.length : 0)
})

function isProjectCondition(item: any) {
  if (Array.isArray(item.oneSelectVal))
    return item.oneSelectVal[1]

  else
    return item.oneSelectVal
}

function beMode(val: FilterEnum | null) {
  return !val || [FilterEnum.EQ, FilterEnum.NOT_EQ].includes(val) ? 'combobox' : 'multiple'
}

// 添加筛选条件
function addOption() {
  state.currentLiIndex = -1
  filterData.value?.conditions?.push({
    oneSelectVal: null,
    twoOptions: [],
    twoSelectVal: null,
    thirdSelectVal: [],
    isOpen: true,
  })
  changeFilterData({ isUpdateTable: false })
}

// 添加分组
function addGroup() {
  state.currentLiIndex = -1
  filterData.value?.conditionGroup?.push({
    id: new Date().getTime(),
    conjunction: 'AND',
    conditions: [
      {
        oneSelectVal: null,
        twoOptions: [],
        twoSelectVal: null,
        thirdSelectVal: [],
        isOpen: true,
      },
    ],
    conditionGroup: [],
  })
  changeFilterData({ isUpdateTable: false })
}

function oneChange(index: number, val: string | string[]) {
  let typeVal: string

  if (typeof val === 'string') {
    typeVal = val
  }
  else {
    filterData.value.conditions[index].projectVal = val[0]
    typeVal = val[1]
  }

  const relatedTwoItems = oneList.find(item => item.value === typeVal)?.twoOptions

  const filteredTwoOptions: TSTwoItem[] = relatedTwoItems
    ? relatedTwoItems.map(item => twoList.find(itm => itm.value === item)).filter(Boolean) as TSTwoItem[]
    : []

  const { thirdSelectVal = [] } = filterData.value.conditions[index]
  filterData.value.conditions[index].twoOptions = filteredTwoOptions
  filterData.value.conditions[index].twoSelectVal = filteredTwoOptions[0].value
  filterData.value.conditions[index].thirdSelectVal = []
  // 如果第3个选项没有值, 修改不刷新数据
  if (!thirdSelectVal || (Array.isArray(thirdSelectVal) && thirdSelectVal.length === 0)) {
    return
  }
  changeFilterData()
}

function twoChange(index: number, val: FilterEnum) {
  const { thirdSelectVal = [] } = filterData.value.conditions[index]
  filterData.value.conditions[index].twoSelectVal = val
  filterData.value.conditions[index].thirdSelectVal = []

  // 如果第3个选项没有值, 修改不刷新数据
  if (!thirdSelectVal || (Array.isArray(thirdSelectVal) && thirdSelectVal.length === 0)) {
    return
  }
  changeFilterData()
}

function dateChange(index: number, val: TSDate) {
  filterData.value.conditions[index].thirdSelectVal = val
  if (isEmptyObject(val))
    return

  changeFilterData({ notCloseReset: true })
}

function bondChange() {
  filterData.value.conjunction = filterData.value.conjunction === 'AND' ? 'OR' : 'AND'
  changeFilterData()
}

function delOption(index: number) {
  const { thirdSelectVal = [] } = filterData.value.conditions[index]
  filterData.value.conditions.splice(index, 1)
  if (!thirdSelectVal || (Array.isArray(thirdSelectVal) && thirdSelectVal.length === 0)) {
    return
  }

  changeFilterData()
}

/**
 * 筛选-删除组
 */
function delGroup(index: number, group: ConditionGroup) {
  const isValid = hasValidCondition(group)
  filterData.value.conditionGroup?.splice(index, 1)
  if (isValid)
    changeFilterData()
}

// 修改筛选数据
function changeFilterData(options: any = {}) {
  const defaultOptions = {
    renderData: filterData.value,
    isClearFilterTag: true,
    isUpdateTable: true,
  }
  // 合并提供的选项和默认选项
  const finalOptions = { ...defaultOptions, ...options }
  emits('onChangeFilterData', finalOptions)
}
</script>

<template>
  <div v-if="conditionsAndGroupLength" class="flex order-ul">
    <!-- 且或条件 -->
    <div v-if="isShowConjunction" class="flex-column-center filter-bond-box">
      <div class="filter-bond-item filter-bond-top" />
      <div class="flex-row-center filter-bond-center" @click="bondChange">
        {{ conjunctionLabel }}
        <div class="filter-bond-icon" />
      </div>
      <div class="filter-bond-item filter-bond-bot" :class="{ 'has-group': filterData.conditionGroup && filterData.conditionGroup.length > 0 }" />
    </div>
    <!-- 数据条件 -->
    <div class="full-100">
      <div
        v-for="(item, index) in filterData.conditions"
        :key="index"
        class="order-li flex"
        :class="{ 'del-hover': index === state.currentLiIndex }"
      >
        <BBaseCascader
          v-if="props.isProject"
          v-model:value="item.oneSelectVal"
          v-model:isOpen="item.isOpen"
          style="width: 33.3333333%; min-width: 192px"
          :options="projectAddIcon()"
          placeholder="请选择筛选项"
          :allow-clear="false"
          @change="(val: string[]) => oneChange(index, val)"
        />
        <BBaseSelectTool
          v-else
          v-model:value="item.oneSelectVal"
          v-model:isOpen="item.isOpen"
          style="width: 33.3333333%; min-width: 192px"
          placeholder="请选择筛选项"
          :is-icon="true"
          :options="oneSelectList"
          @change="(val: string) => oneChange(index, val)"
        >
          <template #option="{ label, icon }">
            <div class="flex-row-start gap8 text14">
              <SvgIcon :name="icon" size="16" color="#666666" />
              {{ label }}
            </div>
          </template>
        </BBaseSelectTool>
        <BBaseSelectTool
          v-model:value="item.twoSelectVal"
          style="width: calc(33.3333333% - 12px); min-width: 192px; margin-left: 12px"
          placeholder="运算符"
          :options="item.twoOptions"
          :disabled="!item.oneSelectVal"
          @change="(val: string) => twoChange(index, val as FilterEnum)"
        />
        <div
          v-if="['plan_time'].includes(isProjectCondition(item))"
          class="filter-input-date-style"
          style="width: calc(33.3333333% - 12px); min-width: 192px; margin-left: 12px; margin-right: 0;"
        >
          <b-input-date
            v-if="item.twoSelectVal === 'BETWEEN'"
            :info="item.thirdSelectVal"
            :is-disabled="false"
            :hide-clear="true"
            height="36px"
            attach="_"
            :show-time-tips="true"
            @on-change="(val: TSDate) => dateChange(index, val)"
          />
          <today v-else @on-change="(val: TSDate) => dateChange(index, val)" />
        </div>
        <div
          v-else-if="['created_at'].includes(isProjectCondition(item))"
          class="filter-input-date-style"
          style="width: calc(33.3333333% - 12px); min-width: 192px; margin-left: 12px; margin-right: 0;"
        >
          <b-input-date
            :info="item.thirdSelectVal"
            :is-disabled="false"
            :hide-clear="true"
            height="36px"
            attach="_"
            :show-time-tips="true"
            @on-change="(val: TSDate) => dateChange(index, val)"
          />
        </div>
        <FilterPersonSelect
          v-else-if="['directors', 'user_id', 'participators'].includes(isProjectCondition(item))"
          :key="`${item.twoSelectVal}_${item.oneSelectVal}_personSelect}`"
          style="width: calc(33.3333333% - 12px); min-width: 192px; margin-left: 12px"
          :value="item.thirdSelectVal"
          placeholder="请选择目标值"
          :disabled="!item.oneSelectVal"
          :space-id="filterData.conditions[index].projectVal"
          :dropdown-match-select-width="216"
          :max-tag-count="1"
          scroll-max-height="220"
          :show-arrow="true"
          :single="beMode(item.twoSelectVal as FilterEnum) === 'combobox'"
          class="item-person-select"
          current-label="当前登录用户"
          content-direction="column"
          size="large"
          closable
          clear-not-restore
          @update:value="(val: string[]) => {
            item.thirdSelectVal = val
            changeFilterData()
          }"
        />
        <BusinessPrioritySelect
          v-else-if="['priority'].includes(isProjectCondition(item))"
          :key="`${item.twoSelectVal}_${item.oneSelectVal}_propertySelect}`"
          v-model:value="item.thirdSelectVal"
          style="width: calc(33.3333333% - 12px); min-width: 192px; margin-left: 12px;"
          placeholder="请选择目标值"
          :is-single="beMode(item.twoSelectVal as FilterEnum) === 'combobox'"
          :disabled="!item.oneSelectVal"
          :max-tag-count="1"
          @change="changeFilterData()"
        />
        <BusinessWorkStatusSelect
          v-else-if="['work_item_status'].includes(isProjectCondition(item))"
          :key="`${item.twoSelectVal}_${item.oneSelectVal}_work_item_status}`"
          v-model:value="item.thirdSelectVal"
          style="width: calc(33.3333333% - 12px); min-width: 192px; margin-left: 12px;"
          placeholder="请选择目标值"
          :is-single="beMode(item.twoSelectVal as FilterEnum) === 'combobox'"
          :disabled="!item.oneSelectVal"
          :space-id="filterData.conditions[index].projectVal"
          :max-tag-count="1"
          @change="changeFilterData()"
        />
        <BusinessWorkFlowSelect
          v-else-if="['work_item_flow_id'].includes(isProjectCondition(item))"
          :key="`${item.twoSelectVal}_${item.oneSelectVal}_work_item_flow_id}`"
          v-model:value="item.thirdSelectVal"
          style="width: calc(33.3333333% - 12px); min-width: 192px; margin-left: 12px;"
          placeholder="请选择目标值"
          :is-single="beMode(item.twoSelectVal as FilterEnum) === 'combobox'"
          :disabled="!item.oneSelectVal"
          :space-id="filterData.conditions[index].projectVal"
          :max-tag-count="1"
          @change="changeFilterData()"
        />
        <BusinessModuleSelect
          v-else-if="['work_object_id'].includes(isProjectCondition(item))"
          :key="`${item.twoSelectVal}_${item.oneSelectVal}_work_object_id}`"
          v-model:value="item.thirdSelectVal"
          style="width: calc(33.3333333% - 12px); min-width: 192px; margin-left: 12px;"
          placeholder="请选择目标值"
          :is-single="beMode(item.twoSelectVal as FilterEnum) === 'combobox'"
          :disabled="!item.oneSelectVal"
          :space-id="filterData.conditions[index].projectVal"
          :max-tag-count="1"
          @change="changeFilterData()"
        />
        <BusinessVersionSelect
          v-else-if="['version_id'].includes(isProjectCondition(item))"
          :key="`${item.twoSelectVal}_${item.oneSelectVal}_version_id}`"
          v-model:value="item.thirdSelectVal"
          style="width: calc(33.3333333% - 12px); min-width: 192px; margin-left: 12px;"
          placeholder="请选择目标值"
          :is-single="beMode(item.twoSelectVal as FilterEnum) === 'combobox'"
          :disabled="!item.oneSelectVal"
          :space-id="filterData.conditions[index].projectVal"
          :max-tag-count="1"
          @change="changeFilterData()"
        />
        <BFormNormalSelect
          v-else
          :key="`${item.twoSelectVal}_${item.oneSelectVal}_normalSelect}`"
          v-model:value="item.thirdSelectVal"
          :type="isProjectCondition(item)"
          style="width: calc(33.3333333% - 12px); min-width: 192px; margin-left: 12px;"
          placeholder="请选择目标值"
          :is-single="beMode(item.twoSelectVal as FilterEnum) === 'combobox'"
          :disabled="!item.oneSelectVal"
          :space-id="filterData.conditions[index].projectVal"
          :max-tag-count="1"
          @change="changeFilterData()"
        />
        <a-tooltip placement="top">
          <template #title>
            <span>删除条件</span>
          </template>
          <div
            class="order-icon-close flex-row-center pointer"
            @click="delOption(index)"
            @mouseenter="state.currentLiIndex = index"
            @mouseleave="state.currentLiIndex = -1"
            @mouseup="state.currentLiIndex = -1"
          >
            <SvgIcon name="close" size="16" />
          </div>
        </a-tooltip>
      </div>
      <div class="filter-group">
        <div
          v-for="(item, index) in filterData.conditionGroup"
          :key="item.id"
          class="filter-group-wrap flex-row-center"
        >
          <div class="filter-group-item">
            <item :data="item" :is-project="props.isProject" @on-change-filter-data="changeFilterData()" />
          </div>
          <a-tooltip placement="top">
            <template #title>
              <span>删除条件组</span>
            </template>
            <div class="order-icon-close flex-row-center pointer" @click="delGroup(index, item)">
              <SvgIcon name="close" size="16" />
            </div>
          </a-tooltip>
        </div>
      </div>
    </div>
  </div>
  <div class="flex order-footer">
    <div class="flex-row-center">
      <div class="order-add flex-row-center black-4" @click="addOption">
        <div class="order-icon-add flex-row-center">
          <SvgIcon name="add" size="10" />
        </div>
        <p class="name ml4 flex-one flex-row-start">
          {{ addText }}
        </p>
      </div>
      <template v-if="isSupportGroup">
        <span class="line ml4 mr4" />
        <div
          class="order-group-add flex-row-center"
          @mouseenter="state.visibleGroupAdd = true"
          @mouseleave="state.visibleGroupAdd = false"
        >
          <SvgIcon name="filter-group-arrow" size="22" color="#1D74F5" />
          <div
            :class="{ 'creat-filter-group-show': state.visibleGroupAdd }"
            class="creat-filter-group text14 icon-color flex-row-start h32"
            @click="addGroup"
          >
            <p>添加筛选组条件</p>
          </div>
        </div>
      </template>
    </div>
  </div>
  <slot name="footer" />
</template>

<style lang="scss">
.filter-input-date-style {
  .mr16 {
    margin-right: 0 !important;
  }
  .ant-input {
    font-size: 14px !important;
  }
}
</style>

<style lang="scss" scoped>
.filter-group-wrap {
  margin-top: 16px;
}
</style>

<style lang="scss">
@import '../BSearchOrder/order.scss';
.two-sub-icon {
  span {
    margin-left: 8px;
  }
}
.filter-bond-item {
  flex: 1;
  width: 100%;
  position: relative;

  &::after {
    position: absolute;
    right: 0;
    width: 20px;
    content: '';
    border-left: 2px solid $color-border-main;
    height: calc(100% - 8px);
  }
}
.filter-bond-top::after {
  top: 8px;
  border-top: 2px solid $color-border-main;
  border-radius: 10px 0 0 0;
}
.filter-bond-bot::after {
  bottom: 8px;
  border-bottom: 2px solid $color-border-main;
  border-radius: 0 0 0 10px;
}
.filter-bond-bot {
  &.has-group::after {
    bottom: 50%;
    border-bottom: 2px solid $color-border-main;
    border-radius: 0 0 0 10px;
    transform: translateY(0%);
    height: 50%;
  }
}
.filter-bond-box {
  width: 55px;
  padding-right: 8px;
}
.filter-bond-center {
  height: 24px;
  width: 100%;
  cursor: pointer;
  border-radius: 4px;
  width: 43px;
  margin-left: -4px;
  &:hover {
    background: $tool-hover-bg;
  }
  &:active {
    background: $tool-click-bg;
  }
}
.filter-bond-icon {
  width: 5px;
  height: 8px;
  margin-left: 8px;

  &::before,
  &::after {
    display: block;
    content: '';
    border-left: 2.5px solid transparent;
    border-right: 2.5px solid transparent;
  }
  &::before {
    border-bottom: 3px solid #333;
  }
  &::after {
    margin-top: 2px;
    border-top: 3px solid #333;
  }
}

.filter-no-condition
  > .order-ul
  > .full-100
  > .filter-group
  > .filter-group-wrap {
  margin-top: 0;
}

.filter-group {
  width: 100%;
}
.filter-group-item {
  width: 100%;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid $color-border-main;
  .order-clear {
    display: none;
  }
}
</style>
