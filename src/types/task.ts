/** 任务类型枚举 */
export enum TaskType {
  /** 题单 */
  PROBLEM_LIST = 1,
  /** 视频 */
  VIDEO = 2,
}

/** 任务状态枚举 */
export enum TaskStatus {
  /** 未开始 */
  NOT_STARTED = 0,
  /** 进行中 */
  ONGOING = 1,
  /** 已结束 */
  COMPLETED = 2,
}

/** 任务题目信息 */
export interface TaskQuestion {
  /** 题目ID */
  id: string;
  /** 题号 */
  unique_id?: number;
  /** 题目标题 */
  title: string;
  /** 题目难度 */
  difficulty: 'easy' | 'medium' | 'hard';
  /** 是否已完成 */
  completed: boolean;
}

/** 任务实体 - 基于swagger Task模型 */
export interface Task {
  /** 任务ID */
  id: string;
  /** 班级ID */
  clazz_id: string;
  /** 课程ID */
  course_id: string;
  /** 创建者ID */
  c_id?: string;
  /** 任务标题 */
  title: string;
  /** 任务描述 */
  description?: string;
  /** 任务类型 (1-题单, 2-视频, 等) */
  type: number;
  /** 任务状态 (0-未开始, 1-进行中, 2-已结束) */
  status: number;
  /** 开始时间 */
  start_time: string;
  /** 结束时间 */
  end_time: string;
  /** 关联的资源ID列表 */
  relation_ids: string[];
  /** 已完成的学生ID列表 */
  finish_ids: string[];
  /** 任务题目列表 */
  questions?: TaskQuestion[];
  /** 创建时间 */
  ctime: string;
  /** 更新时间 */
  mtime: string;
}

/** 添加任务请求参数 - 基于swagger AddTaskRequest模型 */
export interface AddTaskRequest {
  /** 课程ID（必填） */
  course_id: string;
  /** 任务标题（必填） */
  title: string;
  /** 任务类型（必填） */
  type: TaskType;
  /** 开始时间（必填） */
  start_time: string;
  /** 任务描述（必填） */
  description: string;
  /** 结束时间（必填） */
  end_time: string;
  /** 关联资源ID列表 */
  relation_ids: string[];
  /** 班级ID列表 */
  clazz_ids: string[];
}

/** 更新任务请求参数 - 基于swagger UpdateTaskRequest模型 */
export interface UpdateTaskRequest {
  /** 任务ID（必填） */
  task_id: string;
  /** 课程ID（必填） */
  course_id: string;
  /** 班级ID（必填） */
  clazz_id: string;
  /** 任务标题 */
  title?: string;
  /** 任务描述 */
  description?: string;
  /** 任务类型（1: 题单, 2: 视频） */
  type?: TaskType;
  /** 开始时间（ISO8601格式） */
  start_time?: string;
  /** 结束时间（ISO8601格式） */
  end_time?: string;
  /** 关联资源ID列表 */
  relation_ids?: string[];
}

/** 完成任务请求参数 */
export interface FinishTaskRequest {
  /** 班级ID */
  clazz_id: string;
  /** 关联题目ID */
  relation_id: string;
  /** 任务ID */
  task_id: string;
}

/** 新增任务题目请求参数 */
export interface AddTaskProblemsRequest {
  /** 任务ID */
  task_id: string;
  /** 关联题目ID列表 */
  relation_ids: string[];
}

/** 删除任务题目请求参数 */
export interface RemoveTaskProblemsRequest {
  /** 任务ID */
  task_id: string;
  /** 要删除的题目ID列表 */
  relation_ids: string[];
}

/** 分页查询任务完成情况请求参数 */
export interface PageQueryTaskCompletionRequest {
  /** 任务ID */
  task_id: string;
  /** 班级ID */
  class_id: string;
  /** 页码 */
  page_num: number;
  /** 页面大小 */
  page_size: number;
  /** 真实姓名（可选） */
  real_name?: string;
  /** 用户ID（可选） */
  user_id?: string;
}

/** 任务完成情况响应数据 */
export interface TaskCompletionResponse {
  /** 用户ID */
  user_id: string;
  /** 真实姓名 */
  real_name: string;
  /** 学生ID */
  student_id: string;
  /** 是否已完成 */
  completed: boolean;
  /** 完成时间（如果已完成） */
  completed_at?: string;
  /** 总题目数 */
  total_questions: number;
  /** 已完成题目数 */
  finished_questions: number;
}

/** 分页查询任务完成情况响应 */
export interface PageQueryTaskCompletionResponse {
  /** 总数 */
  total: number;
  /** 页码 */
  page_num: number;
  /** 页面大小 */
  page_size: number;
  /** 完成情况列表 */
  completion: TaskCompletionResponse[];
}



/** UI 层任务表格行数据 */
export interface TaskTableRow {
  id: string;
  title: string;
  description: string;
  typeLabel: string;
  typeType: '' | 'success' | 'info';
  startTime: string;
  endTime: string;
  statusLabel: string;
  statusType: '' | 'success' | 'warning' | 'info';
  progress: string;
  relationCount: number;
  finishCount: number;
}

/** UI 层任务卡片数据 */
export interface TaskCardItem {
  id: string;
  title: string;
  description?: string;
  typeLabel: string;
  typeType: '' | 'success' | 'info' | 'warning';
  typeIcon: string;
  statusLabel: string;
  statusType: '' | 'success' | 'info' | 'warning';
  startTime: string;
  endTime?: string;
  progress: number;
  relationCount: number;
  finishCount: number;
  relationIds: string[];
  finishIds: string[];
}

/** 任务详情响应 */
export interface TaskDetailResponse {
  code: number;
  data: Task;
  message: string;
}

/** 任务详情页面需要的数据 */
export interface TaskDetail extends Task {
  // 可以添加一些前端需要的额外字段
  progressPercentage?: number;
  isFinished?: boolean;
  resources?: any[]; // 关联的资源列表
}
