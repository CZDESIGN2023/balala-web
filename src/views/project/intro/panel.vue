<script lang="ts" setup>
import { inject, onMounted, onUnmounted, ref } from 'vue'
import panelDescribe from './panelDescribe.vue'
import type { WorkbenchCount } from '@/api/interface/system'
import { getProjectCount } from '@/api/project'
import router from '@/router'

const handleChangeTab: Function = inject('handleChangeTab') as Function
const handleChangeFollow: Function = inject('handleChangeFollow') as Function

/** DATA */
const isLoading = ref<boolean>(false)
const countData = ref<WorkbenchCount>({
  completeRate: '0',
  completed: '0',
  processing: '0',
  total: '0',
  followed: '0',
})
const progressVal = ref(0)
const showAfter = ref<number>(150)
const isScrolling = ref<boolean>(false)
const scrollTimeout = ref()
const titleTip = ref('')

/** FUNCTION */

// 获取数量
async function getCount() {
  isLoading.value = true
  const id = router.currentRoute.value.params.id as string
  const { data } = await getProjectCount(id)
  countData.value = data
  isLoading.value = false
  progressVal.value = Number(data?.processingAndExpiredRate)

  const val = Number(data?.completeRate)
  if (Number(data?.processingAndExpiredRate) >= 40) {
    titleTip.value = '异常  逾期任务数量/任务总数/100 ≥ 40%'
    return
  }
  if (val >= 0 && val <= 59)
    titleTip.value = '当前项目进度 0% ≤ 一般 ≤ 59%'
  else if (val >= 60 && val <= 79)
    titleTip.value = '当前项目进度 60% ≤ 健康 ≤ 79%'
  else if (val >= 80 && val <= 94)
    titleTip.value = '当前项目进度 80% ≤ 良好 ≤ 94%'
  else if (val >= 95 && val <= 100)
    titleTip.value = '当前项目进度 95% ≤ 优秀 ≤ 100%'
}

// 跳转表格
function toTable(type: string, count: string | undefined) {
  if (Number(count) === 0)
    return
  switch (type) {
    case 'processing':
      handleChangeTab && handleChangeTab(countData.value?.processingConditionGroup)
      break
    case 'completed':
      handleChangeTab && handleChangeTab(countData.value?.doneConditionGroup)
      break
    case 'followed':
      handleChangeFollow && handleChangeFollow(countData.value?.followedConditionGroup)
      break
    case 'total':
      handleChangeTab && handleChangeTab({ conditions: [], conjunction: 'AND', groups: [] })
      break
  }
}

// 判断是否在滚动
function handleScroll() {
  // 设置标志表示正在滚动
  isScrolling.value = true
  // 清除之前的计时器
  clearTimeout(scrollTimeout.value)
  // 设置一个新的计时器，当滚动停止后500毫秒，将isScrolling设置为false
  scrollTimeout.value = setTimeout(() => {
    isScrolling.value = false
  }, 500)
}

onMounted(() => {
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll)
  getCount()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

defineExpose({
  getCount,
})
</script>

<template>
  <div>
    <div class="panel flex-row-start skeleton-style">
      <a-skeleton :paragraph="false" :loading="isLoading" active>
        <el-tooltip
          content="统计当前项目中，当前流程节点尚未结束的任务总数"
          effect="dark"
          placement="top"
          :show-after="showAfter"
          overlay-class-name="task-tool-width"
        >
          <div
            class="item flex-column-center animate__animated animate__fadeIn"
            @click="toTable('processing', countData?.processing)"
          >
            <h2 v-if="countData?.processing !== '0'" class="value ddin">
              {{ countData?.processing }}
            </h2>
            <h2 v-else class="value value-none">
              暂无
            </h2>
            <p class="label">
              待办任务
            </p>
          </div>
        </el-tooltip>
      </a-skeleton>

      <div class="line" />

      <a-skeleton :paragraph="false" :loading="isLoading" active>
        <el-tooltip
          content="统计当前项目中，状态为 已完成 的任务总数"
          effect="dark"
          placement="top"
          :show-after="showAfter"
          overlay-class-name="task-tool-width"
        >
          <div
            class="item flex-column-center animate__animated animate__fadeIn"
            @click="toTable('completed', countData?.completed)"
          >
            <h2 v-if="countData?.completed !== '0'" class="value ddin">
              {{ countData?.completed }}
            </h2>
            <h2 v-else class="value value-none">
              暂无
            </h2>
            <p class="label">
              完成任务
            </p>
          </div>
        </el-tooltip>
      </a-skeleton>

      <div class="line" />

      <a-skeleton :paragraph="false" :loading="isLoading" active>
        <el-tooltip
          content="统计当前项目中，所有状态、类型的任务总数"
          placement="top"
          effect="dark"
          :show-after="showAfter"
          overlay-class-name="task-tool-width"
        >
          <div
            class="item flex-column-center animate__animated animate__fadeIn"
            @click="toTable('total', countData?.total || '')"
          >
            <h2 v-if="countData?.total !== '0'" class="value ddin">
              {{ countData?.total }}
            </h2>
            <h2 v-else class="value value-none">
              暂无
            </h2>
            <p class="label">
              任务总数
            </p>
          </div>
        </el-tooltip>
      </a-skeleton>

      <div class="line" />

      <a-skeleton :paragraph="false" :loading="isLoading" active>
        <el-tooltip
          content="统计当前项目中，您 已关注 的任务总数"
          placement="top"
          effect="dark"
          :show-after="showAfter"
          overlay-class-name="task-tool-width"
        >
          <div
            class="item flex-column-center animate__animated animate__fadeIn"
            @click="toTable('followed', countData?.followed || '')"
          >
            <h2 v-if="countData?.followed !== '0'" class="value ddin">
              {{ countData?.followed }}
            </h2>
            <h2 v-else class="value value-none">
              暂无
            </h2>
            <p class="label">
              我关注的
            </p>
          </div>
        </el-tooltip>
      </a-skeleton>

      <div class="line" />
      <a-skeleton :paragraph="false" :loading="isLoading" active>
        <el-tooltip
          :content="titleTip"
          effect="dark"
          placement="top"
          :show-after="showAfter"
          overlay-class-name="task-tool-width"
        >
          <circle-process
            :progress="Number(countData.completeRate)"
            :progress-val="progressVal"
          />
        </el-tooltip>
      </a-skeleton>
    </div>
    <panelDescribe v-bind="$attrs" />
  </div>
</template>

<style lang="scss" scoped>
:global(.task-tool-width) {
  max-width: 330px !important;
}
.panel {
  width: 100%;
  height: 160px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #f7f8fa;
  box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.02);
  padding: 24px;

  .item {
    // width: 104px;
    height: 88px;
    border-radius: 8px;
    padding: 24px;
    z-index: 0;
    cursor: pointer;
    transition: all 0.2s;
    background: none;

    &:hover {
      background: $color-default-hover;
    }
    &:active {
      background: $color-default-active;
    }

    .value {
      font-size: 28px;
      line-height: 28px;
      color: $color-title;
      margin-bottom: 8px;
    }

    .value-none {
      font-size: 20px;
      color: #999999;
      font-weight: initial;
      flex-shrink: 0;
    }

    .label {
      font-size: 14px;
      font-weight: initial;
      color: $color-minor;
    }
  }

  .line {
    width: 2px;
    height: 32px;
    background: #e5e5e5;
    z-index: 1;
    margin: 0 24px;
  }
}
</style>
