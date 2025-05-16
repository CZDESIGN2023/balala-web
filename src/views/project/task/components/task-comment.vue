<!-- 评论/备注 -->
<script setup lang="ts">
import { Loading3QuartersOutlined } from '@ant-design/icons-vue'
import { getCurrentInstance, h, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { CommentData, CommentItem, CommentItemTool } from '@/api/interface'
import { useUserStore } from '@/stores/modules/user'
import { getProjectInfo, taskCommentDelete, taskCommentEdit, taskCommentList } from '@/api/project'
import { debounce, formatDate } from '@/utils'
import { Msgbox } from '@/utils/msgbox'
import router from '@/router'
import { processHtmlContent } from '@/components/BEditor/utils'
import { usePermission } from '@/hooks/usePermission'
import { Perm } from '@/enum/permission'

const props = withDefaults(defineProps<Props>(), {
  taskParams: () => ({}),
  commentSort: 'ASC',
  commentNum: 0,
})
const emits = defineEmits([
  'update:commentNum',
  'update:isShowCommentReloadBtn',
  'addCommentSuccess',
  'replyComment',
  'editComment',
  'commentFocus',
  'onScroll',
])
const { proxy } = getCurrentInstance() as any
const { userInfo } = useUserStore()
const { checkPerm } = usePermission()
const indicator = h(Loading3QuartersOutlined, {
  style: {
    fontSize: '24px',
  },
  spin: true,
})
interface State {
  commentLoading: boolean
  commentList: CommentItem[]
  commentNoData: boolean
  checkedComment: number
}
interface TaskParamType {
  spaceId?: string
  workItemId?: string
}
const state = reactive<State>({
  commentLoading: false,
  commentList: [],
  commentNoData: false,
  checkedComment: 0,
})
const commentObj = ref<CommentData>({ hasNext: true, nextPos: '', items: [], total: 0 })
// 是否显示图片预览
const visible = ref<boolean>(false)
// 图片预览地址
const previewImage = ref('')
const renderValue = Math.random()
interface Props {
  taskParams: TaskParamType
  commentSort: string
  commentNum: number
}
const size = 300
const commentEditorRef: any = ref([])
const editId = ref<string>('')

function generateToolBtn(item: CommentItem) {
  const isDelete = () => {
    // 项目评论配置开启 拥有删除评论权限 当前评论是自己的
    return state.checkedComment === 1 && (checkPerm(Perm.DeleteWorkItemComment) || item.user.userId === userInfo.id)
  }

  const list: CommentItemTool[] = [
    {
      type: 'comment',
      icon: 'table-comment',
      show: true,
    },
    {
      type: 'edit',
      icon: 'comment-edit',
      show: userInfo.id === item.user.userId,
    },
    {
      type: 'delete',
      icon: 'comment-delete',
      show: isDelete(),
    },
  ]
  return list.filter(item => item.show)
}

const getCommentList = debounce(
  async (
    params: { isClear?: boolean, isAdd?: boolean, isSort?: boolean } = {
      isClear: false,
      isAdd: false,
      isSort: false,
    },
  ) => {
    const { isClear, isAdd, isSort } = params
    let pos = 0
    if (isClear) {
      commentObj.value = { hasNext: true, nextPos: '', items: [], total: 0 }
      state.commentList = []
    }
    // 添加评论 通过pos获取最新的一条评论
    if (isAdd) {
      if (props.commentSort === 'ASC') {
        pos
          = state.commentList.length > 0
            ? Number(state.commentList[state.commentList.length - 1].id)
            : 0
      }
      else {
        pos = state.commentList.length > 0 ? Number(state.commentList[0].id) : 0
      }
    }
    // 没有下一页了或者加载状态不往下执行  (排序和添加元素不受这个控制)
    if ((!commentObj.value?.hasNext || state.commentLoading) && !isAdd && !isSort)
      return

    state.commentLoading = true
    const posParams = pos || Number(commentObj.value?.nextPos) // 评论定位
    const sortOrder = pos ? 'ASC' : props.commentSort // 排序方式
    const res = await taskCommentList(
      props.taskParams.workItemId || '',
      size,
      posParams,
      sortOrder,
      JSON.stringify(JSON.parse(String(renderValue))),
    )
    state.commentLoading = false
    if (res._id !== String(renderValue))
      return

    state.commentNoData = !Number(res.data.total)
    emits('update:commentNum', Number(res.data.total))
    // 时间格式转换
    res.data.items.forEach((item) => {
      if (item.replyComment !== null) {
        item.replyComment.content = processHtmlContent(item.replyComment?.content)
      }
      item.replyCommentId = Number(item.replyCommentId)
      item.updatedAtTip = `${formatDate(item.updatedAt, 'MM/DD HH:mm')} 更新`
      item.updatedAt = formatDate(item.updatedAt, 'YYYY/MM/DD HH:mm:ss')
      item.createdAt = formatDate(item.createdAt, 'YYYY/MM/DD HH:mm:ss')
      item.tools = generateToolBtn(item)
    })
    commentObj.value = res.data
    if (props.commentSort === 'ASC')
      state.commentList = [...state.commentList, ...res.data.items]
    else
      state.commentList = [...res.data.items, ...state.commentList]
    if (isAdd) {
      emits('addCommentSuccess')
      return
    }

    await nextTick()
    emits('onScroll', props.commentSort === 'ASC' ? 'bottom' : 'top')
  },
  300,
)

function init() {
  getInfo()
}

// 获取项目基本信息
async function getInfo() {
  try {
    const { data } = await getProjectInfo({ spaceId: router.currentRoute.value.params.id as string || props.taskParams.spaceId })
    if (data) {
      state.checkedComment = Number(data.commentDeletable)
      getCommentList()
    }
  }
  catch (err) {
  }
}

// 回复评论
function replyComment(item: CommentItem) {
  emits('replyComment', item)
}

// 编辑评论
function editComment(id: string) {
  editId.value = id
  emits('editComment', true)
  nextTick(() => {
    requestAnimationFrame(() => {
      commentEditorRef.value[id]?.getFocus()
    })
    // 防止当前元素不在可视区域内
    const idName = `commentId${id}`
    const curEditor = document.getElementById(idName)
    curEditor?.scrollIntoView()
  })
}

// 删除评论
function deleteComment(id: string) {
  Msgbox.error.m({ title: `确认删除当前评论？` }).then(async () => {
    await taskCommentDelete(id)
    try {
      message.success('评论删除成功', 3)
      const index = state.commentList.findIndex((item) => {
        return item.id === id
      })
      if (index !== -1) {
        state.commentList.splice(index, 1)
        syncReplyContent(Number(id), 'delete')
        emits('update:commentNum', props.commentNum - 1)
      }
      console.log(state.commentList.length)
      if (!state.commentList.length) {
        state.commentNoData = true
      }
    }
    catch (error) {

    }
  })
}

// 同步处理回复评论
function syncReplyContent(commentId: number, type: 'delete' | 'update') {
  state.commentList.forEach((item) => {
    if (commentId === item.replyCommentId) {
      switch (type) {
        case 'delete':
          item.replyComment = null as any
          break
        case 'update':
          item.replyComment.updatedAt = (new Date().getTime() / 1000).toFixed(0)
          break
      }
    }
  })
}

function handleClickTool(item: CommentItem, type: string) {
  switch (type) {
    case 'comment':
      replyComment(item)
      break
    case 'edit':
      editComment(item.id)
      break
    case 'delete':
      deleteComment(item.id)
      break
    default:
      break
  }
}

// 获取评论内容
async function updateComment(describe: string, id: string, userIds: number[]) {
  try {
    const { data } = await taskCommentEdit(id, describe, userIds)
    state.commentList.map((item) => {
      if (item.replyComment && item.replyComment.id === id) {
        item.replyComment.content = processHtmlContent(data.content)
      }
      if (item.id === id) {
        item.content = data.content
        item.updatedAt = data.updatedAt
        item.updatedAtTip = formatDate(data.updatedAt, 'MM/DD HH:mm')
      }
    })
    message.success('评论编辑成功！', 2)
    syncReplyContent(Number(id), 'update')
  }
  catch (error) {}
}

// 切换评论模式
function changeEditorMode() {
  emits('editComment', false)
  editId.value = ''
}

// 设置图片预览开启和关闭
function setVisible(value: boolean): void {
  visible.value = value
}

function handleClickHtml(e: any) {
  if (e.target.nodeName.toLowerCase() === 'img') {
    visible.value = true
    previewImage.value = e.target.currentSrc
    setVisible(true)
  }
}

// 处理协作
function onCooperate(data: any) {
  if (Number(data.workItem.id) === Number(props.taskParams.workItemId)) {
    emits('update:isShowCommentReloadBtn', true)
  }
}

onMounted(() => {
  init()
  proxy.mittBus.on('commentUpdate', onCooperate)
})

onUnmounted(() => {
  proxy.mittBus.off('commentUpdate', onCooperate)
})

defineExpose({
  getCommentList,
})
</script>

<template>
  <!-- 刷新按钮 -->
  <div class="comment-tab">
    <div class="comment-list">
      <div
        v-for="(item) in state.commentList"
        :id="`commentId${item.id}`"
        :key="item.id"
        class="comment-item flex"
      >
        <!-- 头像 -->
        <b-head
          :id="item.user.userId"
          class="mr12"
          width="32px"
          :name="item.user.userNickname"
          :src="item.user.avatar"
        />
        <div class="full-100 comment-item-content">
          <!-- 评论信息 -->
          <div class="mb10 flex-row-start tit">
            <span class="name mr8">{{ item.user.userNickname }}</span>
            <span class="info flex-row-start">{{ item.user.userName }}<span class="time ml8">{{ item.createdAt }}</span></span>
          </div>
          <!-- 内容 -->
          <div class="comment-content full-100 editor-order-list">
            <div class="content full-100">
              <div v-show="editId !== item.id" class="content-wrap pt9 pb9 pl12 pr12">
                <div class="html" @click="handleClickHtml">
                  <div v-if="item.replyCommentId > 0" id="editor-reply-content" class="mceNonEditable editor-reply-content">
                    <p class="line" />
                    <span class="shrink">回复</span>
                    <span class="shrink">{{ item.replyComment?.user.userNickname }}:</span>
                    <div class="ellipsis">
                      {{ item.replyComment?.content }}
                      <span v-if="!item.replyComment?.content">此评论已删除</span>
                    </div>
                    <span v-if="item.replyComment?.createdAt !== item.replyComment?.updatedAt">(已编辑)</span>
                  </div>
                  <p v-html="item.content" />
                  <el-tooltip :content="item.updatedAtTip" placement="top" :offset="7">
                    <p v-if="item.createdAt !== item.updatedAt" class="mt4 text13 minor-color flex-inline">
                      (已编辑)
                    </p>
                  </el-tooltip>
                </div>
                <!-- 回复、编辑、删除 -->
                <div
                  class="operate flex-row-center"
                  :class="`operate_${item.tools.length}`"
                >
                  <template v-for="tool in item.tools" :key="tool.type">
                    <div class="operate-icon flex-row-center" @click="handleClickTool(item, tool.type)">
                      <svg-icon :class="tool.type" class="svg-icon-hover-primary" :name="tool.icon" size="16" color="#666666" />
                    </div>
                  </template>
                </div>
              </div>
              <div v-show="editId === item.id">
                <b-editor
                  v-if="item.id"
                  :ref="(el: any) => { if (el) commentEditorRef[Number(item.id)] = el }"
                  is-foot-btn
                  btn-title="确认评论"
                  placeholder="请输入评论（Enter 换行，⌘ + Enter / Ctrl+Enter 发送）"
                  mode="focusMode"
                  type="comment"
                  :mode-key="`focusMode${item.id}`"
                  :resize="false"
                  :space-id="taskParams.spaceId"
                  :value="item.content"
                  :min-height="140"
                  :max-height="250"
                  @editor-blur="
                    (describe: string, userIds: number[]) =>
                      updateComment(describe, item.id, userIds)
                  "
                  @change-mode="changeEditorMode"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 空数据 -->
    <b-empty
      v-if="state.commentNoData"
      img-name="no-data-search.svg"
      :is-svg="false"
      icon-mb="5px"
      pt="240px"
      desc="暂无评论"
    />
    <!-- 加载 -->
    <div class="flex-row-center">
      <a-spin :spinning="state.commentLoading" :indicator="indicator" />
    </div>
    <a-image
      :style="{ display: 'none', width: '0px', height: '0px' }"
      :preview="{
        visible,
        onVisibleChange: setVisible,
      }"
      :src="previewImage"
    />
  </div>
</template>

<style lang="scss">
.svg-icon-hover-primary {
  &.delete {
    &:hover {
      use {
        fill: #fd4c4c !important;
      }
    }
  }
  &:hover {
    use {
      fill: $color-primary !important;
    }
  }
}
</style>

<style lang="scss" scoped>
.comment-tab {
  padding: 24px 24px;
  .comment-list {
    position: relative;
    .comment-item {
      margin-bottom: 24px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .comment-item-content {
      .tit {
        margin-top: -3px;
      }
      .name {
        font-size: 15px;
        font-weight: 500;
        color: #333333;
      }
      .info {
        font-size: 14px;
        color: #999999;
        .time {
          color: #bfbfbf;
        }
      }
    }
  }
  .comment-loading {
    top: 20%;
  }

  .operate {
    opacity: 0;
    position: absolute;
    background: #fff;
    bottom: 0px;
    right: -42px;
    border-radius: 6px;
    border: 1px solid #f4f5f7;
    box-shadow: $tool-drop-box-shadow;
    .operate-icon {
      width: 32px;
      height: 32px;
      cursor: pointer;
      position: relative;
      &:not(:last-child):after {
        content: '';
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: -0.5px;
        width: 1px;
        height: 14px;
        background-color: #edeef0;
      }
      &:first-child {
        border-radius: 6px 0 0 6px;
      }
      &:nth-child(3) {
        border-radius: 0 6px 6px 0;
      }
    }
    .line {
      width: 1px;
      height: 100%;
      background: $color-border-main;
      position: absolute;
      left: 50%;
      top: 0;
    }
    &.operate_3 {
      right: -106px;
    }
    &.operate_2 {
      right: -74px;
    }
  }

  .content {
    .content-wrap {
      width: max-content;
      max-width: 552px;
      position: relative;
      font-size: 14px;
      border-radius: 6px;
      color: #333333;
      background: #f5f6f7;
      word-break: break-all;
      .html {
        // display: inline-flex;
        :deep(div) {
          white-space: normal !important;
          * {
            white-space: normal !important;
          }
        }
        :deep(a) {
          color: #1d74f5 !important;
        }
      }
      &:hover {
        .operate {
          opacity: 1;
        }
      }
    }
  }
}
</style>
