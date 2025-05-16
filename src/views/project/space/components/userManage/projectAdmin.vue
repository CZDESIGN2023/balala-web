<script lang="ts" setup>
import { h, inject, nextTick, onMounted, reactive, ref } from 'vue'
import type { VxeGridInstance } from 'balala-vxe-table'
import { message } from 'ant-design-vue'
import { getMemberOptions } from '../../config/user'
import router from '@/router'
import { deepCopy } from '@/utils'
import type { UserListItem } from '@/api/interface'
import {
  projectTransferOwnership,
  spaceManagerAdd,
  spaceManagerList,
  spaceManagerRemove,
} from '@/api/project'
import { usePermission } from '@/hooks/usePermission'
import { Perm } from '@/enum/permission'
import { SpaceRole } from '@/enum'
import { EmitEvent } from '@/enum/event'
import { useEmitter } from '@/hooks/useEmitter'

const emits = defineEmits(['handleLoading'])
const { emitUpdate } = useEmitter<string>(EmitEvent.UPDATE_USER_LIST)

const getInfo: Function = inject('getInfo') as Function
const { checkPerm } = usePermission()
/** DATA */
const introUserGrid = ref<VxeGridInstance>() // 表格 DOM
const currentItem = ref<any>()
const projectList = ref<any[]>([]) // 项目成员数据

const removeDialog: {
  visible: boolean
  removeItem: {
    title: string
    options: Array<any> // Replace 'any' with the actual type
    selected: any // Replace 'any' with the actual type
    count: number
  }
} = reactive({
  visible: false,
  removeItem: {
    title: '',
    options: [],
    selected: null,
    count: 0,
  },
})

const memberDialog: {
  visible: boolean
} = reactive({
  visible: false,
})

onMounted(() => {
  getDataList(true)
})
// 获取成员列表
async function getDataList(isShowLoading: boolean = false) {
  try {
    if (isShowLoading)
      emits('handleLoading', true)

    const id = router.currentRoute.value.params.id as string
    const { data } = await spaceManagerList(id || '')
    setTimeout(() => {
      emits('handleLoading', false)
      projectList.value = data?.list || []
      nextTick(() => {
        const $grid = introUserGrid.value
        requestAnimationFrame(async () => {
          if ($grid)
            $grid.reloadData(projectList.value)
        })
        getInfo && getInfo(false)
      })
    }, 400)
  }
  catch (error) {
    emits('handleLoading', false)
  }
}

// 添加项目成员弹框 点击确认
function dialogConfirm(arr: UserListItem[]) {
  const list = deepCopy(arr.filter(item => !item.disabled))
  const filterList = list.map((item: UserListItem) => {
    return item.id
  })

  createMember(filterList)
}

// 添加管理员
async function createMember(users: string[]) {
  try {
    await spaceManagerAdd(router.currentRoute.value.params.id as string, users)
    message.success('项目管理员添加成功', 3)
  }
  finally {
    getDataList()
    emitUpdate('updateUserList')
  }
}

// 移除弹框 确认移除
async function confirmRemove() {
  try {
    await spaceManagerRemove(currentItem.value?.spaceId, [currentItem.value?.userId])
    emitUpdate('updateUserList')
    // message.success(`项目管理员 ${currentItem.value?.userNickname} 已移除`, 2)
    message.success(
      {
        content: h('p', {
          innerHTML: `项目管理员 ${currentItem.value?.userNickname}<span class="minor-color">(${currentItem.value?.userName})</span> 已移除`,
        }),
      },
      2,
    )
    removeDialog.visible = false
    removeDialog.removeItem = {
      title: '',
      options: [],
      selected: null,
      count: 0,
    }
    getDataList()
  }
  catch (error) {}
}

// 转移创建者
const transferDialog = ref<boolean>(false)
const checked = ref<boolean>(false)
function onTransfer(row: any) {
  currentItem.value = row
  transferDialog.value = true
}

// 确认 - 转移项目创建者
async function confirmTransfer() {
  if (!checked.value) {
    message.error('请确认已知悉转移创建者的风险')
    return
  }
  await projectTransferOwnership(
    currentItem.value?.spaceId || '',
    currentItem.value?.userId || '',
  ).then(() => {
    message.success('项目创建者已转移')
    currentItem.value = {} as any
    transferDialog.value = false
    getDataList()
    getInfo && getInfo()
  })
}

// 移除
function onRemove(row: any) {
  currentItem.value = row
  removeDialog.removeItem.title = `确认移除 ${row.userNickname}<span class="minor-color">（${row.userName}）</span>的项目管理员身份？`
  removeDialog.visible = true
}

// 监听滚动条自定义滚动
function handleScroll(e: { scrollLeft: number, scrollTop: number }) {
  introUserGrid.value?.scrollTo(0, e.scrollTop)
}

// 监听表格滚动
const customScrollRef = ref()
function gridScroll(e: { scrollTop: number }) {
  customScrollRef.value?.setScrollTop(e.scrollTop)
}
</script>

<template>
  <div class="h32 intro-member-title flex-row-between mb24">
    <div class="left flex-row-start icon-color pfm text16">
      项目管理员
      <span class="minor-color text14 ml8">共 {{ projectList.length }}</span>
    </div>
    <a-button v-if="checkPerm(Perm.AddSpaceSuperManager)" class="add-btn" @click="memberDialog.visible = true">
      添加管理员
    </a-button>
  </div>
  <div class="table-wrap">
    <vxe-grid
      ref="introUserGrid"
      class="intro-user-grid"
      :class="{ 'no-data': projectList.length === 0 }"
      v-bind="getMemberOptions(checkPerm(Perm.RemoveSpaceSuperManager))"
      :params="{ isGroup: false }"
      :row-class-name="checkPerm(Perm.RemoveSpaceSuperManager) ? 'hasPerm' : ''"
      @scroll="gridScroll"
    >
      <!-- 成员名称头部 -->
      <template #name_header>
        <p class="flex-row-start pl5">
          成员
        </p>
      </template>
      <!-- 成员名称 -->
      <template #name_default="{ row }">
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
          <p class="username text13 minor-color short-name">
            <b-ellipsis :content="row.userName" />
          </p>
        </div>
      </template>
      <!-- 工具栏 -->
      <template #tool_default="{ row }">
        <a-popover
          v-if="checkPerm(Perm.TransferSpaceCreator)"
          placement="bottomRight"
          overlay-class-name="operation-popover"
          :align="{ offset: [0, -9] }"
        >
          <template #content>
            <div class="operation-item" @click="onTransfer(row)">
              <div class="pfm icon-color">
                转移创建者
              </div>
              <div class="minor-color text13">
                拥有项目空间所有权限
              </div>
            </div>

            <div class="operation-item" @click="onRemove(row)">
              <div class="pfm icon-color">
                移除管理员
              </div>
              <div class="minor-color text13">
                移除后恢复成员原来权限
              </div>
            </div>
          </template>
          <div
            v-if="checkPerm(Perm.TransferSpaceCreator) && row.roleId !== SpaceRole.CREATOR"
            class="more-icon pointer flex-row-center flex-inline"
          >
            <svg-icon name="more" size="16" color="#333333" />
          </div>
        </a-popover>
      </template>

      <!-- 空数据模板 -->
      <template #empty>
        <div v-if="projectList.length === 0" class="empty-box flex-row-center">
          <p v-if="checkPerm(Perm.AddSpaceSuperManager)" class="text14 minor-color">
            当前暂无管理员，请添加
          </p>
          <p v-else class="text14 minor-color">
            请联系 <span class="icon-color">项目创建者</span> 添加管理员
          </p>
        </div>
      </template>
    </vxe-grid>

    <!-- 自定义滚动条 -->
    <el-scrollbar
      ref="customScrollRef"
      max-height="calc(100vh - 199px)"
      :style="{ top: `${183}px` }"
      class="scrollbar"
      always
      @scroll="handleScroll"
    >
      <div class="w6" :style="{ height: `${projectList.length * 48}px` }" />
    </el-scrollbar>
  </div>
  <b-member-dialog
    :dialog-visible="memberDialog.visible"
    :project-current-list="projectList"
    confirm-btn-text="添加"
    title="添加项目管理员"
    user-type="manager"
    type="projectIntro"
    tip-content="成员"
    @on-confirm="dialogConfirm"
    @on-close="memberDialog.visible = false"
  />

  <!-- 移除成员确认弹框 -->
  <b-dialog
    v-model:dialogVisible="removeDialog.visible"
    width="480"
    title="是否确认移除项目管理员"
    title-icon="orange.svg"
    @on-confirm="confirmRemove"
  >
    <p class="desc text14 icon-color mb16">
      1、{{ currentItem?.userNickname }}
      <span class="user-name minor-color"> ({{ currentItem?.userName }}) </span>
      ，将移除项目管理相关的权限。<br>
      2、移除后，该成员的权限将回到成为项目管理员之前的权限。
    </p>
  </b-dialog>

  <!-- 转移项目空间创建者 -->
  <b-dialog
    v-model:dialogVisible="transferDialog"
    width="480px"
    title="是否确认转移项目空间创建者？"
    title-icon="orange.svg"
    @on-confirm="confirmTransfer"
    @on-cancel="checked = false"
  >
    <p class="desc text14 icon-color mb16">
      1、该项目空间创建者转移给 {{ currentItem?.userNickname }}
      <span class="user-name minor-color"> ({{ currentItem?.userName }}) </span>
      ，将获得创建者权限。<br>
      2、您自身权限将自动变更为“可管理”。
    </p>
    <div class="text14 minor-color mt4 el-checkobx-label-color">
      <el-checkbox v-model="checked" size="large">
        我已知悉转移创建者的风险
      </el-checkbox>
    </div>
  </b-dialog>
</template>

<style lang="scss" scoped>
.add-btn {
  width: 96px;
  height: 32px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid $color-border-main;
  color: $color-title;
  padding: 0;
  &:hover {
    border-color: $color-border-main;
    color: $color-title;
  }
}

.intro-user-grid {
  position: relative;
  :deep(.vxe-table) {
    .vxe-table--render-wrapper {
      display: block;
      .vxe-table--main-wrapper {
        .vxe-table--header-wrapper {
          background-color: #fafbfc;
          .vxe-table--header-border-line {
            border-bottom: 0;
            background-image: linear-gradient(#edeef0, $color-border-main),
              linear-gradient(#edeef0, $color-border-main);
          }

          .vxe-header--row {
            .vxe-header--column {
              padding: 1px 0;
              height: 40px;
              background-image: linear-gradient(#edeef0, $color-border-main),
                linear-gradient(#edeef0, $color-border-main);
              &:last-child {
                background-image: linear-gradient(transparent, transparent),
                  linear-gradient(#edeef0, $color-border-main);
              }
            }
          }
          .vxe-cell--title {
            font-size: 14px;
            color: $color-main;
          }
        }
        .vxe-table--body-wrapper {
          .vxe-table--body {
            .vxe-body--row {
              .vxe-body--column {
                position: relative;
                background-image: linear-gradient(#edeef0, $color-border-main),
                  linear-gradient(#edeef0, $color-border-main);
                &:last-child {
                  background-image: linear-gradient(transparent, transparent),
                    linear-gradient(#f2f3f5, #f2f3f5);
                }
              }
              &.row--hover {
                background: $color-default-hover;
                &.hasPerm {
                  .drag-btn {
                    opacity: 1;
                    cursor: move;
                  }
                }
              }
            }
          }
          &::-webkit-scrollbar {
            // 整体样式
            background-color: transparent;
            width: 0px;
            height: 0px;
            border: 0px solid transparent !important;
          }
        }

        .auth-btn {
          background: $color-input;
          border: 1px solid $color-input;
          cursor: pointer;
          transition: 0.3s all;
          &:hover {
            background: #fff;
            border-color: $color-border-main;
          }
          &.disabled {
            cursor: not-allowed;
          }
        }

        .tool-box {
          width: 20px;
          height: 20px;
          border-radius: 2px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          &:hover {
            background: $color-bg-hover;
          }
          &.del-hide {
            opacity: 0;
            pointer-events: none;
          }
        }
      }
    }
    .vxe-table--border-line {
      border: 0;
    }
  }
  :deep(.vxe-grid--bottom-wrapper) {
    position: absolute;
    right: 0;
    top: 40px;
  }
  &.no-data {
    :deep(.vxe-table) {
      .vxe-table--render-wrapper {
        display: none;
      }
      .vxe-table--empty-placeholder {
        height: 215px !important;
        position: relative;
        .vxe-table--empty-content {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          .empty-box {
            height: 100%;
          }
        }
      }
    }
  }
}

.scrollbar {
  position: absolute;
  right: 24px;
  top: 119px;
  bottom: 0;
  :deep(.el-scrollbar__bar.is-vertical) {
    right: 0px;
  }
}

.operation-popover {
  :global(.operation-popover .ant-popover-content) {
    width: 204px;
  }

  :global(.operation-popover .ant-popover-title) {
    margin-bottom: 0;
  }

  :global(.operation-popover .ant-popover-inner) {
    padding: 8px;
  }

  .operation-item {
    border-radius: 4px;
    padding: 8px;
    cursor: pointer;
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
}

.more-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

.table-wrap {
  height: calc(100vh - 164px);
  .scrollbar {
    opacity: 0;
  }
  &:hover {
    .scrollbar {
      opacity: 1;
    }
  }
}
</style>

<style lang="scss">
.space-auth-popover {
  .ant-popover-inner {
    padding: 0;
  }
}
</style>
