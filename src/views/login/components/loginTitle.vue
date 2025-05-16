<script lang="ts" setup>
import { computed } from 'vue'
import { ConfigKey } from '@/enum'
import { getConfigDomain } from '@/utils'

const siteLogo = computed(() => {
  if (getConfigDomain(ConfigKey.LOGO)) {
    return `${getConfigDomain(ConfigKey.SPACE_FILE_DOMAIN)}${getConfigDomain(ConfigKey.LOGO)}`
  }
  else {
    return import.meta.env.VITE_LOGO_URL
  }
})
const siteTitle = computed(() => {
  return `${getConfigDomain(ConfigKey.TITLE)}` || 'Balala'
})
</script>

<template>
  <!-- 标题 -->
  <div class="login-wrap-top pt48">
    <div class="login-title pl48">
      <img class="w40 mr8 br8" :src="siteLogo" alt="">
      <p class="flex-row-center">
        <span class="text22 pfm font-smoothing">{{ siteTitle }}</span>
        <span class="line ml15 mr15 w1 h18" />
        <span class="text20 pfr font-smoothing">协作效率标准化管理工具</span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .login-wrap-top {
  background-color: #fff;
  .login-title {
    display: flex;
    align-items: center;
    color: #333;
    position: relative;
    z-index: 100;
    .line {
      background: #333;
      display: inline-flex;
    }
  }
}
</style>
