<script lang="ts" setup>
import { computed, inject, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import introModuleHead from '../components/head.vue'
import addToolPopover from '../components/addToolPopover.vue'
import rateCircle from '../components/rateCircle.vue'
import barChart from '../components/barChart.vue'
import introItem from '../components/introItem.vue'
import HoverData from '../components/hoverData.vue'
import { workVersionCreate, workVersionModifyName } from '@/api/project'
import { PRIORITY_LIST, overview_task_status } from '@/utils/constant'
import router from '@/router'
import { Perm } from '@/enum/permission'
import { usePermission } from '@/hooks/usePermission'
import { useVersion } from '@/hooks/useVersion'
import type { VersionItem } from '@/api/project/intro/types'
import type { DateRange } from '@/api/interface/common'
import { getJumpCondition } from '@/mixins/condition'
import { useEmitter } from '@/hooks/useEmitter'
import { getTextLength } from '@/utils'
import { EmitEvent } from '@/enum/event'

const handleChangeTab: Function = inject('handleChangeTab') as Function

const addToolRef = ref()
const moduleToolHeadRef = ref()
const inputRef = ref()
const { getVersionList } = useVersion()

const isFullScreen = ref(false) // 是否全屏
const originalName = ref('') // 原始名称
const dataRange = ref<DateRange>({
  startTime: '',
  endTime: '',
})

const tableData = ref<VersionItem[]>([]) // 表格数据

const currentDateRange = ref<{ key: string, value: DateRange }>({
  key: '',
  value: {
    startTime: '',
    endTime: '',
  },
})

const { checkPerm } = usePermission()

const bTableRef = ref()

const columns = [
  {
    prop: 'versionName',
    label: '版本名称',
    width: 199,
  },
  {
    prop: 'stats.expired',
    label: '逾期任务',
    align: 'center',
    sortable: true,
    sortBy: (row: VersionItem) => {
      return [row.stats.expired, row.ranking]
    },
    width: 83,
  },
  {
    prop: 'stats.processing',
    label: '待办任务',
    align: 'center',
    sortable: true,
    sortBy: (row: VersionItem) => {
      return [row.stats.processing, row.ranking]
    },
    width: 83,
  },
  // {
  //   prop: 'stats.total',
  //   label: '任务总数',
  //   align: 'center',
  //   sortable: true,
  //   sortBy: (row: VersionItem) => {
  //     return [row.stats.total, row.ranking]
  //   },
  //   width: 83,
  // },
  {
    prop: 'stats.completeRate',
    label: '版本进度',
    sortable: true,
    sortBy: (row: VersionItem) => {
      return [row.stats.completeRate, row.ranking]
    },
    width: 83,
  },
  {
    prop: 'chart',
    label: '版本任务分布图',
  },
]

// 创建版本
async function createVersion(name: string) {
  try {
    await workVersionCreate({
      spaceId: router.currentRoute.value.params.id as string,
      versionName: name,
    })
    message.success('版本创建成功', 3)
    addToolRef.value?.handleCancel()
    moduleToolHeadRef.value.dateChange()
  }
  catch (error: any) {
    if (error.code === 301001) {
      addToolRef.value?.vaildate(error.message)
    }
  }
}

function inputBlur(row: VersionItem) {
  const length = getTextLength(row.versionName.trim())
  if (row.versionName.trim() === originalName.value) {
    return
  }
  if (length < 2 || length > 14) {
    message.error('请输入有效格式(2 ~ 14个字符)', 3)
    row.versionName = originalName.value
    return
  }
  editModuleName(row)
}

// 编辑版本
async function editModuleName(row: VersionItem) {
  try {
    await workVersionModifyName({
      versionId: row.id,
      versionName: row.versionName.trim(),
    })
    message.success('版本编辑成功', 3)
  }
  catch (error) {
    row.versionName = originalName.value
  }
}

// 日期变化重新请求列表数据
async function dateChange(dateRange: DateRange, dateRangeKey: string) {
  currentDateRange.value = { key: dateRangeKey, value: dateRange }
  const spaceId = router.currentRoute.value.params.id as string
  const { startTime, endTime } = dateRange
  dataRange.value = dateRange

  const data = await getVersionList(spaceId, true, startTime, endTime) as VersionItem[]
  tableData.value = data
}

function linkToTable(options: any) {
  const conditionObj = getJumpCondition({ ...options, ...dataRange.value })

  handleChangeTab
  && handleChangeTab(conditionObj)
}

function tableColumnEdit(column: string, index: number) {
  bTableRef.value?.edit(column, index)
  setTimeout(() => {
    inputRef.value?.focus()
  }, 10)
}

function getOptions(column: any, row: VersionItem) {
  if (column.prop === 'stats.processing') {
    return row.stats.priorityInfos.map((item: any) => {
      const value = PRIORITY_LIST.find(ele => ele.value === item.priority)!
      return { color: value.color, label: value.label, value: item.count }
    })
  }
  else if (column.prop === 'chart') {
    return [
      { color: '', label: '版本进度', value: `${row.stats.completeRate}%` },
      { color: '', label: '任务总数', value: row.stats.total },
      { color: '#FD4C4C', label: '逾期', value: row.stats.expired },
      { color: '#FF9800', label: '待办', value: row.stats.processing },
      { color: '#0F87FF', label: '已完成', value: row.stats.completed },
      { color: '#DCDDE0', label: '终止/关闭', value: row.stats.closedOrTerminated },
    ]
  }
  return []
}

// 更新模块列表
useEmitter(EmitEvent.UPDATE_VERSION_LIST, () => {
  moduleToolHeadRef.value.dateChange()
})

onMounted(async () => {
  moduleToolHeadRef.value.dateChange()
})
</script>

<template>
  <introItem v-model="isFullScreen" class="w-full">
    <div :class="{ 'full-screen': isFullScreen }" class="intro-module">
      <intro-module-head
        ref="moduleToolHeadRef"
        v-model:isFullScreen="isFullScreen"
        title="版本管理"
        icon="project-intro-version"
        :total="tableData.length"
        @on-change-date="dateChange"
        @on-zoom-in="isFullScreen = true"
        @on-zoom-out="isFullScreen = false"
      >
        <template #leftTool>
          <addToolPopover v-if="checkPerm(Perm.CreateSpaceWorkVersion)" ref="addToolRef" title="版本" placeholder="请输入版本名" @on-add="createVersion" />
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

            <!-- 版本名称 -->
            <template #versionName="{ row, $index }">
              <div class="name-box text14 icon-color flex-row-between">
                <p class="ss-line-1 mr8">
                  {{ row.versionName }}
                </p>
                <div
                  v-if="checkPerm(Perm.ModifySpaceWorkVersion)"
                  class="edit-icon flex-row-center"
                  @click="tableColumnEdit('versionName', $index)"
                >
                  <svg-icon size="10" name="table-edit-line" color="#666666" />
                </div>
              </div>
            </template>
            <!-- 逾期任务 -->
            <template #stats-expired="{ row }">
              <p class="num-box" @click="linkToTable({ type: 'expired', idField: 'version_id', id: row.id })">
                {{ row.stats.expired }}
              </p>
            </template>
            <!-- 进度 -->
            <template #stats-completeRate="{ row }">
              <rateCircle :rate="row.stats.completeRate" />
            </template>
            <!-- 待办任务 -->
            <template #stats-processing="{ row }">
              <p class="num-box" @click="linkToTable({ type: 'processing', idField: 'version_id', id: row.id })">
                {{ row.stats.processing }}
              </p>
            </template>
            <!-- 图表 -->
            <template #chart="{ row }">
              <barChart :title="row.versionName" :stats="row.stats" />
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
                :title="row.versionName"
                :min-width="204"
              />
            </template>
            <template #edit="{ column, row, id }">
              <BInput2
                v-if="column.prop === 'versionName'"
                ref="inputRef"
                v-model:value="row.versionName"
                class="h-full"
                size="large"
                plain
                style="padding: 8px;"
                @focus="originalName = row.versionName"
                @press-enter="() => {
                  inputRef?.blur()
                  bTableRef?.exitEditById(id)
                }"
                @blur="inputBlur(row)"
              />
            </template>
          </BTable>
        </div>
      </div>
    </div>
  </introItem>
</template>

<style lang="scss" scoped>
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
