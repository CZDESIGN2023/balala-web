<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref } from 'vue'
import draggable from 'vuedraggable'
import dayjs from 'dayjs'
import panelDescribe from '../panelDescribe.vue'
import introItem from '../components/introItem.vue'
import { delIntroConfig, getIntroConfig, getIntroFilterCount, getProjectCount, setIntroConfig } from '@/api/project'
import router from '@/router'
import filterItem from '@/components/BSearchFilter/item.vue'
import { formatConditionData, parseToUIData } from '@/mixins/condition'
import { deepCopy } from '@/utils'
import { useUserStore } from '@/stores/modules/user'
import { usePermission } from '@/hooks/usePermission'
import type {
  ConditionGroup,
} from '@/components/BSearchFilter/interface'
import type { SvgIcon } from '@/components/SvgIcon'
import { Perm } from '@/enum/permission'

const handleChangeTab: Function = inject('handleChangeTab') as Function
const handleChangeFollow: Function = inject('handleChangeFollow') as Function

const { userInfo } = useUserStore()
const { checkPerm } = usePermission()

// 存储进入页面时的数据
const temporyData = {
  desc: '',
  value: {} as ConditionGroup,
}
const progressRanges = [
  { threshold: 59, color1: '#FFC300', color2: '#FF9800', msg: '当前项目进度 0% ≤ 一般 ≤ 59%', status: '一般' },
  { threshold: 79, color1: '#00FF99', color2: '#BBFF00', msg: '当前项目进度 60% ≤ 健康 ≤ 79%', status: '健康' },
  { threshold: 94, color1: '#00E6FF', color2: '#00FF99', msg: '当前项目进度 80% ≤ 良好 ≤ 94%', status: '良好' },
  { threshold: 100, color1: '#1D74F5', color2: '#00E6FF', msg: '当前项目进度 95% ≤ 优秀 ≤ 100%', status: '优秀' },
]

const state = reactive({
  isLoading: false,
  isDraging: false,
  resetBtnShow: false,
  editName: '',
  editCount: 0,
  isEditName: false,
})

const filterItemRef = ref()
const editNameInputRef = ref()

// 当前操作的筛选组
const activeIndex = ref<number>(-1)
// 项目进度
const progressMessage = ref()
// 控制弹窗显示隐藏
const controlVisbleArr = ref([false, false, false, false, false])
// 筛选支持的一级目录
const supportOneSelect = ref([
  'work_item_flow_id',
  'work_item_status',
  'plan_time',
])
const conditionList = ref([
  {
    desc: '',
    value: {} as ConditionGroup,
    type: '1',
    count: 0,
  },
  {
    desc: '',
    type: 'completed',
    value: {} as ConditionGroup,
    count: 0,
  },
  {
    desc: '',
    type: 'lateed',
    value: {} as ConditionGroup,
    count: 0,
  },
  {
    desc: '',
    type: 'total',
    value: {} as ConditionGroup,
    count: 0,
  },
  {
    desc: '我的关注',
    type: 'followed',
    value: {
      conditionGroup: [],
      conditions: [
        {
          field: 'followers',
          operator: 'IN',
          spaceId: '0',
          values: [userInfo.id],
        },
      ],
      conjunction: 'AND',
    },
    count: '0',
  },
])

const creatorOrSuperManager = computed(() => {
  const result = checkPerm(Perm.EditIntroShift)
  return result
})

// 初始化数据
async function init() {
  const spaceId = router.currentRoute.value.params.id as string
  state.isLoading = true
  // 获取筛选组数据
  const res = await getIntroConfig({
    spaceId,
    keys: [
      'space_workbench_count_conditions',
      'overview_order',
    ],
  })
  const conditionData = JSON.parse(res.data.space_workbench_count_conditions)
  const conditionGroups = [
    ...conditionData.map((item: any) => item.value),
    {
      conjunction: 'AND',
      conditionGroup: [],
      conditions: [
        {
          field: 'followers',
          operator: 'IN',
          spaceId: '0',
          values: [userInfo.id],
        },
      ],
    },
  ]
  // 获取筛选组关联任务数
  const countArr = await getCount(conditionGroups)
  // 获取项目进度
  const progressRes = await getProjectCount(spaceId)
  progressMessage.value = getProgressData(progressRes.data)

  state.isLoading = false
  // 整合数据
  conditionList.value.forEach((element, index) => {
    if (conditionData[index]) {
      element.value = parseToUIData(conditionData[index].value)
      element.count = countArr[index].value
      element.desc = conditionData[index].desc
    }
    if (element.type === 'followed') {
      element.count = countArr[index].value
    }
  })
}

function showFilterPopup(event: any, index: number) {
  controlVisbleArr.value[index] = !controlVisbleArr.value[index]

  activeIndex.value = index
  // 存储面板打开时的数据
  temporyData.value = deepCopy(conditionList.value[index].value)
  temporyData.desc = deepCopy(conditionList.value[index].desc)

  state.editName = conditionList.value[index].desc
  state.editCount = conditionList.value[index].count as number
}

// 弹窗开启关闭
function filterPopupChange(isShow: any, index: number) {
  if (!isShow) {
    resetFilterData()
    activeIndex.value = -1
    controlVisbleArr.value[index] = false
  }
}

// 筛选条件变化
async function onChangeFilterData(options: any = {}) {
  const { notCloseReset } = options
  // 更新当前数字
  const conditionGroups = formatConditionData(options.renderData)
  const countArr = await getCount([conditionGroups])
  state.editCount = countArr[0].value

  // 更新当前筛选数据
  conditionList.value[activeIndex.value].value = options.renderData

  if (!notCloseReset) {
    state.resetBtnShow = true
  }
}

// 排序变化
function conditionListChange() {
  saveFilterData()
}

// 重置
async function resetFilterData() {
  // 重置描述和筛选数据
  conditionList.value[activeIndex.value].value = temporyData.value
  conditionList.value[activeIndex.value].desc = temporyData.desc
  // 重置显示数量
  const countArr = await getCount([formatConditionData(temporyData.value)])
  state.editCount = countArr[0].value

  state.isEditName = false
  state.resetBtnShow = false
}

// 保存
async function saveFilterData() {
  const spaceId = router.currentRoute.value.params.id as string
  if (conditionList.value[activeIndex.value]) {
    conditionList.value[activeIndex.value].desc = state.editName
    conditionList.value[activeIndex.value].count = state.editCount
  }

  const conditionData = conditionList.value.filter((item: any) => item.type !== 'followed').map((item: any) => {
    return {
      value: formatConditionData(item.value),
      desc: item.desc,
    }
  })
  // 更新配置
  await setIntroConfig({
    spaceId,
    configs: { space_workbench_count_conditions: JSON.stringify(conditionData) },
  })
  state.isEditName = false

  controlVisbleArr.value[activeIndex.value] = false
}

function linkToTable(element: any, index: number) {
  const { type } = element

  if (type === 'followed') {
    handleChangeFollow && handleChangeFollow(conditionList.value[index].value)
    return
  }

  const item = formatConditionData(conditionList.value[index].value as ConditionGroup)
  item.conditions.forEach((item: any) => {
    if (item.field === 'plan_time' && item.operator === 'LT') {
      item.values = getTodayTime()
    }
  })

  handleChangeTab && handleChangeTab(item)
}

function editNameInputBlur() {
  if (!state.editName) {
    state.editName = temporyData.desc
  }
  state.isEditName = false
}

function editNameInputShow() {
  state.isEditName = true
  setTimeout(() => {
    editNameInputRef.value && editNameInputRef.value.focus()
  }, 30)
}

function getProgressData(data: any) {
  const completeRate = Number(data.completeRate)
  const processingAndExpiredRate = Number(data.processingAndExpiredRate)

  if (processingAndExpiredRate >= 40) {
    return {
      color1: '#FF9800',
      color2: '#FF1A00',
      val: completeRate,
      msg: '异常  逾期任务数量/任务总数/100 ≥ 40%',
      status: '异常',
    }
  }

  const range = progressRanges.find(r => completeRate <= r.threshold)
  if (range) {
    return {
      color1: range.color1,
      color2: range.color2,
      val: completeRate,
      msg: range.msg,
      status: range.status,
    }
  }

  return {
    color1: '#FF9800',
    color2: '#FF1A00',
    val: 0,
    msg: '异常',
    status: '异常',
  }
}

// 获取筛选组关联任务数
async function getCount(conditionGroups: any) {
  const spaceId = router.currentRoute.value.params.id as string
  const res = await getIntroFilterCount({
    spaceId,
    conditionGroups,
  })

  return res.data.results
}

// 用来复原最早的数据, 调试用
async function fixData() {
  const spaceId = router.currentRoute.value.params.id as string
  await delIntroConfig({
    spaceId,
    keys: ['space_workbench_count_conditions'],
  })
}

// 获取本周时间周期
function getTodayTime() {
  const startTime = dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss')
  const endTime = dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss')

  return [startTime, endTime]
}

onMounted(() => {
  init()
})

defineExpose({
})
</script>

<template>
  <introItem class="w-full">
    <div>
      <div class="panel skeleton-style" :class="{ 'is-draging': state.isDraging }">
        <div class="panel-condition">
          <draggable
            v-model="conditionList"
            class="condition-list"
            drag-class="drag-item"
            chosen-class="choose-item"
            item-key="type"
            :force-fallback="true"
            :fallback-on-body="true"
            :animation="400"
            handle=".handle"
            @start="state.isDraging = true"
            @end="state.isDraging = false"
            @change="conditionListChange"
          >
            <template #item="{ element, index }">
              <transition-group name="slide" tag="div" class="transition-item flex-column-center select-none" :class="{ active: activeIndex === index && controlVisbleArr[index] }" @click="linkToTable(element, index)">
                <div :key="element.type">
                  <a-skeleton :paragraph="false" :loading="state.isLoading" active>
                    <div :key="element.type" class="item flex-column-center">
                      <svg-icon
                        v-if="creatorOrSuperManager"
                        class="drag-icon handle"
                        name="drag_icon"
                        size="16"
                        @click.stop
                      />
                      <a-popover
                        :open="controlVisbleArr[index]"
                        placement="rightTop"
                        trigger="click"
                        :align="{ offset: [-35, 25] }"
                        overlay-class-name="pop-order project-filter-popover-box-shadow filter-sort-style"
                        @update:open="filterPopupChange($event, index)"
                      >
                        <template #content>
                          <div class="filter-container">
                            <div class="order-title pfm color-title line14 mb16">
                              <div>自定义指标</div>
                              <div class="close-icon" @click="controlVisbleArr[index] = false">
                                <SvgIcon name="close2" color="#333" size="16" />
                              </div>
                            </div>
                            <div class="filter">
                              <div class="filter-desc">
                                <div class="desc-count">
                                  {{ state.editCount }}
                                </div>
                                <div class="desc-name">
                                  <input
                                    v-if="state.isEditName"
                                    ref="editNameInputRef"
                                    v-model="state.editName"
                                    placeholder="请输入统计名称"
                                    @blur="editNameInputBlur"
                                  >
                                  <div v-else class="name-item" @click="editNameInputShow">
                                    <div class="name">
                                      {{ state.editName }}
                                    </div>
                                    <svg-icon class="flex-shrink-0 ml4" name="painting" size="16" color="#808080" />
                                  </div>
                                </div>
                              </div>
                              <filter-item
                                ref="filterItemRef"
                                :data="element.value"
                                :is-project="false"
                                :is-support-group="false"
                                add-text="添加汇总条件"
                                :support-one-select="supportOneSelect"
                                @on-change-filter-data="onChangeFilterData"
                              >
                                <template #footer>
                                  <div class="footer-list">
                                    <div v-if="state.resetBtnShow" class="reset" @click="resetFilterData">
                                      重置
                                    </div>
                                    <div class="save" @click="saveFilterData">
                                      保存
                                    </div>
                                  </div>
                                </template>
                              </filter-item>
                            </div>
                          </div>
                        </template>
                        <div v-if="element.type !== 'followed' && creatorOrSuperManager" class="panel-menu" @click.stop="showFilterPopup($event, index)">
                          <svg-icon
                            class="menu-icon"
                            name="panel_menu"
                            size="16"
                          />
                        </div>
                      </a-popover>
                      <div class="count pfm-smoothing">
                        {{ Number(element.count) > 9999 ? '9999+' : element.count }}
                      </div>
                      <div class="name">
                        {{ element.desc }}
                      </div>
                    </div>
                  </a-skeleton>
                </div>
              </transition-group>
            </template>
          </draggable>
          <div class="condition-line" />
          <div class="condition-chart" @click="fixData">
            <el-tooltip
              v-if="progressMessage"
              trigger="hover"
              :content="progressMessage.msg"
              effect="dark"
              placement="top"
              popper-class="intro-process-tooltip-style"
            >
              <BCircleProcess :progress-data="progressMessage" />
            </el-tooltip>
          </div>
        </div>
      </div>
      <panelDescribe v-bind="$attrs" />
      <!-- <BTestLineChart /> -->
    </div>
  </introItem>
</template>

<style lang="scss" scoped>
.filter-container {
  .order-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .close-icon {
      cursor: pointer;
    }
  }
}
.filter-desc {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 24px;
  min-height: 106px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f2f3f5;
  .desc-name {
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    input {
      outline: none;
      width: 109px;
      height: 32px;
      border-radius: 6px;
      padding: 0 8px;
      border: 1px solid #0096ff;
      box-shadow: 0px 0px 0px 2px #bbdfff;
      &::placeholder {
        font-size: 12px; /* 修改为你需要的字体大小 */
      }
    }
    .name-item {
      font-size: 14px;
      line-height: 1;
      color: #808080;
      display: flex;
      align-items: center;
      padding: 7px 15px;
      border: 1px solid transparent;
      border-radius: 6px;
      cursor: text;
      &:hover {
        border: 1px solid #edeef0;
      }
    }
  }
  .desc-count {
    margin-bottom: 1px;
    font-size: 28px;
    line-height: 28px;
    color: #333;
  }
}
.footer-list {
  font-size: 14px;
  display: flex;
  justify-content: end;
  margin-top: 16px;
  &:after {
    content: '';
    display: block;
    height: 20px; /* 间距大小 */
  }
  .reset {
    height: 32px;
    line-height: 32px;
    padding: 0 12px;
    color: #333;
    border: 1px solid #edeef0;
    margin-right: 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  .save {
    height: 32px;
    line-height: 32px;
    padding: 0 12px;
    color: #fff;
    border-radius: 4px;
    background: #1d74f5;
    cursor: pointer;
    // transform: translateY(48px);
  }
}
:global(.intro-process-tooltip-style) {
  max-width: 330px !important;
  margin-bottom: -20px;
}

.choose-item.sortable-ghost {
  border: 1px solid $color-primary !important;
  background-color: #fff !important;
  .item {
    opacity: 0.3;
  }
}

.drag-item {
  width: 140px;
  height: 102px;
  border-radius: 8px;
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.06);
  .drag-icon {
    position: absolute;
    left: 8px;
    top: 8px;
    cursor: grab;
    opacity: 1;
  }
  .panel-menu {
    opacity: 0;
  }
  .name {
    font-size: 14px;
    color: #999;
    line-height: 1;
    margin-top: 12px;
  }
  .count {
    font-size: 28px;
    line-height: 1;
  }
}

.panel {
  &.is-draging {
    cursor: grabbing;
    * {
      cursor: grabbing;
    }
  }
  .panel-condition {
    display: flex;
    align-items: center;
    .condition-list {
      flex: 1;
      display: flex;
      :deep(.ant-skeleton) {
        .ant-skeleton-content {
          .ant-skeleton-title {
            width: 102px;
            height: 88px !important;
            border-radius: 8px;
          }
        }
      }
      .transition-item {
        flex: 1;
        margin-right: 16px;
        border-radius: 8px;
        position: relative;
        border: 1px solid transparent;
        min-height: 102px;
        &.active {
          background-color: $tool-hover-bg;
          .item {
            .drag-icon {
              opacity: 1;
            }
            .panel-menu {
              opacity: 1;
              svg {
                color: $color-primary;
              }
            }
          }
        }
        &:last-of-type {
          margin-right: 0;
        }
        &:hover {
          background-color: $tool-hover-bg;
          .item {
            .drag-icon {
              opacity: 1;
            }
            .panel-menu {
              opacity: 1;
            }
          }
        }
        &:active {
          background-color: $tool-click-bg;
        }
        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          .drag-icon {
            opacity: 0;
            position: absolute;
            left: 8px;
            top: 8px;
            cursor: grab;
            color: #999;
            &:hover {
              color: #666 !important;
            }
          }
          .panel-menu {
            opacity: 0;
            position: absolute;
            right: 4px;
            top: 4px;
            width: 24px;
            height: 24px;
            background-color: #fff;
            border-radius: 8px;
            border: 1px solid $tool-drop-box-border;
            box-shadow: $tool-drop-box-shadow;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            svg {
              color: #666;
            }
            &:hover {
              svg {
                color: $color-primary;
              }
            }
            &:active {
              color: #666;
            }
          }
          .name {
            font-size: 14px;
            color: #999;
            line-height: 1;
            margin-top: 12px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            max-width: 72px;
          }
          .count {
            font-size: 28px;
            line-height: 1;
          }
        }
      }
    }
    .condition-line {
      width: 24px;
      height: 102px;
      background: linear-gradient(
        270deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.02) 100%
      );
      margin-left: 58px;
      box-sizing: border-box;
      border-width: 0px 0px 0px 1px;
      border-style: solid;
      border-image: linear-gradient(
          180deg,
          rgba(242, 243, 245, 0) 0%,
          #f2f3f5 49%,
          rgba(242, 243, 245, 0) 100%
        )
        0 1 0 0;
    }
    .condition-chart {
      width: 192px;
      height: 128px;
      margin-left: 21px;
      margin-right: 45px;
    }
  }
}
</style>
