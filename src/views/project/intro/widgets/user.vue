<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, reactive, ref } from 'vue'
import introModuleHead from '../components/head.vue'
import rateCircle from '../components/rateCircle.vue'
import barChart from '../components/barChart.vue'
import introItem from '../components/introItem.vue'
import HoverData from '../components/hoverData.vue'
import { addProjectMember } from '@/api/project'
import { useProjectStore } from '@/stores/modules/project'
import { PRIORITY_LIST, overview_task_status } from '@/utils/constant'
import router from '@/router'
import { deepCopy } from '@/utils'
import { Perm } from '@/enum/permission'
import { usePermission } from '@/hooks/usePermission'
import { useUser } from '@/hooks/useUser'
import { useEmitter } from '@/hooks/useEmitter'
import { EmitEvent } from '@/enum/event'
import type { CreateProjectUsers, UserItem } from '@/api/project/intro/types'
import type { DateRange } from '@/api/interface/common'
import { getJumpCondition } from '@/mixins/condition'
import type { ProjectMemberListItem } from '@/api/interface'

const projectStore = useProjectStore()
const handleChangeTab: Function = inject('handleChangeTab') as Function

const moduleToolHeadRef = ref()
const inputRef = ref()

const isFullScreen = ref(false) // 是否全屏
const dataRange = ref<DateRange>({
  startTime: '',
  endTime: '',
})

const { checkPerm } = usePermission()
const { getUserList } = useUser()

const bTableRef = ref()

const state = reactive({
  memberAddDialog: false,
  memberAddList: [] as ProjectMemberListItem[],
})

const tableData = ref<UserItem[]>([]) // 表格数据

const columns = [
  {
    prop: 'userNickname',
    label: '成员名称',
    width: 199,
  },
  {
    prop: 'stats.expired',
    label: '逾期任务',
    align: 'center',
    sortable: true,
    sortBy: (row: UserItem) => {
      return [row.stats.expired, row.ranking]
    },
    width: 83,
  },
  {
    prop: 'stats.processing',
    label: '待办任务',
    align: 'center',
    sortable: true,
    sortBy: (row: UserItem) => {
      return [row.stats.processing, row.ranking]
    },
    width: 83,
  },
  {
    prop: 'stats.completeRate',
    label: '成员进度',
    sortable: true,
    sortBy: (row: UserItem) => {
      return [row.stats.completeRate, row.ranking]
    },
    width: 83,
  },
  {
    prop: 'chart',
    label: '成员任务分布图',
  },
]

async function getMemberlist() {
  try {
    const id = router.currentRoute.value.params.id as string
    const list = await projectStore.getProjectMemberList(id || '', '', [], true)
    state.memberAddList = list || []
  }
  catch (error) {}
}

async function dateChange(dateRange: DateRange, dateRangeKey: string) {
  const spaceId = router.currentRoute.value.params.id as string
  const { startTime, endTime } = dateRange
  dataRange.value = dateRange

  const data = await getUserList(spaceId, true, startTime, endTime) as UserItem[]
  tableData.value = data
}

function dialogConfirm(arr: UserItem[]) {
  const list = deepCopy(arr.filter(item => !item.disabled))
  const filterList = list.map((item: UserItem) => {
    return {
      userId: item.id,
      roleId: item.roleId,
    }
  })

  // 请求添加项目成员接口
  createMember(filterList)
}

// 添加成员
async function createMember(users: CreateProjectUsers[]) {
  try {
    await addProjectMember({
      spaceId: router.currentRoute.value.params.id as string,
      users,
    })
  }
  finally {
    moduleToolHeadRef.value.dateChange()
    getMemberlist()
  }
}

function linkToTable(options: any) {
  const conditionObj = getJumpCondition({ ...options, ...dataRange.value })

  handleChangeTab
  && handleChangeTab(conditionObj)
}

function getOptions(column: any, row: UserItem) {
  if (column.prop === 'stats.processing') {
    return row.stats.priorityInfos.map((item: any) => {
      const value = PRIORITY_LIST.find(ele => ele.value === item.priority)!
      return { color: value.color, label: value.label, value: item.count }
    })
  }
  else if (column.prop === 'chart') {
    return [
      { color: '', label: '成员进度', value: `${row.stats.completeRate}%` },
      { color: '', label: '任务总数', value: row.stats.total },
      { color: '#FD4C4C', label: '逾期', value: row.stats.expired },
      { color: '#FF9800', label: '待办', value: row.stats.processing },
      { color: '#0F87FF', label: '已完成', value: row.stats.completed },
      { color: '#DCDDE0', label: '终止/关闭', value: row.stats.closedOrTerminated },
    ]
  }
  return []
}

useEmitter(EmitEvent.UPDATE_USER_LIST, () => {
  moduleToolHeadRef.value.dateChange()
})

onMounted(async () => {
  getMemberlist()
  moduleToolHeadRef.value.dateChange()
})
</script>

<template>
  <introItem v-model="isFullScreen" class="w-full">
    <div :class="{ 'full-screen': isFullScreen }" class="intro-module">
      <intro-module-head
        ref="moduleToolHeadRef"
        v-model:isFullScreen="isFullScreen"
        title="成员管理"
        icon="project-intro-user"
        :total="tableData.length"
        @on-change-date="dateChange"
        @on-zoom-in="isFullScreen = true"
        @on-zoom-out="isFullScreen = false"
      >
        <template #leftTool>
          <button v-if="checkPerm(Perm.AddSpaceMember)" class="add-btn flex-row-center text12 w55 h26 br4 pl8 pr8 gap2 pointer ml12" @click="state.memberAddDialog = true">
            <svg-icon name="add-line" size="12" color="#333333" />添加
          </button>
          <b-member-dialog
            :dialog-visible="state.memberAddDialog"
            :project-current-list="state.memberAddList"
            confirm-btn-text="添加"
            type="projectIntro"
            @on-confirm="dialogConfirm"
            @on-close="state.memberAddDialog = false"
          />
        </template>
      </intro-module-head>
      <div class="intro-module-grid">
        <div class="intro-module-table">
          <BTable
            ref="bTableRef"
            v-model:data="tableData"
            :columns="columns"
            header-row-class-name="b-table-header"
            row-class-name="b-table-row"
            class="b-table"
            height="100%"
          >
            <!-- chart header 插槽 -->
            <template #chart-header="{ column }">
              <div class="legend header-cell flex-row-between full-100">
                <div class="header-cell-title text13 flex-row-start">
                  {{ column.label }}
                </div>
                <div class="header-cell-legend flex-row-start">
                  <div v-for="item in overview_task_status" :key="item.value" class="item">
                    <i class="statu" :style="{ background: item.color }" />
                    {{ item.label }}
                  </div>
                </div>
              </div>
            </template>

            <!-- 成员名称 -->
            <template #userNickname="{ row }">
              <div class="text14 icon-color flex-row-start name-box ml4">
                <b-head
                  :id="row.userId"
                  class="mr8"
                  width="28px"
                  :name="row.userNickname"
                  :role-id="row.roleId"
                  fs="text13"
                  :src="row?.avatar || ''"
                />
                <p class="nickname text14 icon-color mr8 short-name">
                  <b-ellipsis :content="row.userNickname" />
                </p>
              </div>
            </template>
            <!-- 逾期任务 -->
            <template #stats-expired="{ row }">
              <p class="num-box" @click="linkToTable({ type: 'expired', idField: 'directors', id: row.userId })">
                {{ row.stats.expired }}
              </p>
            </template>
            <!-- 进度 -->
            <template #stats-completeRate="{ row }">
              <rateCircle :rate="row.stats.completeRate" />
            </template>
            <!-- 待办任务 -->
            <template #stats-processing="{ row }">
              <p class="num-box" @click="linkToTable({ type: 'processing', idField: 'directors', id: row.userId })">
                {{ row.stats.processing }}
              </p>
            </template>
            <!-- 图表 -->
            <template #chart="{ row }">
              <barChart :title="row.userNickname" :stats="row.stats" />
            </template>
            <template #hover-data="{ column, row }">
              <HoverData
                v-if="column.prop === 'stats.processing'"
                :options="getOptions(column, row)"
                title="待办优先级"
                class="w160"
              />
              <HoverData
                v-else-if="column.prop === 'chart'"
                :options="getOptions(column, row)"
                :title="row.userNickname"
                :min-width="204"
              />
            </template>
            <template #edit="{ column, row }">
              <el-input v-if="column.prop === 'userNickname'" ref="inputRef" v-model="row.userNickname" />
            </template>
          </BTable>
        </div>
      </div>
    </div>
  </introItem>
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
.intro-module-grid {
  height: 247px;
  width: 100%;
  height: 247px;
  .intro-module-table {
    width: 100%;
    height: 100%;
    :deep(.el-table__header-wrapper) {
      .el-table__cell {
        position: relative;
        &:last-child {
          &::before {
            content: '';
            background: linear-gradient(
              270deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 0, 0, 0.02) 100%
            );
            position: absolute;
            left: 0;
            top: 0;
            width: 24px;
            height: 100%;
          }
        }
      }
      .header-cell {
        width: 100%;
        height: 100%;
        &.legend {
          padding-left: 16px;
          .header-cell-title {
            color: #bfbfbf;
          }
        }
      }

      .header-cell-legend {
        .item {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #bfbfbf;
          margin-left: 8px;

          .statu {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 4px;
            display: flex;
          }
        }
      }
    }
    :deep(.b-table-row) {
      .el-table__cell {
        position: relative;
        &:last-child {
          border-bottom: 1px dashed #f2f3f5;
          &::before {
            content: '';
            background: linear-gradient(
              270deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 0, 0, 0.02) 100%
            );
            position: absolute;
            left: 0;
            top: 0;
            width: 24px;
            height: 100%;
          }
        }
      }
    }
    .name-box {
      width: 100%;
      height: 100%;
      .edit-icon {
        width: 20px;
        height: 20px;
        cursor: pointer;
        border-radius: 4px;
        opacity: 0;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
        background: #ffffff;
        border: 1px solid #f4f5f7;
        box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.07);
        &:hover {
          :deep(.svg-icon) {
            use {
              fill: $color-primary;
            }
          }
        }
      }
      &:hover {
        .edit-icon {
          opacity: 1;
        }
      }
    }
    .num-box {
      width: 100%;
      height: 100%;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        color: $color-primary;
      }
    }
  }
  :deep(.b-table) {
    .cell {
      padding: 0 8px;
      overflow: visible;
    }
  }
}

.full-screen {
  .intro-module-grid {
    height: auto;
    max-height: 696px;
    width: 100%;
  }
}
</style>
