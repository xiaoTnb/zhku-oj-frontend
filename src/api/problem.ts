import { httpGet, httpPost, httpPut, httpDelete } from '@/utils/request';
import type {
  Problem,
  ProblemListQuery,
  ProblemSearchQuery,
  ProblemListResponse,
  CreateProblemRequest,
  UpdateProblemRequest,
  RunCodePayload,
  RunCodeResult,
  AdminProblemListQuery,
  ProblemDetailAggregate,
  DailyProblem,
  ProblemDifficultyStats,
} from '@/types/problem';

/**
 * 获取题目列表（公开接口）
 * GET /problem
 * 认证：不需要
 * @param params 可选分页与筛选参数：
 *  - page?: number 页码，默认1
 *  - page_size?: number 每页数量，默认10
 *  - difficulty?: 'easy'|'medium'|'hard'
 *  - tags?: string[] 标签列表
 *  - include_private?: boolean 是否包含私有题目（默认 false）
 * @returns PaginatedResponse<ProblemBrief>
 */
export function getProblems(params: ProblemListQuery = {}) {
  return httpGet<ProblemListResponse>('/problem', params);
}

/**
 * 搜索题目（公开接口）
 * GET /problem/search
 * 认证：不需要
 * @param params 搜索与分页：
 *  - keyword?: string 关键词
 *  - difficulty?: 'easy'|'medium'|'hard'
 *  - tags?: string[] 标签列表
 *  - page?: number 页码，默认1
 *  - page_size?: number 每页数量，默认10
 * @returns PaginatedResponse<ProblemBrief>
 */
export function searchProblems(params: ProblemSearchQuery) {
  return httpGet<ProblemListResponse>('/problem/search', params);
}

/**
 * 获取题目详情（公开接口）
 * GET /problem/{id}
 * 认证：不需要
 * @param id 题目ID
 * @returns Problem 题目完整信息
 */
export function getProblemById(id: string) {
  return httpGet<Problem>(`/problem/${id}`);
}

/**
 * 创建题目（教师/管理员）
 * POST /problem
 * 认证：需要（教师/管理员）
 * @param payload CreateProblemRequest 题目内容、用例、难度、标签等
 * @returns Problem 创建后的题目
 */
export function createProblem(payload: CreateProblemRequest) {
  return httpPost<Problem>('/problem', payload);
}

/**
 * 更新题目（教师/管理员）
 * PUT /problem/{id}
 * 认证：需要（教师/管理员）
 * @param id 题目ID
 * @param payload UpdateProblemRequest 需要更新的字段
 * @returns Problem 更新后的题目
 */
export function updateProblem(id: string, payload: UpdateProblemRequest) {
  return httpPut<Problem>(`/problem/${id}`, payload);
}

/**
 * 删除题目（管理员）
 * DELETE /problem/{id}
 * 认证：需要（管理员）
 * @param id 题目ID
 * @returns { message?: string }
 */
export function deleteProblem(id: string) {
  return httpDelete(`/problem/${id}`);
}

/**
 * 运行代码测试（非提交）
 * POST /problem/{id}/run
 * 认证：需要（已登录用户）
 * 频率限制：由后端控制
 * @param id 题目ID
 * @param payload { code: string; language: string; input?: string }
 * @returns RunCodeResult 代码运行结果
 */
export function runProblemCode(id: string, payload: RunCodePayload) {
  return httpPost<RunCodeResult>(`/problem/${id}/run`, payload);
}

/**
 * 获取题目详情聚合信息
 * GET /problem/{id}/detail
 * @param id 题目ID
 * @returns ProblemDetailAggregate 题目详情聚合信息
 */
export function getProblemDetailAggregate(id: string) {
  return httpGet<ProblemDetailAggregate>(`/problem/${id}/detail`);
}

/**
 * 获取每日推荐题目
 * GET /daily-problem
 * @returns DailyProblem 每日推荐题目
 */
export function getDailyProblem() {
  return httpGet<DailyProblem>('/daily-problem');
}

/**
 * 获取题目列表（管理员端）
 * GET /admin/problems
 * @param params 管理员端查询参数
 * @returns ProblemListResponse 题目列表响应
 */
export function getAdminProblems(params: AdminProblemListQuery = {}) {
  return httpGet<ProblemListResponse>('/admin/problems', params);
}

/**
 * 获取题目难度统计
 * GET /problems/difficulty-stats
 * @returns ProblemDifficultyStats 题目难度统计
 */
export function getProblemDifficultyStats() {
  return httpGet<ProblemDifficultyStats>('/problems/difficulty-stats');
}
