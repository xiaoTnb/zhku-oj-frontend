// 参数=============================================================
/** 1、获取提交列表参数（已校验） */
export interface SubmitListParams {
  page?: number;
  page_size?: number;
  problem_id?: string;
  user_id?: string; // 管理员可用
}

/** 2、提交评测请求体（POST /submit，已校验） */
export interface SubmitPayload {
  /** 题目ID */
  problem_id: string;
  /** 源代码 */
  code: string;
  /** 语言标识，如 'cpp' | 'python' | 'java' | 'javascript' | 'go' | 'rust' */
  language: string; // e.g., 'cpp' | 'python' | 'java' | 'javascript' | 'go' | 'rust'
}

/** 3、提交响应结果（POST /submit 响应） */
export interface SubmitResponse {
  /** 提示消息 */
  message: string;
  /** 提交ID */
  submit_id: string;
}

/** 4、WebSocket消息类型 */
export interface WebSocketMessage {
  /** 消息数据 */
  data: string;
  /** 提交ID */
  submit_id: string;
  /** 时间戳 */
  timestamp: string;
  /** 消息类型 */
  type: string;
}

// 响应结果=============================================================
// 状态枚举类型
export type SubmissionStatus = 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'time_limit' | 'memory_limit' | 'runtime_error' | 'compile_error' | 'system_error';
export type TestCaseStatus = 'pending' | 'running' | 'passed' | 'failed' | 'error';
export type Language = 'c' | 'cpp' | 'java' | 'python' | 'javascript' | 'go' | 'rust' | 'php' | 'ruby' | 'csharp' | 'swift' | 'kotlin' | 'scala' | 'perl' | 'r' | 'matlab' | 'shell' | 'typescript';

// 测试用例结果接口
export interface TestCaseResult {
  error: string;
  expected: string;
  is_sample: boolean;
  memory_used: number;
  output: string;
  status: TestCaseStatus;
  test_case_id: string;
  time_used: number;
}

// 提交结果接口
export interface SubmissionResult {
  compile_error: string;
  memory_used: number;
  runtime_error: string;
  status: SubmissionStatus;
  test_results: TestCaseResult[];
  time_used: number;
}

// UI层提交结果类型（用于组件间传递）
export interface SubmitResult {
  success: boolean;
  status: string;
  message?: string;
  runtime?: number;
  memory?: number;
  compile_error?: string;
  runtime_error?: string;
  test_results?: TestCaseResult[];
  passedCount?: number;
  totalCount?: number;
  submission_id?: string | null;
  error?: string;
  failedCase?: {
    input: string;
    expected: string;
    actual: string;
  };
}

// 1、主提交接口（根据实际API数据结构更新）
export interface SubmitDetail {
  id: string;
  problem_id: string;
  user_id: string;
  language: Language;
  status: SubmissionStatus;
  time_used: number;
  memory_used: number;
  created_at: string;
  // 可选字段，用于详细信息
  code?: string;
  result?: SubmissionResult;
  updated_at?: string;
}