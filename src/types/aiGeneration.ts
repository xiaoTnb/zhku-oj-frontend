/** AI 出题协议：集中约束生成事件与草稿保存参数，避免页面与后端字段漂移。 */

/** 生成请求仅包含教学要求，模型密钥始终由后端持有。 */
export interface GenerationRequest {
  knowledge_points: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  count: number
  testcase_count: number
  standard_language: string
  additional_requirements: string
}

/** 沙箱对标准程序的验证结果。 */
export interface Verification {
  passed: boolean
  message: string
  failed_case?: number
}

/** 流式生成的题目草稿，未保存前不属于正式题库。 */
export interface GeneratedProblem {
  id: string
  title: string
  description: string
  input_format: string
  output_format: string
  hint?: string
  difficulty: string
  standard_code?: string
  language?: string
  test_cases?: { input: string; expected_output: string; is_sample: boolean }[]
  verification?: Verification
}

/** 后端统一 SSE 事件；不同阶段的业务数据在 data 中。 */
export interface GenerationEvent {
  type: string
  content?: string
  error_message?: string
  data?: Record<string, unknown>
}

/** 每道题独立指定公开范围和课程，后端继续校验课程管理权限。 */
export interface SaveItem {
  generated_problem_id: string
  is_public: boolean
  course_ids: string[]
}

/** 保存接口允许部分成功，页面必须按单题结果更新状态。 */
export interface SaveResponse {
  draft_id: string
  saved_count: number
  failed_count: number
  discarded_count: number
  results: { generated_problem_id: string; problem_id?: string; success: boolean; error?: string }[]
}
