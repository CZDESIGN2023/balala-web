<script lang="ts" setup>
import { computed, onMounted, reactive, ref, shallowRef } from 'vue'
import { message } from 'ant-design-vue'
import ChangeHead from './changeHead.vue'
import { useUserStore } from '@/stores/modules/user'
import { deepCopy, getTextLength } from '@/utils'
import { getMyInfo, userNickNameSet } from '@/api/user'
import { verifyNickname } from '@/views/login/config/validate'

const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)
const showNickNameTip = computed(() => userStore.showNickNameTip)

// 用户昵称数据
const nickNameData = reactive<{ contenteditable: boolean, nickName: string, cloneName: string }>({
  contenteditable: false,
  nickName: '',
  cloneName: '',
})
const userInputRef = ref<HTMLInputElement | null>(null)

// 点击出现用户名编辑框
function openEditName() {
  nickNameData.cloneName = deepCopy(userInfo.value.userNickname)
  nickNameData.contenteditable = !nickNameData.contenteditable
  setTimeout(() => {
    userInputRef.value?.focus()
  }, 100)
}

// 修改昵称
async function editName(name: string) {
  const reg = /^[\w\u4E00-\u9FA5]+$/
  const length = getTextLength(name)

  userStore.setNickNameTip(true)
  if (nickNameData.cloneName === name) {
    nickNameData.contenteditable = false
    return
  }

  if (!reg.test(name) || !(length >= 2 && length <= 14) || !name) {
    nickNameData.contenteditable = false
    message.error('请输入有效格式(2 ~ 14个字符，支持中英文/数字/下划线)', 2)
    nickNameData.nickName = nickNameData.cloneName
    return
  }
  try {
    await userNickNameSet(name)
    message.success('昵称修改成功', 3)
    nickNameData.nickName = name
    nickNameData.contenteditable = false
    requestAnimationFrame(() => {
      getUserInfo()
    })
  }
  catch (error) {
    setTimeout(() => {
      userInputRef.value?.focus()
    }, 10)
  }
}

// 昵称编辑回车
function namePressEnter() {
  setTimeout(() => {
    userInputRef.value?.blur()
  }, 30)
}

// 获取用户信息
async function getUserInfo() {
  const { data } = await getMyInfo()
  userStore.setUserInfo(data)
  nickNameData.nickName = data.userNickname
}

onMounted(() => {
  getUserInfo()
})

// 是否显示修改头像
const showChangeHead = ref<boolean>(false)
// 上传图片地址
const headInfo = ref<string>('')
function handleFileSelect() {
  const fileInput = document.createElement('input')
  fileInput.setAttribute('type', 'file')
  fileInput.setAttribute('accept', '.bmp, .jpg, .png, .jpeg')

  // 当用户选择了文件后会触发change事件
  fileInput.onchange = function (e: any) {
    const selectedFile = e.target.files[0]
    // 将所选文件转换为URL并设置到图像标签上进行展示
    headInfo.value = selectedFile
    showChangeHead.value = true
  }

  // 模拟点击文件输入框，从而触发文件选择对话框
  fileInput.click()
}
</script>

<template>
  <div class="module user-module flex-column-center mb32">
    <div class="avatar-box mb8" @click="handleFileSelect">
      <div class="camera flex-row-center pointer">
        <svg-icon name="camera" size="16px" color="#333333" />
      </div>
      <b-head
        :id="userInfo.id"
        width="72px"
        :src="userInfo.avatar"
        :name="userInfo.userNickname"
        fs="text28"
      />
    </div>
    <div class="user-box flex-column-center">
      <div
        v-if="!nickNameData.contenteditable"
        class="edit pointer flex-row-between mb3"
        @click="openEditName"
      >
        <p class="nickname text16 icon-color ss-line-1">
          <b-ellipsis :content="nickNameData.nickName" />
        </p>
        <svg-icon class="flex-shrink-0 ml8" name="painting" size="16" color="#333333" />
      </div>
      <el-tooltip
        v-else
        :disabled="showNickNameTip"
        :visible="nickNameData.contenteditable"
        placement="top"
        :offset="10"
        content="推荐使用熟悉的昵称，如全名"
      >
        <a-input
          ref="userInputRef"
          v-model:value="nickNameData.nickName"
          class="user-input gray-input flex-row-between mb3"
          :maxlength="20"
          size="default"
          type="text"
          @blur="editName(nickNameData.nickName)"
          @press-enter="namePressEnter"
        />
      </el-tooltip>
      <p class="text13 minor-color">
        {{ userInfo.userName }}
      </p>
    </div>
  </div>

  <ChangeHead
    v-if="showChangeHead"
    :is-show="showChangeHead"
    :head-info="headInfo"
    @on-close="showChangeHead = false"
    @re-upload="handleFileSelect"
  />
</template>

<style lang="scss" scoped>
.user-module {
  .avatar-box {
    position: relative;
    width: 72px;
    height: 72px;
    .camera {
      position: absolute;
      width: 24px;
      height: 24px;
      border-radius: 12px;
      padding: 4px;
      gap: 10px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(4px);
      right: 0;
      bottom: 0;
      transition: all 0.4s;
      z-index: 5;
      &:hover {
        background: rgba(255, 255, 255, 0.55);
      }
    }
  }
  .user-box {
    .edit {
      max-width: 149px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0px 11px 0 12px;
      border: 1px solid transparent;
      transition: border 0.3s;
      &:hover {
        border: 1px solid $color-border-main;
      }
      .svg-icon {
        &:hover {
          cursor: pointer;
        }
      }
      &.isDis {
        cursor: not-allowed;
        .svg-icon {
          pointer-events: none;
        }
      }
    }
    .user-input {
      width: 146px;
      height: 32px;
    }
  }
}
</style>
