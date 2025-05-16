import type { ModuleList, ModuleStatsList, ModuleStatsParams } from './types'
import http from '@/api'

/**
 * @name 获取项目模块列表
 * @param data
 */
export function getProjectModuleList(spaceId: string, userName?: string) {
  return http.post<ModuleList>(`/my/space/work_object/list`, { spaceId, userName })
}

/**
 * @name 项目模块列表-数量统计
 * @param data {
 *   spaceId: string 项目空间 id
 *   ids: string[] 模块 id 列表
 *   startTime: string 开始时间
 *   endTime: string 结束时间
 * }
 */
export function getProjectModuleCount(data: ModuleStatsParams) {
  return http.post<ModuleStatsList>(`/v2/my/workbench/space/work_object/count/by_ids`, data)
}
