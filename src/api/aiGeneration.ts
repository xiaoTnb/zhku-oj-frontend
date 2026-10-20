/** AI 出题接口：复用用户令牌访问后端，浏览器不直接调用模型提供商。 */
import { baseURL, getAuthToken, httpPost, httpGet } from '@/utils/request'
import { consumeGenerationStream } from '@/utils/aiStream'
import type { GenerationEvent, GenerationRequest, SaveItem, SaveResponse } from '@/types/aiGeneration'

/** POST 流式接口不能使用 EventSource，需通过 fetch 同时传递令牌和请求体。 */
export async function generateProblems(
  request: GenerationRequest,
  signal: AbortSignal,
  onEvent: (event: GenerationEvent) => void,
): Promise<void> {
  const token = getAuthToken()
  if (!token) throw new Error('登录已失效，请重新登录')
  const response = await fetch(`${baseURL}/ai/oj-question-gen/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(request),
    signal,
  })
  if (response.status === 401) throw new Error('登录已失效，请重新登录')
  await consumeGenerationStream(response, onEvent)
}

/** 只提交草稿 ID 和选择范围，题目内容由服务端草稿读取，防止篡改。 */
export function saveGeneratedProblems(draftId: string, items: SaveItem[]): Promise<SaveResponse> {
  return httpPost<SaveResponse>('/ai/oj-question-gen/save', { draft_id: draftId, items })
}

/** 课程接口使用 page_num 分页，独立适配以免与题库的 page 参数混淆。 */
export function queryGenerationCourses(path: '/courses' | '/courses/teaching', page: number) {
  return httpGet<import('@/types/course').CourseListResponse>(path, { page_num: page, page_size: 100 })
}