import type { UserProfile } from './user';

/** 课程状态（数字枚举） - 基于swagger CourseStatus模型 */
export type CourseStatus = 0 | 1 | 2; // 0-未开始，1-进行中，2-已结束

/** 课程实体 - 基于swagger Course模型 */
export interface Course {
  /** 课程ID */
  id: string;
  /** 课程名称（必填） - 基于swagger模型 */
  name: string;
  /** 课程标题（后端可能返回 name 或 title） - 兼容旧版本 */
  title?: string;
  /** 课程描述 */
  description?: string;
  /** 课程状态（数字：0-草稿，1-活跃，2-已归档） */
  status?: CourseStatus;
  /** 头像/封面图URL - 基于swagger avatar字段 */
  avatar?: string;
  /** 封面图URL - 兼容旧版本 */
  cover_url?: string;
  /** 创建者ID - 基于swagger created_by字段 */
  created_by?: string;
  /** 教师ID列表 - 基于swagger teacher_ids字段 */
  teacher_ids?: string[];
  /** 创建时间 */
  ctime?: string;
  /** 更新时间 */
  mtime?: string;
  
  // 以下字段保留用于兼容性
  /** 授课教师名 */
  teacher_name?: string;
  /** 创建者用户对象 */
  created_by_user?: {
    id: string;
    username: string;
    email: string;
    real_name?: string;
    student_id?: string;
    role: string;
    avatar?: string;
    bio?: string;
    school?: string;
    major?: string;
    grade?: string;
    class?: string;
    is_active: boolean;
    created_at: string;
  };
  /** 学生数量 */
  students_count?: number;
}

/** 课程列表查询参数 */
export interface CourseListQuery {
  /** 课程名称 */
  name?: string;
  /** 状态筛选（0-草稿，1-活跃，2-已归档） */
  status?: CourseStatus;
  /** 页码 */
  page_num?: number;
  /** 每页数量 */
  page_size?: number;
}

/** 课程列表响应 */
export interface CourseListResponse {
  /** 课程列表 */
  courses: Course[];
  /** 总数 */
  total: number;
}

/** 通用分页响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

/** UI 卡片映射（供组件使用） */
export interface CourseCardItem {
  id: string;
  title: string;
  cover: string;
  /** tag 风格 */
  statusType: '' | 'success' | 'info' | 'warning';
  /** tag 文案 */
  statusLabel: string;
  /** 描述 */
  desc: string;
  /** 教师 */
  teacher: string;
  /** 学生数 */
  students: number;
  /** 创建时间 */
  ctime: string;
}

export interface CourseQueryPayload {
  page_num?: number;
  page_size?: number;
  name?: string;
  status?: CourseStatus; // 0-草稿，1-活跃，2-已归档
}

/** 创建课程请求 - 基于swagger CreateCourseRequest模型 */
export interface CreateCourseRequest {
  /** 课程名称（必填） */
  name: string;
  /** 课程描述 */
  description?: string;
}

export interface CreateCoursePayload {
  name: string;
  description: string;
}

/** 更新课程请求 - 基于swagger UpdateCourseRequest模型 */
export interface UpdateCourseRequest {
  /** 课程ID（必填） */
  id: string;
  /** 课程名称 */
  name?: string;
  /** 课程描述 */
  description?: string;
  /** 课程状态 */
  status?: CourseStatus;
}

/** 添加课程教师请求 - 基于swagger AddCourseTeachersRequest模型 */
export interface AddCourseTeachersRequest {
  /** 课程ID */
  course_id: string;
  /** 教师ID列表 */
  teacher_ids: string[];
}

/** 移除课程教师请求 - 基于swagger RemoveCourseTeachersRequest模型 */
export interface RemoveCourseTeachersRequest {
  /** 课程ID */
  course_id: string;
  /** 教师ID列表 */
  teacher_ids: string[];
}

export interface UpdateCoursePayload {
  id: string;
  name?: string;
  description?: string;
  status?: CourseStatus; // 0-草稿，1-活跃，2-已归档
}

export interface getCourseTeachersPayload {
  course_id:number;
  page_num: number;
  page_size: number;
  real_name?:string;
  teacher_id?:string;
}

/** 搜索教师请求参数 */
export interface SearchTeachersPayload {
  /** 页码 */
  page_num: number;
  /** 每页数量 */
  page_size: number;
  /** 教师姓名（可选，支持模糊查询） */
  real_name?: string;
}

/** 搜索教师响应 */
export interface SearchTeachersResponse {
  /** 教师列表 */
  teachers: UserProfile[];
  /** 总数 */
  total: number;
  /** 页码 */
  page_num: number;
  /** 每页数量 */
  page_size: number;
}