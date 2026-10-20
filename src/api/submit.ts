import { httpPost, httpGet } from '@/utils/request';

import type { SubmitPayload, SubmitListParams, SubmitDetail, SubmitResponse } from '@/types/submit';

/**
 * 提交代码进行评测
 * POST /submit
 * 认证：需要
 * @param payload {
 *   problem_id: string 必填，题目ID；
 *   code: string 必填，源代码；
 *   language: string 必填，语言标识（如 'cpp','java','python'）
 * }
 * @returns 提交响应结果（含提交ID和消息）
 */
export function createSubmit(payload: SubmitPayload) {
  return httpPost<SubmitResponse>('/submit', payload);
}

/**
 * 获取提交列表
 * GET /submit
 * 认证：需要（管理员可按 user_id 查询）
 * @param params {
 *   page?: number;
 *   page_size?: number;
 *   problem_id?: string 按题目筛选；
 *   user_id?: string 按用户筛选（管理员）
 * }
 * @returns 列表与分页信息（具体结构以后端返回为准）
 */
export function getSubmits(params?: SubmitListParams) {
  return httpGet('/submit', params);
}

/**
 * 获取提交详情/评测结果
 * GET /submit/{id}
 * 认证：需要（本人或管理员）
 * @param id 提交ID
 * @returns 评测结果详情（判题状态、用例通过情况、耗时、内存等）
 */
export function getSubmitById(id: string) {
  return httpGet<SubmitDetail>(`/submit/${id}`);
}
