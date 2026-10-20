import { httpGet, httpPost, httpPut, httpDelete } from '../utils/request';
import type {
  UserProfile,
  RegisterRequest,
  RegisterResponseData,
  LoginRequest,
  LoginResponseData,
  UpdateProfileRequest,
  GetUsersParams,
  GetUsersResponseData,
  UpdateUserRequest,
  DeleteUserResponseData,
  GetTeachersResponseData,
  GetTeachersParams,
  GetUserTasksParams,
  GetUserTasksResponseData
} from '@/types/user';

/**
 * 用户注册（学生/教师/学习者）
 * POST /user
 * 认证：不需要
 * @param payload RegisterRequest { username: string; password: string; email: string; role?: 'student'|'teacher'|'admin'; major_class_id?: string; student_id: string }
 * @returns RegisterResponseData 注册成功信息
 */
export const registerUser = (payload: RegisterRequest) =>
  httpPost<RegisterResponseData>('/user/register', payload);

/**
 * 用户登录（学号/工号 + 密码）
 * POST /user/login
 * 认证：不需要
 * @param payload LoginRequest { username: string; password: string }
 * @returns LoginResponseData { token, 用户信息 }
 */
export const loginUser = (payload: LoginRequest) =>
  httpPost<LoginResponseData>('/user/login', payload);

/**
 * 获取当前登录用户资料
 * GET /user/profile
 * 认证：需要
 * @returns UserProfile 个人资料对象
 */
export const getUserProfile = () =>
  httpGet<UserProfile>('/user/profile');

/**
 * 更新当前登录用户资料
 * PUT /user/profile
 * 认证：需要
 * @param payload UpdateProfileRequest { real_name?, email?, school?, major?, grade?, class?, phone?, bio? }
 * @returns UserProfile 更新后的资料
 */
export const updateUserProfile = (payload: UpdateProfileRequest) =>
  httpPut<UserProfile>('/user/profile', payload);

/**
 * 获取用户列表（管理员）
 * GET /user
 * 认证：需要（管理员）
 * @param params GetUsersParams { page?: number; page_size?: number; role?: 'admin'|'teacher'|'student' }
 * @returns GetUsersResponseData 用户列表及分页信息
 */
export const getUsers = (params?: GetUsersParams) =>
  httpGet<GetUsersResponseData>('/user', params);

/**
 * 根据ID获取用户信息（管理员或本人）
 * GET /user/{id}
 * 认证：需要
 * @param id string 用户ID
 * @returns UserProfile 用户资料
 */
export const getUserById = (id: string) =>
  httpGet<UserProfile>(`/user/${id}`);

/**
 * 管理员更新用户信息（角色、激活状态）
 * PUT /user/{id}
 * 认证：需要（管理员）
 * @param id string 用户ID
 * @param payload UpdateUserRequest { role?: string; is_active?: boolean }
 * @returns UserProfile 更新后的用户信息
 */
export const updateUser = (id: string, payload: UpdateUserRequest) =>
  httpPut<UserProfile>(`/user/${id}`, payload);

/**
 * 管理员删除用户
 * DELETE /user/{id}
 * 认证：需要（管理员）
 * @param id string 用户ID
 * @returns DeleteUserResponseData 删除结果
 */
export const deleteUser = (id: string) =>
  httpDelete<DeleteUserResponseData>(`/user/${id}`);


/**
 * 获取教师列表
 * POST /user/teachers
 * 认证：需要
 * @param data 请求体参数，包含页码、每页大小和真实姓名
 * @returns GetTeachersResponseData 教师列表及分页信息
 */
export const getTeachers = (data: GetTeachersParams) =>
  httpPost<GetTeachersResponseData>(`/user/teachers`, data);

/**
 * 获取用户任务列表
 * GET /user/tasks
 * 认证：需要
 * @param params GetUserTasksParams 分页查询参数
 * @returns GetUserTasksResponseData 任务列表及分页信息
 */
export const getUserTasks = (params?: GetUserTasksParams) =>
  httpGet<GetUserTasksResponseData>('/user/tasks', params);

