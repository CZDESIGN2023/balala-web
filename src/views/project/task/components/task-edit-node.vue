<script setup lang="ts">
import { type Ref, inject, provide, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { RoleOwner, TaskFile, TaskPlanTimeAt } from '@/api/interface'
import {
  editWorkChildDirector,
  editWorkDirector,
  spaceWorkRemind,
  updateSpaceWorkFlowTime,
} from '@/api/project'
import { getIsDelay } from '@/utils'
import type { TaskStatusKey } from '@/enum/TaskStatus'
import { NodeStatus } from '@/enum/NodeStatus'
import type { TaskPermission } from '@/hooks/useTaskPermission'

// PROPS
interface Props {
  data: any
  roleOwner: RoleOwner
  currentTemplate: any
  spaceId: string
  workItemId: string
  workItemStatusKey: TaskStatusKey
  operationPermissions: any
  isSubTask: boolean
}
const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  rowOwner: () => ({}),
  currentTemplate: () => ({}),
  role: undefined,
  spaceId: '',
  workItemId: '',
  workItemStatusKey: 'progressing' as TaskStatusKey,
  isSubTask: false,
})
const emit = defineEmits(['update:data', 'success'])

provide('view', true)
const taskPermissions = inject('taskPermissions') as Ref<TaskPermission>
const isArchived = inject('isArchived') as Ref<boolean>
const isReminder = ref<boolean>(true)
const reminderProgress = ref<number>(0)
const reminderTimer = ref()

const ownerValues = ref([]) as Ref<string[]>
const displayRange = ref([])

watch(() => props.roleOwner, () => {
  if (props.roleOwner?.owners) {
    ownerValues.value = props.roleOwner.owners.map(item => item.id)
  }
}, { immediate: true })

watch(() => props.currentTemplate, (n) => {
  if (n?.owner?.value) {
    const tempValue = JSON.parse(n.owner.value)
    if (n.owner.usageMode === 'appointed') {
      displayRange.value = tempValue.appointedOwner.map((item: any) => item.value)
    }
  }
}, { immediate: true })

/** METHODS */

// 修改负责人
async function onChangeDirector(director: TaskFile) {
  if (ownerValues.value.length < 1)
    return message.error('请选择节点负责人')

  if (props.isSubTask) {
    // 修改子任务负责人
    await editWorkChildDirector(props.spaceId, props.workItemId, director)
  }
  else {
    // 修改负责人
    await editWorkDirector(props.spaceId, props.workItemId, props.data.role, director)
  }
  message.success('负责人修改成功', 2)
  emit('success')
  emit(
    'update:data',
    Object.assign(props.data, {
      rawDirector: props.data.directorIds.map((item: string) => {
        return { userId: item }
      }),
    }),
  )
  return true
}

// 选择节点时间
async function changeNodeDate(time: TaskPlanTimeAt) {
  emit('update:data', Object.assign(props.data, { planTime: { startAt: dayjs(time.start).unix(), completeAt: dayjs(time.complete).unix() } }))
  await updateSpaceWorkFlowTime(
    props.spaceId,
    props.workItemId,
    props.data.flowNodeCode,
    time,
  )
  message.success('节点排期修改成功', 2)
  emit('success')
}

// 催单定时器
function startProgress() {
  // 清除之前的定时器
  clearInterval(reminderTimer.value)
  // 设置定时器，每100ms增加1%的进度
  reminderTimer.value = setInterval(() => {
    if (reminderProgress.value < 100) {
      reminderProgress.value++
    }
    else {
      // 当进度达到100%时，清除定时器
      isReminder.value = true
      reminderProgress.value = 0
      clearInterval(reminderTimer.value)
    }
  }, 50) // 1000ms内完成100%，所以每50ms增加1%
}

// 催单
async function reminder() {
  if (!isReminder.value)
    return
  try {
    await spaceWorkRemind(props.spaceId, props.workItemId, props.data.flowNodeCode)
    message.success('提醒已发送')
    isReminder.value = false
    startProgress()
  }
  catch (error) {}
}

// 获取进度
function getDasharray(rate: number) {
  const start = `calc(2 * 3.1415 * (32 - 2) / 2 * (${rate} / 100))`
  if (rate === 0)
    return `stroke-dasharray: ${start}, 1000; opacity: 0;`

  return `stroke-dasharray: ${start}, 1000`
}
</script>

<template>
  <div class="node-info mb24">
    <div v-if="data && data.id" class="node-info-wrap flex-row-between">
      <div class="node-director flex-row-start">
        <p class="label must">
          节点负责人
        </p>
        <div class="node-director-box">
          <BusinessPersonSelect
            v-model:value="ownerValues"
            :space-id="spaceId"
            :max-tag-count="1"
            :disabled="!taskPermissions.allowEdit"
            :dropdown-match-select-width="393"
            :display-range
            size="large"
            class="w-full"
            @change="onChangeDirector"
          />
        </div>
        <el-tooltip
          content="催一下"
          :disabled="!isReminder"
          placement="top"
        >
          <div
            v-if="data.flowNodeStatus === NodeStatus.INPROGRESS && !isArchived"
            class="w32 h32 br16 node-reminder flex-row-center ml24 pointer"
            :class="{ disabled: !isReminder }"
            @click="reminder"
          >
            <div class="m-circle m-progress">
              <svg class="rate-circle w32 h32 mr8">
                <circle stroke="#ffffff" />
                <circle stroke="#BFBFBF" :style="getDasharray(reminderProgress)" />
              </svg>
            </div>
            <svg-icon
              class="reminder-icon"
              name="reminder"
              size="16"
              :color="!isReminder ? '#BFBFBF' : '#FFB74B'"
            />
          </div>
        </el-tooltip>
      </div>
      <div class="node-time flex-row-start">
        <p class="label mr8">
          节点排期
        </p>
        <div class="node-time-box w203">
          <b-input-date
            :key="data?.id"
            :class-type="
              getIsDelay(data.planTime.completeAt)
                ? 'red-time detail notIcon'
                : '' + ' detail notIcon'
            "
            :info="{
              planStartAt: data.planTime.startAt,
              planCompleteAt: data.planTime.completeAt,
            }"
            :task-status="workItemStatusKey"
            :disabled="!taskPermissions.allowEdit"
            size="large"
            @on-change="changeNodeDate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.node-info {
  padding: 0 24px;
  .node-info-wrap {
    width: 100%;
    height: 64px;
    border-radius: 8px;
    padding: 12px 16px;
    background: #ffffff;
    border: 1px solid $color-border-main;
    .label {
      font-size: 14px;
      color: #333;
      position: relative;
    }
    .must {
      &::after {
        content: '*';
        color: #ff4d4f;
        position: absolute;
        right: -12px;
        top: -1px;
      }
    }
    .node-director-box {
      margin-left: 20px;
      min-width: 152px;
      height: 40px;
      width: 190px;
    }
    .node-reminder {
      background: #ffffff;
      border: 1px solid $color-border-main;
      position: relative;
      .m-circle {
        width: 32px;
        height: 32px;
        position: absolute;
        top: -1px;
        left: -1px;
        opacity: 0;
        // border: 1px solid #fff;
        .rate-circle {
          width: 32px;
          height: 32px;
          transform: rotate(-90deg);
          circle {
            cx: 16px;
            cy: 16px;
            r: 15px;
            stroke-linecap: round;
            fill: none;
            stroke-width: 1px;
          }
          .dasharray {
            transition: stroke-dasharray 0.4s linear;
          }
        }
      }

      &:hover {
        :deep(.svg-icon) {
          use {
            fill: #ff9800;
          }
        }
      }
      &.disabled {
        .m-circle {
          opacity: 1;
        }
        &:hover {
          :deep(.svg-icon) {
            use {
              fill: #bfbfbf;
            }
          }
        }
      }
    }
  }
}
</style>
