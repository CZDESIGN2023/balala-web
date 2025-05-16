import type { TaskVersionList, VersionStatsParams } from './types'
import http from '@/api'

/**
 * 版本号-列表
 * @param spaceId 所属空间id
 */

export function getProjectVersionList(spaceId: string) {
  return http.post<TaskVersionList>(`/my/space/work_version/list`, {
    spaceId,
  })
}

export function getProjectVersionCount(data: VersionStatsParams) {
  return http.post<any>(`/my/workbench/space/version/count`, data)
}
