import { httpGet, httpPost, httpPut, httpDelete } from '@/utils/request';
import type {
  UpdateTaskRequest,
  FinishTaskRequest,
  Task,
  AddTaskRequest,
  AddTaskProblemsRequest,
  RemoveTaskProblemsRequest,
  PageQueryTaskCompletionRequest,
  PageQueryTaskCompletionResponse,
} from '@/types/task';

/**
 * 添加任务
 * POST /clazzes/tasks
 * 认证：需要（课程创建者或教师）
 * @param payload AddTaskRequest
 * @returns 创建结果
 */
export function addTask(payload: AddTaskRequest) {
  return httpPost(`/clazzes/tasks`, payload);
}

/**
 * 更新任务
 * PUT /clazzes/:clazzId/tasks/:taskId
 * 认证：需要（课程创建者或教师）
 * @param clazzId 班级ID（路径参数）
 * @param taskId 任务ID（路径参数）
 * @param payload UpdateTaskRequest
 * @returns 更新结果
 */
export function updateTask(clazzId: string, taskId: string, payload: UpdateTaskRequest) {
  return httpPut(`/clazzes/${clazzId}/tasks/${taskId}`, payload);
}

/**
 * 删除任务
 * DELETE /clazzes/:clazzId/tasks/:taskId
 * 认证：需要（课程创建者或教师）
 * @param clazzId 班级ID（路径参数）
 * @param taskId string 任务ID（路径参数）
 * @returns 删除结果
 */
export function deleteTask(clazzId: string, taskId: string) {
  return httpDelete(`/clazzes/${clazzId}/tasks/${taskId}`);
}

/**
 * 获取班级任务列表
 * GET /clazzes/:clazzId/tasks
 * 认证：需要（班级成员、课程创建者或教师）
 * @param clazzId string 班级ID
 * @returns 任务列表
 */
export function getTasksByClazzId(clazzId: string) {
  return httpGet<Task[]>(`/clazzes/${clazzId}/tasks`);
}

/**
 * 获取任务详情
 * GET /clazzes/:clazzId/tasks/:taskId
 * 认证：需要（班级成员、课程创建者或教师）
 * @param clazzId 班级ID（路径参数）
 * @param taskId string 任务ID（路径参数）
 * @returns 任务详情
 */
export function getTaskById(clazzId: string, taskId: string) {
  return httpGet<Task>(`/clazzes/${clazzId}/tasks/${taskId}`);
}

/**
 * 完成任务
 * POST /clazzes/:clazzId/tasks/:taskId/finish
 * 认证：需要（班级成员）
 * @param clazzId 班级ID（路径参数）
 * @param taskId 任务ID（路径参数）
 * @param payload FinishTaskRequest
 * @returns 完成结果
 */
export function finishTask(clazzId: string, taskId: string, payload?: FinishTaskRequest) {
  return httpPost(`/clazzes/${clazzId}/tasks/${taskId}/finish`, payload || {});
}

/**
 * 给任务新增题目
 * POST /clazzes/:clazzId/tasks/:taskId/problems
 * 认证：需要（课程创建者或教师）
 * @param clazzId 班级ID（路径参数）
 * @param taskId 任务ID（路径参数）
 * @param payload 新增题目请求参数
 * @returns 新增结果
 */
export function addTaskProblems(clazzId: string, taskId: string, payload: AddTaskProblemsRequest) {
  return httpPost(`/clazzes/${clazzId}/tasks/${taskId}/problems`, payload);
}

/**
 * 删除任务题目
 * DELETE /clazzes/:clazzId/tasks/:taskId/problems
 * 认证：需要（课程创建者或教师）
 * @param clazzId 班级ID（路径参数）
 * @param taskId 任务ID（路径参数）
 * @param payload 删除题目请求参数
 * @returns 删除结果
 */
export function removeTaskProblems(clazzId: string, taskId: string, payload: RemoveTaskProblemsRequest) {
  return httpDelete(`/clazzes/${clazzId}/tasks/${taskId}/problems`, payload);
}

/**
 * 分页查询任务完成情况
 * GET /clazzes/:clazzId/tasks/:taskId/completion
 * 认证：需要（课程创建者或教师）
 * @param clazzId 班级ID（路径参数）
 * @param taskId 任务ID（路径参数）
 * @param payload 查询参数（page_num、page_size、real_name、user_id）
 * @returns 任务完成情况分页数据
 */
export function getTaskCompletion(clazzId: string, taskId: string, payload: PageQueryTaskCompletionRequest) {
  return httpGet<PageQueryTaskCompletionResponse>(`/clazzes/${clazzId}/tasks/${taskId}/completion`, payload);
}

