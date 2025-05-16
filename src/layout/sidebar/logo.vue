<script lang="ts" setup>
import { computed } from 'vue'
import { ConfigKey } from '@/enum'
import { getConfigDomain } from '@/utils'

withDefaults(defineProps<Props>(), {
  isCollapse: false,
})

const siteLogo = computed(() => {
  if (getConfigDomain(ConfigKey.LOGO)) {
    return `${getConfigDomain(ConfigKey.SPACE_FILE_DOMAIN)}${getConfigDomain(ConfigKey.LOGO)}`
  }
  else {
    return import.meta.env.VITE_LOGO_URL
  }
})

interface Props {
  isCollapse?: boolean
}
</script>

<template>
  <router-link
    to="/"
    class="app-sidebar-logo"
    :class="isCollapse ? 'flex-row-center' : 'pl4 flex-row-start'"
  >
    <img :src="siteLogo" :class="isCollapse ? '' : 'mr8'" alt="">
    <span v-if="!isCollapse" class="pfm">项目管理系统</span>
  </router-link>
</template>

<style lang="scss" scoped>
.app-sidebar-logo {
  width: 100%;
  height: 84px;
  padding: 0 12px 0 16px;
  img {
    width: 36px;
    height: 36px;
    border-radius: 7.2px;
    cursor: pointer;
    display: block;
  }
  span {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0em;
    font-variation-settings: 'opsz' auto;
    color: $color-title;
    -webkit-font-smoothing: antialiased;
  }
}
</style>
