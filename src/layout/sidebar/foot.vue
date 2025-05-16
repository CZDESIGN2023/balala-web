<script lang="ts" setup>
import { computed, inject, ref } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { userLogout } from '@/api/user'
import router from '@/router'
import { LOGIN_URL } from '@/config'
import { useProjectStore } from '@/stores/modules/project'
import { useNoticeStore } from '@/stores/modules/notice'

withDefaults(defineProps<Props>(), {
  isCollapse: false,
})

const socketClient: any = inject('socketClient')

interface Props {
  isCollapse?: boolean
}

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
// 是否显示退出登录
const dialogVisible = ref<boolean>(false)
const showPoper = ref<boolean>(false)
const projectStore = useProjectStore()
const useNotice = useNoticeStore()

// 退出登录
async function logout() {
  await userLogout()

  router.replace(LOGIN_URL)
  userStore.reset()
  projectStore.customReset()
  useNotice.reset(false)
  socketClient.closeWebsocket()
}
// 跳转
function jump(url: string) {
  router.push(url)
}
</script>

<template>
  <div class="pl4 pr4 flex-row-start ml12 mr12" :class="{ 'bg': showPoper, 'app-sidebar-foot': !isCollapse }">
    <a-dropdown
      :align="{ offset: isCollapse ? [0, 6] : [0, 10] }"
      :get-popup-container="(triggerNode: any) => triggerNode.parentNode"
    >
      <div v-if="isCollapse" class="head-hover flex-row-center pointer">
        <b-head
          :id="userInfo.id"
          width="28px"
          :name="userInfo.userNickname"
          :src="userInfo.avatar"
        />
      </div>

      <div v-else class="full-100 flex-row-start">
        <b-head
          :id="userInfo.id"
          width="28px"
          :name="userInfo.userNickname"
          :src="userInfo.avatar"
        />
        <p class="name ml4 flex-one pointer ss-line-1">
          {{ userInfo.userNickname }}
        </p>
        <svg-icon class="pointer" name="set" size="24" color="#666666" />
      </div>

      <template #overlay>
        <div class="set-popover pointer">
          <div class="top">
            <div class="top-item flex-row-start" @click="jump('/my')">
              <b-head
                :id="userInfo.id"
                width="42px"
                fs="text16"
                :src="userInfo.avatar"
                :name="userInfo.userNickname"
              />
              <div class="info ml12 info-overflow">
                <p class="nickname">
                  <b-ellipsis fs="16" content-class="pfm font-smoothing" :content="userInfo.userNickname" />
                </p>

                <p class="username text13">
                  <b-ellipsis fs="13" :content="userInfo.userName" />
                </p>
              </div>
            </div>
          </div>
          <div class="bot">
            <div class="btn" @click="jump('/my')">
              <svg-icon name="person-setting" size="16" color="#333333" />
              个人设置
            </div>
            <div class="btn" @click="jump('/system')">
              <svg-icon name="menu-set" size="16" color="#333333" />
              系统设置
            </div>
            <div v-if="Number(userInfo.role) >= 50" class="btn" @click="jump('/manager')">
              <svg-icon name="setIcon" size="16" color="#333333" />
              管理系统
            </div>
            <div class="btn" @click="dialogVisible = true">
              <svg-icon name="logout" size="16" color="#333333" />
              退出登录
            </div>
          </div>
        </div>
      </template>
    </a-dropdown>
  </div>

  <!-- 退出登录弹框 -->
  <b-dialog
    v-model:dialogVisible="dialogVisible"
    width="360px"
    title-icon="warning.svg"
    title="确认退出登录项目管理系统吗？"
    confirm-btn-color="danger"
    confirm-btn-text="退出"
    @on-confirm="logout"
  />
</template>

<style lang="scss">
.app-sidebar-foot {
  // width: 100%;
  height: 40px;
  font-size: 16px;
  letter-spacing: 0em;
  border-radius: 6px;
  color: $color-title;
  &:hover,
  &.bg {
    background: $color-default-hover;
  }
  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    // background: linear-gradient(180deg, #6ba7ff 0%, #1d74f5 100%);
    color: #fff;
  }
  .name {
    font-size: 14px;
    font-weight: initial;
    color: $color-icon;
  }
}
.set-popover {
  width: 208px;
  background: #fff;
  width: 208px;
  border-radius: 8px;
  background: #FFFFFF;
  border: 1px solid $tool-drop-box-border;
  box-shadow: $tool-drop-box-shadow;
	
  .top {
    padding: 10px 8px;
    position: relative;
    width: 100%;

    .top-item {
      border-radius: 6px;
      padding: 8px;
      &:hover {
        background: $color-default-hover;
      }
      &:active {
        background: $color-default-active;
      }
    }
    .avatar {
      width: 44px;
      height: 44px;
    }
    .nickname {
      color: $color-icon;
      word-wrap: break-word;
      word-break: break-all;
      margin-bottom: -2px;
    }
    .username {
      color: $color-minor;
      word-wrap: break-word;
      word-break: break-all;
    }
    &::after {
      content: '';
      width: 100%;
      height: 1px;
      background: $color-input-hover;
      position: absolute;
      bottom: 0;
      left: 0;
    }
  }
  .bot {
    padding: 8px;
    .btn {
      width: 100%;
      height: 40px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 6px;
      cursor: pointer;
      &:hover {
        background: $color-default-hover;
      }
      &:active {
        background: $color-default-active;
      }
      color: $color-icon;
      font-size: 14px;
    }
  }
}
</style>

<style lang="scss" scoped>
.info-overflow {
  width: 100%;
  overflow: hidden;
}

.head-hover {
  width: 40px;
  height: 40px;
  border-radius: 6px;

  &:hover {
    background: $color-default-hover;
  }
}
</style>
