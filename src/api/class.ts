import { httpGet, httpPost, httpPut, httpDelete } from '@/utils/request';
import type {
  ClassItem,
  CreateClassRequest,
  UpdateClassRequest,
  ClassMemberResponse,
  ClassQRCodeResponse,
  AddStudentToClassRequest,
  StudentClassResponse,
  AddClazzMemberRequest,
  AddClazzTeachersRequest,
} from '@/types/class';

/**
 * 创建专业班级
 * POST /clazzes/major
 * 认证：需要（管理员）
 * @param payload 创建专业班级请求参数
 * @returns 创建成功后的班级对象
 */
export function createMajorClass(payload: {
  name: string;
  description: string;
  teacher_ids: string[];
  student_ids: string[];
  require_invite: boolean;
  max_members: number;
}) {
  return httpPost('/clazzes/major', payload);
}

/**
 * 获取所有专业班级
 * GET /clazzes/major
 * 认证：需要（管理员）
 * @returns 专业班级列表
 */
export function getMajorClasses(
  params?: { page?: number; page_size?: number },
  options?: { timeout?: number; retries?: number; retryDelayMs?: number }
) {
  const timeout = options?.timeout ?? 20000;
  const retries = options?.retries ?? 2;
  const retryDelayMs = options?.retryDelayMs ?? 500;
  const attempt = async (count: number): Promise<any[]> => {
    try {
      return await httpGet<any[]>('/clazzes/major', params, { timeout });
    } catch (e) {
      if (count < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * Math.pow(2, count)));
        return attempt(count + 1);
      }
      throw e;
    }
  };
  return attempt(0);
}

/**
 * 获取指定课程的班级列表
 * GET /clazzes?course_id=xxx
 * 认证：需要（教师/管理员）
 * @param params 查询参数 { course_id?: string; page?: number; page_size?: number }
 * @returns 班级列表与分页信息
 */
export function getClasses(params: {
  course_id?: string;
  page?: number;
  page_size?: number;
}) {
  return httpGet<any>('/clazzes', params);
}

/**
 * 获取班级详情
 * GET /clazzes/{clazzId}
 * 认证：需要（教师/管理员）
 * @param id 班级ID
 * @returns 班级详情对象
 */
export function getClassById(clazzId: string) {
  return httpGet<ClassItem>(`/clazzes/${clazzId}`);
}

/**
 * 创建班级
 * POST /clazzes
 * 认证：需要（教师/管理员）
 * @param payload 创建班级请求参数
 * @returns 创建成功后的班级对象
 */
export function createClass(payload: CreateClassRequest) {
  return httpPost<ClassItem>('/clazzes/course', payload);
}

/**
 * 更新班级信息
 * PUT /clazzes/:clazzId
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID（路径参数）
 * @param payload 更新班级请求参数（不含clazzId）
 * @returns 更新后的班级对象
 */
export function updateClass(clazzId: string, payload: Omit<UpdateClassRequest, 'clazz_id'>) {
  return httpPut<ClassItem>(`/clazzes/${clazzId}`, payload);
}

/**
 * 删除班级
 * DELETE /clazzes/{clazzId}
 * 认证：需要（教师/管理员）
 * @param id 班级ID
 * @returns 删除结果
 */
export function deleteClass(clazzId: string) {
  return httpDelete<{ message?: string }>(`/clazzes/${clazzId}`);
}

/**
 * 添加课程班级的专业班级关联
 * POST /clazzes/{clazzId}/major-classes
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID
 * @param payload 包含 major_class_ids 数组
 * @returns 操作结果
 */
export function addMajorClassesToClass(clazzId: string, payload: { major_class_ids: string[] }) {
  return httpPost(`/clazzes/${clazzId}/major-classes`, payload);
}

/**
 * 移除课程班级的专业班级关联
 * DELETE /clazzes/{clazzId}/major-classes
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID
 * @param payload 包含 major_class_ids 数组
 * @returns 操作结果
 */
export function removeMajorClassFromClass(clazzId: string, payload: { major_class_ids: string[] }) {
  return httpDelete(`/clazzes/${clazzId}/major-classes`, payload);
}

/**
 * 学生加入班级（教师/管理员操作）
 * POST /clazzes/:clazzId/members
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID（路径参数）
 * @param payload 包含学生id的请求参数
 * @returns 操作结果
 */
export function addStudentToClass(clazzId: string, payload: AddStudentToClassRequest) {
  // clazzId已经在URL中，请求体可能只需要student_id
  // 但为了兼容不同的后端实现，我们保持传递完整的payload
  console.log('addStudentToClass API调用:', { clazzId, payload });
  return httpPost<StudentClassResponse>(`/clazzes/${clazzId}/members`, payload);
}

/**
 * 批量添加学生到班级
 * POST /clazzes/:clazzId/members
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID（路径参数）
 * @param payload 包含学生id数组的请求参数
 * @returns 操作结果
 */
export function addStudentsToClass(clazzId: string, payload: { student_ids: string[]; course_id?: string }) {
  console.log('addStudentsToClass API调用:', { clazzId, payload });
  return httpPost<StudentClassResponse>(`/clazzes/${clazzId}/members`, payload);
}


/**
 * 学生退出班级
 * DELETE /clazzes/:clazzId/members
 * 认证：需要（学生）
 * @param clazzId 班级ID（路径参数）
 * @returns 操作结果
 */
export function leaveClass(clazzId: string) {
  return httpDelete(`/clazzes/${clazzId}/members`);
}

/**
 * 获取班级成员列表
 * GET /clazzes/:clazzId/students
 * 认证：需要（教师/管理员/班级成员）
 * @param clazzId 班级ID（路径参数，必传）
 * @returns 班级成员列表与分页信息
 */
export function getClassMembers(clazzId: string) {
  return httpGet<ClassMemberResponse>(`/clazzes/${clazzId}/students`);
}

/**
 * 刷新班级二维码
 * PUT /clazzes/:clazzId/qrcode
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID（路径参数）
 * @param courseId 课程ID（请求体参数）
 * @returns 新的二维码信息
 */
export function refreshClassQRCode(clazzId: string, courseId?: string) {
  // 尝试发送空请求体或包含course_id的请求体
  const payload = courseId ? { course_id: courseId } : {};
  console.log('刷新二维码API调用:', { clazzId, courseId, payload });
  return httpPut<ClassQRCodeResponse>(`/clazzes/${clazzId}/qrcode`, payload);
}

/**
 * 获取班级二维码
 * GET /clazzes/:clazzId/qrcode
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID（路径参数）
 * @returns 二维码信息
 */
export function getClassQRCode(clazzId: string) {
  return httpGet<ClassQRCodeResponse>(`/clazzes/${clazzId}/qrcode`);
}

/**
 * 添加班级成员
 * POST /clazzes/:clazzId/members
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID（路径参数）
 * @param payload 添加班级成员请求参数
 * @returns 操作结果
 */
export function addClazzMember(clazzId: string, payload: AddClazzMemberRequest) {
  return httpPost(`/clazzes/${clazzId}/members`, payload);
}

/**
 * 移除班级成员
 * DELETE /clazzes/:clazzId/members/:memberId
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID（路径参数）
 * @param memberId 成员ID（路径参数）
 * @returns 操作结果
 */
export function removeClazzMember(clazzId: string, memberId: string) {
  return httpDelete(`/clazzes/${clazzId}/members/${memberId}`);
}

/**
 * 移除班级成员
 * DELETE /clazzes/{clazzId}/student/{studentId}
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID
 * @param studentId 学生ID
 * @param courseId 课程ID（请求体）
 * @returns 操作结果
 */
export function removeStudentFromClass(clazzId: string, studentId: string, courseId: string) {
  return httpDelete(`/clazzes/${clazzId}/student/${studentId}`, { course_id: courseId });
}

/**
 * 添加班级教师
 * POST /clazzes/:clazzId/teachers
 * 认证：需要（管理员）
 * @param clazzId 班级ID（路径参数）
 * @param payload 添加班级教师请求参数
 * @returns 操作结果
 */
export function addClazzTeachers(clazzId: string, payload: AddClazzTeachersRequest) {
  return httpPost(`/clazzes/${clazzId}/teachers`, payload);
}

/**
 * 移除班级教师
 * DELETE /clazzes/:clazzId/teachers/:teacherId
 * 认证：需要（管理员）
 * @param clazzId 班级ID（路径参数）
 * @param teacherId 教师ID（路径参数）
 * @returns 操作结果
 */
export function removeClazzTeacher(clazzId: string, teacherId: string) {
  return httpDelete(`/clazzes/${clazzId}/teachers/${teacherId}`);
}

/**
 * 学生通过邀请码加入班级
 * POST /clazzes/:clazzId/join
 * 认证：需要（学生）
 * @param clazzId 班级ID（路径参数）
 * @param inviteCode 邀请码
 * @returns 操作结果
 */
export function joinClass(clazzId: string, inviteCode: string) {
  // 同时在 Body 和 Query String 中传递 invite_code，以兼容不同的后端实现
  return httpPost(`/clazzes/${clazzId}/join`, { invite_code: inviteCode }, { params: { invite_code: inviteCode } });
}

/**
 * 获取学生的所有班级
 * GET /students/:studentId/classes
 * 认证：需要
 * @param studentId 学生ID（路径参数）
 * @returns 学生班级列表
 */
export function getStudentClasses(studentId: string) {
  return httpGet<StudentClassResponse[]>(`/students/${studentId}/classes`);
}

/**
 * 创建任务
 * POST /clazzes/:clazzId/tasks
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID（路径参数）
 * @param payload 任务信息
 * @returns 创建的任务对象
 */
export function addTask(clazzId: string, payload: any) {
  return httpPost(`/clazzes/${clazzId}/tasks`, payload);
}

/**
 * 获取班级任务列表
 * GET /clazzes/:clazzId/tasks
 * 认证：需要
 * @param clazzId 班级ID（路径参数）
 * @returns 任务列表
 */
export function getClassTasks(clazzId: string) {
  return httpGet(`/clazzes/${clazzId}/tasks`);
}

/**
 * 获取任务详情
 * GET /clazzes/:clazzId/tasks/:taskId
 * 认证：需要
 * @param clazzId 班级ID（路径参数）
 * @param taskId 任务ID（路径参数）
 * @returns 任务详情
 */
export function getTaskDetail(clazzId: string, taskId: string) {
  return httpGet(`/clazzes/${clazzId}/tasks/${taskId}`);
}

/**
 * 更新任务
 * PUT /clazzes/:clazzId/tasks/:taskId
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID（路径参数）
 * @param taskId 任务ID（路径参数）
 * @param payload 任务更新信息
 * @returns 更新后的任务对象
 */
export function updateTask(clazzId: string, taskId: string, payload: any) {
  return httpPut(`/clazzes/${clazzId}/tasks/${taskId}`, payload);
}

/**
 * 删除任务
 * DELETE /clazzes/:clazzId/tasks/:taskId
 * 认证：需要（教师/管理员）
 * @param clazzId 班级ID（路径参数）
 * @param taskId 任务ID（路径参数）
 * @returns 操作结果
 */
export function deleteTask(clazzId: string, taskId: string) {
  return httpDelete(`/clazzes/${clazzId}/tasks/${taskId}`);
}

/**
 * 完成任务
 * POST /clazzes/:clazzId/tasks/:taskId/finish
 * 认证：需要（学生）
 * @param clazzId 班级ID（路径参数）
 * @param taskId 任务ID（路径参数）
 * @returns 操作结果
 */
export function finishTask(clazzId: string, taskId: string) {
  return httpPost(`/clazzes/${clazzId}/tasks/${taskId}/finish`);
}

/**
 * 批量绑定教师到班级
 * POST /clazzes/teachers/bind
 * 认证：需要（管理员）
 * @param payload 包含班级ID列表和教师ID
 * @returns 操作结果
 */
export function bindTeachersToClasses(payload: { clazz_ids: string[]; teacher_id: string }) {
  return httpPost('/clazzes/teachers/bind', payload);
}

