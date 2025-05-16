<script lang="ts" setup>
import { computed } from 'vue'
import loginTitle from './components/loginTitle.vue'
import loginBg from './components/loginBg.vue'
import loginFooter from './components/loginFooter.vue'
import loginForm from './components/loginForm.vue'
import thirdForm from './components/thirdForm.vue'
import { useGetThirdToken } from '@/hooks/useGetThirdToken'

const activeForm = computed(() => {
  const { im_token } = useGetThirdToken()
  if (im_token.value)
    return thirdForm
  return loginForm
})
</script>

<template>
  <div class="login-wrap">
    <login-title />
    <div class="login-wrap-bottom">
      <!-- 背景 -->
      <login-bg />
      <!-- 表单部分 -->
      <component :is="activeForm" />
      <!-- 底部 -->
      <login-footer />
    </div>
  </div>
</template>

<style lang="scss">
@import './index.scss';
.welcome-info {
  width: auto;
  min-width: 270px;
}
</style>
