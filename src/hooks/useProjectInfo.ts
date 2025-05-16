import { ref } from 'vue'
import type { ModuleItem } from '@/api/project/intro/types'
import { getProjectInfo } from '@/api/project'

const projectInfo = ref()

export function useProjectInfo() {
  // 获取项目信息
  async function initProjectInfo(spaceId: string) {
    const { data } = await getProjectInfo({ spaceId })
    projectInfo.value = data
    return data
  }

  return {
    initProjectInfo,
    projectInfo,
  }
}
