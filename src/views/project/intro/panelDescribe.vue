<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { onMounted, provide, reactive, ref } from 'vue'
import { editProjectDescribe, getProjectInfo } from '@/api/project'
import { Perm } from '@/enum/permission'
import { usePermission } from '@/hooks/usePermission'
import router from '@/router'
import { useProjectInfo } from '@/hooks/useProjectInfo'

const emits = defineEmits(['onUpdate'])

provide('view', true)

const { projectInfo, initProjectInfo } = useProjectInfo()
const { checkPerm } = usePermission()
const showEditor = ref<boolean>(false)
const describe = ref('')

// 富文本编辑器失焦
function editorBlur(describe: string) {
  showEditor.value = false
  // 修改信息
  editProjectDesc(describe)
}

// 修改项目描述
async function editProjectDesc(describe: string) {
  if (describe === projectInfo.value.describe)
    return
  try {
    await editProjectDescribe({
      spaceId: projectInfo.value.id,
      describe,
    })
    message.success('项目描述修改成功')
  }
  finally {
    emits('onUpdate', 'describe')
  }
}

function getContent(content: string) {
  describe.value = content || ''
}

onMounted(() => {
  initProjectInfo(router.currentRoute.value.params.id as string)
})
</script>

<template>
  <div class="intro-wrap intro-desc mt24">
    <div class="flex-row-start">
      <svg-icon class="mr6" name="project-intro-desc" color="#999" size="16" />
      <span class="text14 line14 pfm icon-color">项目描述</span>
    </div>
    <div class="editor-box mt16">
      <b-editor
        :key="projectInfo?.id"
        mode="introMode"
        :mode-key="`introMode${projectInfo?.id}`"
        :value="projectInfo?.describe"
        :space-id="projectInfo?.id"
        :readonly="!checkPerm(Perm.ModifySpaceDesc)"
        placeholder="知识库就像书一样,让多篇文档结构化,方便知识的创作与沉淀"
        read-content="知识库就像书一样,让多篇文档结构化,方便知识的创作与沉淀"
        :min-height="156"
        :max-height="468"
        @get-content="getContent"
        @editor-blur="editorBlur"
      />
    </div>
  </div>
</template>
