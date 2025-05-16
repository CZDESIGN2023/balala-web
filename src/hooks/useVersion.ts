import { ref } from 'vue'
import { useProjectVersionStore } from '@/stores/modules/project/version'
import { mergeArraysByKeyWithSeparateObject } from '@/utils/array'
import type { VersionItem, VersionItemInfo, VersionItemStats } from '@/api/project/intro/types'

const versionList = ref<VersionItem[]>([])
export function useVersion() {
  const projectVersionStore = useProjectVersionStore()
  // 获取模块列表
  async function getVersionList(spaceId: string, isGetStats: boolean = false, startTime: string = '', endTime: string = ''): Promise<VersionItem[] | VersionItemInfo[]> {
    const versions = await projectVersionStore.fetchVersionList({ spaceId })

    // 是否需要获取统计数据
    if (!isGetStats)
      return versions
    if (!versions) {
      return []
    }

    const stats = await getVersionStats(spaceId, versions.map(item => item.id), startTime, endTime)

    const mergedArray = mergeArraysByKeyWithSeparateObject<VersionItemInfo, VersionItemStats, 'id', VersionItem>(
      versions,
      stats,
      'id',
      'stats',
    )

    versionList.value = mergedArray

    return mergedArray
  }

  // 获取模块统计数据
  async function getVersionStats(spaceId: string, versionIds: string[], startTime: string, endTime: string) {
    const data = await projectVersionStore.fetchVersionStats(spaceId, versionIds, startTime, endTime)
    if (!data) {
      throw new Error('No data received')
    }

    const dataMap = new Map(data.map(item => [item.id, item]))
    const result = versionIds.map((versionId) => {
      const findItem = dataMap.get(versionId)
      return findItem || {
        closedOrTerminated: '0',
        completeRate: '0',
        completed: '0',
        expired: '0',
        id: versionId,
        processing: '0',
        total: '0',
        weekProcessing: '0',
        priorityInfos:
        [
          {
            priority: 'P0',
            count: '0',
          },
          {
            priority: 'P1',
            count: '0',
          },
          {
            priority: 'P2',
            count: '0',
          },
          {
            priority: 'P3',
            count: '0',
          },
          {
            priority: 'P4',
            count: '0',
          },
          {
            priority: 'PENDING',
            count: '0',
          },
          {
            priority: 'SUSPEND',
            count: '0',
          },
        ],
      }
    })
    return result
  }

  return {
    versionList,
    getVersionList,
  }
}
