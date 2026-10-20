/** AI 事件流读取器：处理网络分片、UTF-8 边界及 SSE 多行数据。 */
import type { GenerationEvent } from '@/types/aiGeneration'

/** 按完整 SSE 消息分发，连接异常结束时由调用方判断是否已收到草稿。 */
export async function consumeGenerationStream(
  response: Response,
  onEvent: (event: GenerationEvent) => void,
): Promise<void> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || payload.msg || `请求失败（${response.status}）`)
  }
  if (!response.headers.get('content-type')?.includes('text/event-stream')) {
    throw new Error('服务器未返回生成进度，请检查后端配置')
  }
  if (!response.body) throw new Error('浏览器不支持流式响应')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const dispatch = (frame: string) => {
    const data = frame.split(/\r?\n/)
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).replace(/^ /, '')).join('\n')
    if (!data || data === '[DONE]') return
    const event = JSON.parse(data) as GenerationEvent
    if (event.type === 'error') throw new Error(event.error_message || event.content || '生成失败，请重试')
    onEvent(event)
  }
  try {
    while (true) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      let boundary: RegExpExecArray | null
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        dispatch(buffer.slice(0, boundary.index))
        buffer = buffer.slice(boundary.index + boundary[0].length)
      }
      if (done) break
    }
    if (buffer.trim()) dispatch(buffer)
  } finally {
    // 错误或组件取消时释放连接，避免后台请求继续占用浏览器资源。
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
}
