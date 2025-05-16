import { type Ref, onMounted, ref } from 'vue'
import { useProjectModuleStore } from '@/stores/modules/project/module'
import { mergeArraysByKeyWithSeparateObject } from '@/utils/array'
import type { ModuleItem, ModuleItemInfo, ModuleItemStats } from '@/api/project/intro/types'

const moduleList = ref<ModuleItem[]>([])

export function useModule() {
  const projectModuleStore = useProjectModuleStore()

  // 获取模块列表
  async function getModuleList(spaceId: string, isGetStats: boolean = false, startTime?: string, endTime?: string): Promise<ModuleItem[] | ModuleItemInfo[]> {
    const modules = await projectModuleStore.fetchModuleList({ spaceId, moduleId: [] })

    // 是否需要获取统计数据
    if (!isGetStats)
      return modules
    if (!modules) {
      return []
    }
    const stats = await getModuleStats(spaceId, modules.map(item => item.id), startTime || '', endTime || '')
    const mergedArray = mergeArraysByKeyWithSeparateObject<ModuleItemInfo, ModuleItemStats, 'id', ModuleItem>(
      modules,
      stats,
      'id',
      'stats',
    )

    moduleList.value = mergedArray
    return mergedArray
  }

  // 获取模块统计数据
  async function getModuleStats(spaceId: string, moduleIds: string[], startTime?: string, endTime?: string) {
    const data = await projectModuleStore.fetchModuleStats(spaceId, moduleIds, startTime || '', endTime || '')
    return data
  }

  return {
    moduleList,
    getModuleList,
  }
}
