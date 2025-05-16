<script lang="ts" setup>
import { ref } from 'vue'
import example from '../components/example.vue'
import BPopover from '@/components/BTableElPopover/src/BPopover.vue'

const visible = ref(false)
</script>

<template>
  <div>
    <h1>BPopover 气泡卡片</h1>
    <example>
      <BPopover
        v-model:visible="visible"
        placement="top-start"
        title="Title"
        :width="200"
        trigger="click"
        content="this is content, this is content, this is content"
        @cancel="visible = false"
        @confirm=" visible = false"
      >
        <template #reference>
          <el-button class="m-2">
            Hover to activate
          </el-button>
        </template>
      </BPopover>
    </example>
  </div>
</template>
