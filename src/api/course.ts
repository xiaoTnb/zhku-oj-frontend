import { httpGet, httpPost, httpPut, httpDelete } from '@/utils/request';
import type {
  CourseQueryPayload,
  Course,
  CourseListResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  AddCourseTeachersRequest,
  RemoveCourseTeachersRequest,
  getCourseTeachersPayload,
  SearchTeachersPayload,
  SearchTeachersResponse
} from '@/types/course';

/**
 * 分页查询课程列表
 * GET /courses?page=1&page_size=10&name=XXX&status=xx
 * 认证：需要
 * status说明：0-草稿，1-活跃，2-已归档
 * @param params 查询参数 { page?: number; page_size?: number; name?: string; status?: number }
 * @returns 列表与分页信息（结构以后端为准）
 */
export function queryCourses(params: {
  page?: number;
  page_size?: number;
  name?: string;
  status?: number;
}) {
  return httpGet<CourseListResponse>('/courses', params);
}

/**
 * 获取课程详情
 * GET /courses/{courseId}
 * 认证：需要
 * @param courseId string 课程ID
 * @returns 课程详情对象
 */
export function getCourseById(courseId: string) {
  return httpGet<Course>(`/courses/${courseId}`);
}

/**
 * 创建课程（基于swagger文档）
 * POST /courses
 * 认证：需要（教师/管理员）
 * @param payload CreateCourseRequest
 * @returns 创建成功后的课程对象
 */
export function createCourse(payload: CreateCourseRequest) {
  return httpPost<Course>('/courses', payload);
}

/**
 * 更新课程信息
 * PUT /courses/:courseId
 * 认证：需要（教师/管理员）
 * @param courseId 课程ID（路径参数）
 * @param payload UpdateCourseRequest（不含courseId）
 * @returns 更新后的课程对象
 */
export function updateCourse(courseId: string, payload: Omit<UpdateCourseRequest, 'id'>) {
  return httpPut<Course>(`/courses/${courseId}`, payload);
}

/**
 * 删除课程
 * DELETE /courses/{courseId}
 * 认证：需要（教师/管理员）
 * @param courseId string 课程ID
 * @returns 后端返回删除结果
 */
export function deleteCourse(courseId: string) {
  return httpDelete<{ message?: string }>(`/courses/${courseId}`);
}

/**
 * 更新课程头像
 * PUT /courses/{courseId}/avatar
 * 认证：需要（教师/管理员）
 * Content-Type: multipart/form-data，字段名：file
 * @param courseId string 课程ID
 * @param file File|Blob 头像文件
 * @returns 后端返回的新头像地址等（以实际返回为准）
 */
export function updateCourseAvatar(courseId: string, file: File | Blob) {
  const form = new FormData();
  form.append('file', file as any);
  return httpPut(`/courses/${courseId}/avatar`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

/**
 * 添加课程教师
 * POST /courses/:courseId/teachers
 * 认证：需要（管理员）
 * @param courseId 课程ID（路径参数）
 * @param payload 添加课程教师请求参数
 * @returns 操作结果
 */
export function addCourseTeachers(courseId: string, payload: AddCourseTeachersRequest) {
  return httpPost(`/courses/${courseId}/teachers`, payload);
}

/**
 * 移除课程教师
 * DELETE /courses/:courseId/teachers/:teacherId
 * 认证：需要（管理员）
 * @param courseId 课程ID（路径参数）
 * @param teacherId 教师ID（路径参数）
 * @returns 操作结果
 */
export function removeCourseTeachers(courseId: string, teacherId: string) {
  return httpDelete(`/courses/${courseId}/teachers/${teacherId}`);
}

/**
 * 获取教师课程列表
 * GET /courses/teaching
 * 认证：需要（教师）
 * @param params 查询参数 { page?: number; page_size?: number; name?: string; status?: number }
 * @returns 教师的课程列表
 */
export function getTeachingCourses(params?: {
  page?: number;
  page_size?: number;
}) {
  return httpGet<CourseListResponse>('/courses/teaching', params);
}


/**
 * 获取课程教师列表
 * GET /courses/:courseId/teachers
 * 认证：需要
 * @param courseId 课程ID（路径参数）
 * @param params 查询参数，包含：
 *        - page_num: 页码
 *        - page_size: 每页数量
 *        - real_name: 教师姓名(可选)
 *        - teacher_id: 教师ID(可选)
 * @returns 课程教师列表
 */
export function getCourseTeachers(courseId: string, params?: {
  page_num?: number;
  page_size?: number;
  real_name?: string;
  teacher_id?: string;
}) {
  return httpGet(`/courses/${courseId}/teachers`, params);
}

/**
 * 搜索教师列表
 * POST /user/teachers
 * 支持按真实姓名模糊查询
 * 分页查询教师列表
 * @param payload SearchTeachersPayload { page_num: number, page_size: number, real_name?: string }
 * @returns SearchTeachersResponse 教师列表及分页信息
 */
export function searchTeachers(payload: SearchTeachersPayload) {
  return httpPost<SearchTeachersResponse>('/user/teachers', payload);
}
