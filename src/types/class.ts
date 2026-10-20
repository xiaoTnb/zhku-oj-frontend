/** 班级状态（数字枚举） - 基于swagger ClassStatus模型 */
export type ClassStatus = 0 | 1 | 2 | number; // 0-未开始，1-进行中，2-已结束

/** 班级实体 - 基于swagger Clazz模型 */
export interface ClassItem {
  /** 班级ID */
  id: string;
  /** 班级名称 */
  name: string;
  /** 课程ID */
  course_id: string;
  /** 课程名称 */
  course_name?: string;
  /** 成员数量 */
  member_count?: number;
  /** 最大成员数 */
  max_members?: number;
  /** 状态 - 支持字符串和数字类型 */
  status?: ClassStatus;
  /** 创建时间 */
  ctime?: string;
  /** 更新时间 */
  mtime?: string;
  /** 教师ID列表 */
  teacher_ids?: string[];
  /** 教师列表详情 */
  teachers?: any[];
  /** 成员ID列表 */
  member_ids?: string[];
  /** 描述 */
  description?: string;
  /** 上课时间安排 */
  schedule?: string;
  /** 是否需要邀请码验证 */
  require_invite?: boolean;
  /** 班级编号 */
  c_id?: string;
  /** 新增人数 */
  add_nums?: number;
  
  // 兼容旧版本字段
  /** 教师ID (兼容) */
  teacher_id?: string;
  /** 教师名称 (兼容) */
  teacher_name?: string;
  /** 创建时间 (兼容) */
  created_at?: string;
  /** 更新时间 (兼容) */
  updated_at?: string;
}

/** 班级列表查询参数 */
export interface ClassListQuery {
  /** 关键词（班级名称） */
  keyword?: string;
  /** 状态筛选 */
  status?: ClassStatus;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  page_size?: number;
}

/** 班级列表响应 */
export interface ClassListResponse {
  code?: number;
  message?: string;
  data?: ClassItem[];
  classes?: ClassItem[]; // 备用字段
  total?: number;
  page?: number;
  page_size?: number;
  total_page?: number;
}

/** 班级数组响应（直接返回数组的情况） */
export type ClassArrayResponse = ClassItem[];

/** 创建班级请求 - 基于swagger CreateClazzRequest模型 */
export interface CreateClassRequest {
  /** 班级名称 */
  name: string;
  /** 课程ID */
  course_id: string;
  /** 教师ID列表（必填） */
  teacher_ids: string[];
  /** 最大成员数 */
  max_members?: number;
  /** 描述 */
  description?: string;
  /** 上课时间安排 */
  schedule?: string;
  /** 是否需要邀请码验证（必填） */
  require_invite: boolean;
}

/** 更新班级请求 - 基于swagger UpdateClazzRequest模型 */
export interface UpdateClassRequest {
  /** 班级ID（必填） */
  clazz_id: string;
  /** 班级名称 */
  name?: string;
  /** 最大成员数 */
  max_members?: number;
  /** 描述 */
  description?: string;
  /** 上课时间安排 */
  schedule?: string;
  /** 是否需要邀请码验证 */
  require_invite?: boolean;
}

/** 添加班级成员请求 - 基于swagger AddClazzMemberRequest模型 */
export interface AddClazzMemberRequest {
  /** 班级ID */
  clazz_id: string;
  /** 成员ID */
  member_id: string;
}

/** 移除班级成员请求 - 基于swagger RemoveClazzMembersRequest模型 */
export interface RemoveClazzMembersRequest {
  /** 班级ID */
  clazz_id: string;
  /** 成员ID列表 */
  member_ids: string[];
}

/** 添加班级教师请求 - 基于swagger AddClazzTeachersRequest模型 */
export interface AddClazzTeachersRequest {
  /** 班级ID */
  clazz_id: string;
  /** 教师ID列表 */
  teacher_ids: string[];
}

/** 移除班级教师请求 - 基于swagger RemoveClazzTeachersRequest模型 */
export interface RemoveClazzTeachersRequest {
  /** 班级ID */
  clazz_id: string;
  /** 教师ID列表 */
  teacher_ids: string[];
}

/** UI 层表格行数据 */
export interface ClassTableRow extends ClassItem {
  statusLabel: string;
  statusType: '' | 'success' | 'info' | 'warning';
  memberDisplay: string;
}

/** 班级成员 */
export interface ClassMember {
  /** 成员ID */
  id: string;
  /** 用户名 */
  username?: string;
  /** 成员姓名 */
  name?: string;
  /** 真实姓名 */
  real_name?: string;
  /** 学号 */
  student_id?: string;
  /** 邮箱 */
  email?: string;
  /** 头像 */
  avatar?: string;
  /** 个人简介 */
  bio?: string;
  /** 学校 */
  school?: string;
  /** 专业 */
  major?: string;
  /** 年级 */
  grade?: string;
  /** 班级 */
  class?: string;
  /** 角色 */
  role?: string;
  /** 是否激活 */
  is_active?: boolean;
  /** 创建时间 */
  created_at?: string;
  /** 加入时间 */
  joined_at?: string;
}

/** 班级成员列表查询参数 */
export interface ClassMemberQuery {
  /** 班级ID */
  class_id: string;
  /** 关键词搜索 */
  keyword?: string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  page_size?: number;
}

/** 班级成员列表响应 */
export interface ClassMemberResponse {
  members: ClassMember[];
  total: number;
  page: number;
  page_size: number;
  total_page: number;
}

/** 班级二维码响应 - 根据实际API响应调整 */
export type ClassQRCodeResponse = string; // API直接返回base64字符串

/** 班级二维码响应对象（备用，如果API返回对象格式） */
export interface ClassQRCodeResponseObject {
  /** 二维码图片base64 */
  qr_code: string;
  /** 邀请码 */
  invite_code?: string;
  /** 过期时间 */
  expires_at?: string;
}

/** 添加学生到班级请求 */
export interface AddStudentToClassRequest {
  /** 班级ID */
  class_id: string;
  /** 课程ID */
  course_id: string;
  /** 学生ID */
  student_id: string;
}

/** 从班级移除学生请求 */
export interface RemoveStudentFromClassRequest {
  /** 班级ID */
  class_id: string;
  /** 课程ID */
  course_id: string;
  /** 学生ID */
  student_id: string;
}

/** 学生班级关系响应 */
export interface StudentClassResponse {
  /** 记录ID */
  id: string;
  /** 班级ID */
  class_id: string;
  /** 课程ID */
  course_id: string;
  /** 学生ID */
  student_id: string;
  /** 状态 */
  status: string;
  /** 加入时间 */
  join_time: string;
  /** 创建时间 */
  ctime: string;
  /** 修改时间 */
  mtime: string;
  /** 班级信息 */
  class?: ClassItem;
  /** 课程信息 */
  course?: {
    id: string;
    name: string;
    description?: string;
    status?: number;
    ctime?: string;
    mtime?: string;
  };
  /** 学生信息 */
  student?: {
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
}
