<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue'
import draggable from 'vuedraggable'
import { useProjectStore } from '@/stores/modules/project'
import router from '@/router'
import { setSpaceOrder } from '@/api/user'
import { useNoticeStore } from '@/stores/modules/notice'
import { useUserStore } from '@/stores/modules/user'
import { useSpaceStore } from '@/stores/modules/space'

const useNotice = useNoticeStore()
const projectStore = useProjectStore()
const spaceStore = useSpaceStore()
const projectList = computed(() => projectStore.projectList)
const visible = ref<boolean>(false)

const isShowDot = computed(() => {
  const { userInfo } = useUserStore()
  const userNoticeCounts = useNotice.userNoticeCounts[userInfo.id]
  if (!userNoticeCounts)
    return false

  return (
    userNoticeCounts.sysIndex > 0 ||
    userNoticeCounts.commentIndex > 0 ||
    userNoticeCounts.todoIndex > 0
  )
})

function toCreateProject() {
  visible.value = false
  router.push(`/project/add`)
}

function toProject(data: any) {
  const id = Number(data.id)
  const roleId = Number(data.roleId)
  if(id === Number(useNotice.joinSpaceId)) {
    useNotice.setJoinTooltip(false)
  }
  spaceStore.setUserStatus(roleId)
  nextTick(() => {
    router.push(`/project/${id}`)
  })
}

// 移动列表
const drag = ref<boolean>(false)
function onMoveProject(data: any) {
  const moved = data.moved
  fnSetSpaceOrder(moved.oldIndex, moved.newIndex)
}

// 移动后请求接口
async function fnSetSpaceOrder(fromIdx: number, toIdx: number) {
  await setSpaceOrder(fromIdx, toIdx)
  const source = projectList.value[fromIdx]
  projectList.value.splice(fromIdx, 1)
  projectList.value.splice(toIdx, 0, source)
}

function dragStart() {
  drag.value = true
}
function dragEnd() {
  drag.value = false
}
</script>

<template>
  <div class="app-sidebar-menu">
    <div class="list">
      <div class="tooltip" v-show="useNotice.isShowJoinTooltip">
        <svg fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24">
          <g clip-path="url(#master_svg0_3104_7563)"><g>
          <path d="M14.49187501800537,15.537097332153321Q14.477675018005371,14.17470733215332,15.35338501800537,13.138967332153321Q16.43030501800537,11.88513733215332,16.419655018005372,10.23207733215332Q16.42006501800537,9.12402733215332,15.905135018005371,8.15822733215332Q15.415315018005371,7.23951733215332,14.558945018005371,6.631626332153321Q13.702585018005372,6.0237373321533205,12.673715018005371,5.86440813215332Q11.592105018005372,5.69691233215332,10.542615018005371,6.06409033215332Q9.493105018005371,6.43126733215332,8.751825018005372,7.23651733215332Q8.046690018005371,8.002507332153321,7.7560690180053715,9.01167733215332Q7.465449018005371,10.02084733215332,7.655195918005371,11.044547332153321Q7.854668018005371,12.120717332153319,8.54814101800537,12.98982733215332L8.55762601800537,13.00139733215332Q9.486875018005371,14.10451733215332,9.511395018005372,15.54665733215332Q9.511315018005371,15.88983733215332,9.76076501800537,16.13933733215332Q10.01020501800537,16.38873733215332,10.362985018005372,16.38873733215332L13.640215018005371,16.38873733215332Q13.99298501800537,16.38873733215332,14.24243501800537,16.13933733215332Q14.49187501800537,15.88983733215332,14.49187501800537,15.537097332153321ZM11.438995018005372,12.49522733215332L10.481985018005371,11.68704733215332C10.244635018005372,11.48660733215332,10.214705018005372,11.13171733215332,10.415145018005372,10.894367332153319C10.61558501800537,10.65701733215332,10.97047501800537,10.62708733215332,11.207825018005371,10.82752733215332L12.001485018005372,11.49775733215332L12.795235018005371,10.827487332153321C12.909215018005371,10.73123733215332,13.056765018005372,10.68420733215332,13.205425018005371,10.69673733215332C13.354075018005371,10.70927733215332,13.49166501800537,10.78035733215332,13.587915018005372,10.89433733215332C13.68416501800537,11.008317332153322,13.731195018005371,11.15586733215332,13.718665018005371,11.30452733215332C13.706125018005372,11.45317733215332,13.635045018005371,11.59076733215332,13.521065018005372,11.68701733215332L12.563995018005372,12.49520733215332L12.564055018005371,13.69909733215332C12.56406501800537,13.84828733215332,12.50480501800537,13.99136733215332,12.39932501800537,14.09685733215332C12.293835018005371,14.20234733215332,12.150765018005371,14.261617332153321,12.001585018005372,14.26162733215332C11.690925018005371,14.26164733215332,11.439075018005372,14.00981733215332,11.439055018005371,13.69915733215332L11.438995018005372,12.49522733215332ZM10.716395018005372,18.18803733215332L13.286775018005372,18.18803733215332C13.59743501800537,18.18803733215332,13.849275018005372,17.93623733215332,13.849275018005372,17.62553733215332C13.849275018005372,17.31493733215332,13.59743501800537,17.06303733215332,13.286775018005372,17.06303733215332L10.716395018005372,17.06303733215332C10.405735018005371,17.06303733215332,10.153895018005372,17.31493733215332,10.153895018005372,17.62553733215332C10.153895018005372,17.93623733215332,10.405735018005371,18.18803733215332,10.716395018005372,18.18803733215332Z" fill-rule="evenodd" fill="#FFB74B" fill-opacity="1"/>
          </g>
          </g>
        </svg>
        <p class="flex-one">您已加入新项目</p>
        <span class="icon flex-row-center pointer" @click="useNotice.setJoinTooltip(false)">
          <svg-icon name="close-tooltip" size="14" color="#666666" />
        </span>
        <div class="triangle" />
      </div>
      <router-link
        to="/"
        class="item dashboard-item flex-row-center"
        :class="{ active: $route.path === '/home' }"
      >
        <svg-icon :name="$route.path === '/home' ? 'dashboard' : 'dashboard-outline'" size="24" color="#333333" />
        <p class="text14 icon-color flex-one ml8 line16 pfm">
          工作台
        </p>
      </router-link>
      <!-- 通知图标 -->
      <div class="notice_Box" @click="useNotice.setShowNotice()">
        <span v-if="isShowDot" />
        <svg-icon :class="{'swing-animate': isShowDot}" name="notice_ico" size="16" color="#333333" />
      </div>
      <div class="item group-item flex-row-center">
        <svg-icon name="book" size="24" color="#333333" />
        <p class="text14 icon-color flex-one ml8 line16">
          项目列表
        </p>
        <a-popover
          v-model:open="visible"
          placement="bottomLeft"
          :align="{ offset: [0, -6] }"
          overlay-class-name="creat-icon"
          :z-index="900"
        >
          <template #content>
            <div class="creat-project pointer" @click="toCreateProject">
              <div class="creat-project-box flex-row-start">
                <svg-icon name="project-add" size="16" color="#333333" />
                <div class="creat-title ml8 text14">
                  创建项目
                </div>
              </div>
            </div>
          </template>
          <div class="add-icon flex-row-center" :class="{ bg: visible }">
            <svg-icon name="add" size="16" color="#333333" />
          </div>
        </a-popover>
      </div>
      <el-scrollbar v-if="projectList.length > 0" height="100%" always>
        <div>
          <draggable
            v-model="projectList"
            item-key="id"
            chosen-class="ghost"
            ghost-class="ghostClass"
            :force-fallback="true"
            :fallback-on-body="true"
            handle=".handle"
            @start="dragStart"
            @end="dragEnd"
            @change="onMoveProject"
          >
            <template #item="{ element }">
              <transition-group name="slide" tag="ul">
                <div :key="element.id">
                  <div
                    class="item project-item flex-row-start text14 icon-color"
                    :class="{ active: $route.params.id === element.id }"
                    @click.stop="toProject(element)"
                  >
                    <!-- 拖拽图标 -->
                    <svg-icon
                      v-show="!drag"
                      class="drag-icon handle select-none"
                      name="drag_icon"
                      size="16"
                      color="#999"
                    />
                    <!-- {{ element.spaceName }} -->
                    <b-ellipsis
                      content-class="font-smoothing pfm"
                      fs="14"
                      :content="element.spaceName"
                    />
                  </div>
                </div>
              </transition-group>
            </template>
          </draggable>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.slide-move {
  transition: transform 0.5s ease-in-out;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease-in-out;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.app-sidebar-menu {
  height: calc(100% - 80px);
  .notice_Box {
    position: absolute;
    right: 16px;
    top: 8px;
    width: 24px;
    height: 24px;
    border-radius: 4px;

    z-index: 2;
    display: inline-block;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    span {
      position: absolute;
      right: -1px;
      top: -1px;
      width: 8px;
      height: 8px;
      border-radius: 100px;
      background: #fd4c4c;
      z-index: 3;
    }

    &:hover {
      background: $color-default-hover;
    }
    &:active {
      background: $color-default-active;
    }
  }
  .list {
    height: 100%;
    :deep(.el-scrollbar) {
      height: calc(100% - 96px);
    }
    position: relative;
    .tooltip {
      position: absolute;
      z-index: 10;
      top: 46px;
      right: 12px;
      display: flex;
      flex-direction: row;
      justify-content: start;
      align-items: center;
      padding-left: 4px;
      padding-right: 8px;
      gap: 8px;
      font-size: 13px;
      color: #333333;
      width: 216px;
      height: 40px;
      border-radius: 6px;
      background: radial-gradient(28% 102% at 0% 0%, #FFF3E0 0%, rgba(255, 255, 255, 0) 100%), #FFFFFF;
	    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.06);
      .triangle {
        position: absolute;
        content: '';
        width: 0px;
        height: 0px;
        margin: auto;
        border: 7px solid transparent;
        border-top: 7px solid #fff;
        bottom: -14px;
        left: 36px;
        position: absolute;
      }
      .icon {
        width: 14px;
        height: 14px;
        border-radius: 2px;
        &:hover {
          background: $color-bg-hover;
        }
      }
    }
  }
  .item {
    width: calc(100% - 24px);
    margin: 4px auto;
    height: 36px;
    border-radius: 6px;
    transition: all 0.2s;
    padding-left: 36px;
    margin-top: 4px;
    cursor: pointer;
    position: relative;
    .drag-icon {
      position: absolute;
      left: 8px;
      opacity: 0;
      cursor: grab;
      &:active {
        cursor: grabbing;
      }
    }

    &:hover {
      background: $color-default-hover;
      .drag-icon {
        opacity: 1;
      }
    }
    &:active {
      background: $color-default-active;
    }
    &.active {
      background: $color-default-bg;
    }
    p {
      word-break: break-all;
    }
  }
  
  .group-item {
    width: 100%;
    // padding-right: 4px;
    // padding-left: 4px;
    height: 40px;
    padding: 0 16px;
    &:hover {
      background: none;
    }
    .add-icon {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      &:hover {
        background: $color-default-hover;
      }
      &:active {
        background: $color-default-active;
      }
      &.bg {
        background: $color-bg-hover;
      }
    }
  }
  .dashboard-item {
    height: 40px;
    padding-left: 4px;
    margin-top: 0;
    &.active {
      p {
        font-family: 'CustomFont-Medium';
        -webkit-font-smoothing: antialiased;
      }
    }
  }
}

.creat-icon {
  :global(.creat-icon .ant-popover-inner) {
    border-radius: 8px;
    box-shadow: none;
    padding: 0;
  }

  .creat-title {
    color: #333333;
  }

  .creat-project {
    width: 160px;
    height: 48px;
    border-radius: 8px;
    background: #FFFFFF;
    border: 1px solid $tool-drop-box-border;
    padding: 8px;
    box-shadow: $tool-drop-box-shadow;
    display: flex;
    align-items: center;
    .creat-project-box {
      width: 100%;
      height: 100%;
      border-radius: 4px;
      padding-left: 8px;
    }
    &:hover {
      .creat-project-box {
        background: $color-default-hover;
      }
    }
    &:active {
      .creat-project-box {
        background: $color-default-hover;
      }
    }
  }
}

.sortable-drag {
  background: rgba(255, 255, 255, 0.85) !important;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.07) !important;
  border: 1px solid $color-border-main !important;
  opacity: 1 !important;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding-left: 8px;
  .drag-icon {
    display: none !important;
  }
}

.ghostClass {
  border-top: 2px solid #1d74f5;
  .item {
    background: #fafbfc !important;
    cursor: grabbing !important;
  }
}
</style>

<style lang="scss">
  .drag-icon {
    &:hover {
      use {
        fill: #666666 !important;
      }
    }
  }
</style>