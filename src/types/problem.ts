/** 题目难度枚举（已校验） */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** 题目状态枚举（已校验） */
export type ProblemStatus = 'draft' | 'published' | 'archived';

/** 1、获取题目列表查询参数（GET /problem） */
export interface ProblemListQuery {
  /** 页码，默认1 */
  page?: number;
  /** 每页数量，默认10 */
  page_size?: number;
  /** 难度筛选 */
  difficulty?: Difficulty;
  /** 标签列表或逗号分隔字符串 */
  tags?: string[] | string;
  /** 是否包含私有题目 */
  include_private?: boolean;
}

/** 获取题目列表响应（已校验） */
export interface ProblemListResponse {
  problems: ProblemBrief[];
  total: number;
  page: number;
  page_size: number;
  total_page: number;
}

/** 2、搜索题目查询参数（GET /problem/search，已校验） */
export interface ProblemSearchQuery {
  /** 关键词 */
  keyword?: string;
  /** 难度筛选 */
  difficulty?: Difficulty;
  /** 标签列表或逗号分隔字符串 */
  tags?: string[] | string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  page_size?: number;
}

/** 列表项简要信息（已校验） */
export interface ProblemBrief {
  /** 题目ID */
  id: string;
  /** 题号 */
  unique_id?: number;
  /** 标题 */
  title: string;
  /** 难度 */
  difficulty?: Difficulty;
  /** 标签 */
  tags?: string[];
  /** 通过数 */
  ac_count?: number;
  /** 接受数 */
  accepted_count?: number;
  /** 提交数 */
  submit_count?: number;
  /** 通过率 */
  ac_rate?: number;
  /** 创建时间 */
  created_at?: string;
  /** 是否为公有题目 */
  is_public?: boolean;
  /** 题目状态 */
  status?: ProblemStatus;
  /** 更新时间 */
  updated_at?: string;
  /** 作者 */
  author?: string;
  /** 创建者用户ID */
  created_by?: string;
  /** 样例输入 */
  sample_input?: string;
  /** 样例输出 */
  sample_output?: string;
  /** 来源 */
  source?: string;
  /** 提示 */
  hint?: string;
}

/** 题目示例 */
export interface ProblemExample {
  /** 输入示例 */
  input: string;
  /** 输出示例 */
  output: string;
  /** 解释说明 */
  explanation?: string;
}

/** 测试用例 */
export interface TestCase {
  /** 输入 */
  input: string;
  /** 期望输出 */
  output: string;
  /** 是否为示例（可见） */
  is_sample?: boolean;
}

/** 题目详情（已校验）*/
export interface Problem extends ProblemBrief {
  /** 题面描述（支持 Markdown） */
  description: string;
  /** 输入 */
  input?: string;
  /** 内存限制（MB） */
  memory_limit?: number;
  /** 输出 */
  output?: string;
  /** 时间限制（ms） */
  time_limit?: number;
  /** 示例列表 */
  examples?: ProblemExample[];
  /** 约束条件 */
  constraints?: string[];
  /** 进阶思考 */
  followUp?: string;
  /** 相关公司 */
  companies?: string[];
  /** 接受率（百分比） */
  acceptance?: number;
  /** 提交次数 */
  submissions?: number;
}

/** 创建题目请求体（POST /problems, 已校验） */
export interface CreateProblemRequest extends Omit<Problem, 'id' | 'ac_count' | 'submit_count' | 'ac_rate' | 'created_at' | 'updated_at' | 'created_by' | 'accepted_count' | 'submissions' | 'source' | 'author'> {
  // 创建时不需要这些字段，由后端自动生成
  // 保留 status 字段，允许创建时设置题目状态
}

/** 更新题目请求体（PUT /problems/{id}，已校验） */
export interface UpdateProblemRequest extends Partial<Omit<Problem, 'id' | 'created_at' | 'updated_at' | 'created_by'>> {
  // 更新时可以只传需要修改的字段
}

/** 运行代码请求体（POST /problem/{id}/run） */
export interface RunCodePayload {
  /** 源代码 */
  code: string;
  /** 语言标识，如 'cpp'|'python'|'java' */
  language: string;
  /** 自定义输入（可选） */
  input?: string;
}

/** 运行代码结果 /** 运行代码结果（已校验） /** 运行代码结果 */
export interface RunCodeResult {
  /** 状态 */
  status: string;
  /** 错误信息 */
  error?: string;
  /** 输出 */
  output?: string;
  /** 时间使用 */
  time_used?: number;
  /** 内存使用 */
  memory_used?: number;
  /** 测试用例 */
  test_cases?: string[];
  /** 是否成功 */
  success?: boolean;
}

/** API响应包装器 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

/** 通用分页响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

/** 题目列表查询结果（用于 UI） */
export interface ProblemListResult {
  items: ProblemBrief[];
  total: number;
  page: number;
  pageSize: number;
  totalPage: number;
}

/** 题目分类 */
export interface Category {
  id: number;
  name: string;
  description: string;
  count: number;
}

/** UI 层表格行数据（扩展 ProblemBrief） */
export interface ProblemTableRow extends ProblemBrief {
  difficultyLabel?: string; // 中文难度标签
  difficultyType: '' | 'success' | 'warning' | 'danger';
  acRate: string; // 格式化后的通过率字符串
  submitCount: number;
  acceptedCount: number;
}

/** UI 层卡片数据 */
export interface ProblemCardItem {
  id: string;
  title: string;
  difficulty: string;
  difficultyColor: string;
  difficultyIcon: string;
  tags: string[];
  acRate: number;
  submitCount: number;
  acceptedCount: number;
  description: string;
}

/**
 * 管理员端题目列表查询参数
 */
export interface AdminProblemListQuery {
  /** 页码 */
  page?: number;
  /** 每页数量 */
  page_size?: number;
  /** 难度筛选 */
  difficulty?: Difficulty;
  /** 标签列表 */
  tags?: string[];
}

/**
 * 题目详情聚合信息
 */
export interface ProblemDetailAggregate {
  problem: Problem;
  sample_cases: TestCase[];
}

/**
 * 每日推荐题目
 */
export interface DailyProblem {
  daily_problem: ProblemBrief;
  message: string;
}

/**
 * 题目难度统计
 */
export interface ProblemDifficultyStats {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}
