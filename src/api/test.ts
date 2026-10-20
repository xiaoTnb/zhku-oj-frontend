import { httpGet, httpPost, httpPut, httpDelete } from '@/utils/request';
import type {
  CreateTestCase,
  CreateTestCaseBatch,
  TestCase,
  UpdateTestCase,
} from '@/types/test';

/**
 * 创建测试用例
 * POST /testcase
 * 认证：需要（题目创建者或管理员）
 * @param payload CreateTestCase
 * @returns 创建的测试用例
 */
export function createTestCase(payload: CreateTestCase) {
  return httpPost<TestCase>('/testcase', payload);
}

/**
 * 批量创建测试用例
 * POST /testcase/batch
 * 认证：需要（题目创建者或管理员）
 * @param payload CreateTestCaseBatch
 * @returns 创建的测试用例列表
 */
export function createTestCaseBatch(payload: CreateTestCaseBatch) {
  return httpPost<TestCase[]>('/testcase/batch', payload);
}

/**
 * 获取题目测试用例列表
 * GET /testcase/problem/{problem_id}
 * 认证：需要
 * @param problemId string 题目ID
 * @returns 测试用例列表
 */
export function getTestCasesByProblemId(problemId: string) {
  return httpGet<TestCase[]>(`/testcase/problem/${problemId}`);
}

/**
 * 获取测试用例详情
 * GET /testcase/{id}
 * 认证：需要
 * @param id string 测试用例ID
 * @returns 测试用例详情
 */
export function getTestCaseById(id: string) {
  return httpGet<TestCase>(`/testcase/${id}`);
}

/**
 * 更新测试用例
 * PUT /testcase/{id}
 * 认证：需要（题目创建者或管理员）
 * @param id string 测试用例ID
 * @param payload UpdateTestCase
 * @returns 更新后的测试用例
 */
export function updateTestCase(id: string, payload: UpdateTestCase) {
  return httpPut<TestCase>(`/testcase/${id}`, payload);
}

/**
 * 删除测试用例
 * DELETE /testcase/{id}
 * 认证：需要（题目创建者或管理员）
 * @param id string 测试用例ID
 * @returns 删除结果
 */
export function deleteTestCase(id: string) {
  return httpDelete(`/testcase/${id}`);
}
