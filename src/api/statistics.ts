import { httpGet } from '@/utils/request';

/** 获取当前用户统计数据
 * GET /statistics/user
 * 认证：需要
 */
export function getUserStatistics() {
  return httpGet('/statistics/user');
}

/** 获取系统统计数据（管理员）
 * GET /statistics/system
 * 认证：仅管理员
 */
export function getSystemStatistics() {
  return httpGet('/statistics/system');
}

/** 获取指定用户统计数据
 * GET /statistics/user/{id}
 * 认证：需要
 */
export function getUserStatisticsById(id: string) {
  return httpGet(`/statistics/user/${id}`);
}