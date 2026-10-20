/** 用户相关类型声明（与 /user 相关接口对齐） */
export interface UserBasic {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'teacher' | 'student' | string;
  real_name?: string;
  avatar?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  real_name?: string;
  role: 'admin' | 'teacher' | 'student' | string;
  avatar?: string;
  is_active?: boolean;
  created_at?: string;
  school?: string;
  major?: string;
  grade?: string;
  class?: string;
  phone?: string;
  bio?: string;
  student_id?: string;
}

/** 注册请求体（POST /user） */
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role?: 'admin' | 'teacher' | 'student';
  major_class_id?: string;
  student_id: string;
}

/** 注册响应（对齐 swagger data 字段） */
export interface RegisterResponseData {
  message: string;
  user: UserProfile;
}

/** 登录请求体（POST /user/login） */
export interface LoginRequest {
  /** 学号/工号 */
  student_id: string;
  /** 密码 */
  password: string;
}

/** 登录响应体 */
export interface LoginResponseData {
  token: string;
  user: UserBasic;
}

/** 更新个人资料请求体（PUT /user/profile） */
export interface UpdateProfileRequest {
  real_name?: string;
  email?: string;
  school?: string;
  major?: string;
  grade?: string;
  class?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

/** 用户列表查询参数（GET /user） */
export interface GetUsersParams {
  /** 页码，默认1 */
  page?: number;
  /** 每页数量，默认10 */
  page_size?: number;
  /** 角色筛选 */
  role?: 'admin' | 'teacher' | 'student' | string;
}

/** 用户列表响应（分页，对齐 swagger data 结构） */
export interface GetUsersResponseData {
  users: Array<UserProfile>;
  total: number;
  page: number;
  page_size: number;
  total_page: number;
}

/** 管理员更新用户请求体（PUT /user/{id}） */
export interface UpdateUserRequest {
  role?: 'admin' | 'teacher' | 'student' | string;
  is_active?: boolean;
}

/** 删除用户响应 */
export interface DeleteUserResponseData {
  message: string;
}

/** 获取教师列表请求参数 */
export interface GetTeachersParams {
  /** 真实姓名搜索关键词 */
  real_name: string;
  /** 页码 */
  page_num: number;
  /** 每页大小 */
  page_size: number;
}

/** 获取教师列表响应数据结构 */
export interface GetTeachersResponseData {
  /** 状态码 */
  code: number;
  /** 状态消息 */
  message: string;
  /** 数据 */
  data: {
    /** 总数量 */
    total: number;
    /** 页码 */
    page_num: number;
    /** 每页大小 */
    page_size: number;
    /** 教师列表 */
    teachers: Array<UserProfile>;
  };
}

/** 用户任务状态 */
export type UserTaskState = 0 | 1; // 0-未完成，1-已完成

/** 用户任务类型 */
export type UserTaskType = 1 | 2; // 1-题单，2-视频

/** 用户任务状态 */
export type UserTaskStatus = 0 | 1 | 2; // 0-未开始，1-进行中，2-已结束

/** 用户任务 */
export interface UserTask {
  id: string;
  title: string;
  description?: string;
  type: UserTaskType;
  state?: UserTaskState; // 改为可选，因为某些响应可能不包含此字段
  status: UserTaskStatus;
  clazz_ids?: string;
  clazz_name?: string;
  course_id?: string;
  deadline?: string;
  start_time?: string; // 开始时间
  end_time?: string; // 结束时间
  created_at?: string;
  updated_at?: string;
}

/** 获取用户任务列表请求参数 */
export interface GetUserTasksParams {
  /** 页码 */
  page_num?: number;
  /** 每页数量 */
  page_size?: number;
  /** 用户任务状态：0-未完成，1-已完成 */
  state?: UserTaskState;
  /** 任务类型：1-题单，2-视频 */
  type?: UserTaskType;
  /** 班级ID */
  clazz_id?: string;
  /** 任务状态：0-未开始，1-进行中，2-已结束 */
  status?: UserTaskStatus;
}

/** 获取用户任务列表响应数据结构 */
export interface GetUserTasksResponseData {
  /** 总数量 */
  total: number;
  /** 页码 */
  page_num: number;
  /** 每页大小 */
  page_size: number;
  /** 任务列表 */
  tasks: Array<UserTask>;
}

