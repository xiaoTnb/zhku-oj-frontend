/** SSE 读取测试：验证真实网络分片、错误事件与取消行为，避免生成过程静默丢失。 */
import { describe, expect, it } from 'vitest'
import { consumeGenerationStream } from '../aiStream'
import type { GenerationEvent } from '../../types/aiGeneration'

function streamResponse(chunks: Uint8Array[], contentType = 'text/event-stream') {
  return new Response(new ReadableStream({ start(controller) { chunks.forEach(chunk => controller.enqueue(chunk)); controller.close() } }), { headers: { 'Content-Type': contentType } })
}
const encode = (value: string) => new TextEncoder().encode(value)

describe('AI 出题事件流', () => {
  it('合并单字节分片中的中文、CRLF 和多行数据，并处理末尾未换行的消息', async () => {
    const bytes = encode(': keepalive\r\n\r\ndata: {"type":"question_generated",\r\ndata: "data":{"title":"数组求和"}}\r\n\r\ndata: {"type":"done"}')
    const events: GenerationEvent[] = []
    await consumeGenerationStream(streamResponse([...bytes].map(byte => new Uint8Array([byte]))), event => events.push(event))
    expect(events).toEqual([{ type: 'question_generated', data: { title: '数组求和' } }, { type: 'done' }])
  })
  it('将业务错误抛给页面，避免把失败误报为生成完成', async () => {
    await expect(consumeGenerationStream(streamResponse([encode('data: {"type":"error","error_message":"模型配置不可用"}\n\n')]), () => {})).rejects.toThrow('模型配置不可用')
  })
  it('保留认证失败原因', async () => {
    await expect(consumeGenerationStream(new Response(JSON.stringify({ message: '需要登录' }), { status: 401 }), () => {})).rejects.toThrow('需要登录')
  })
  it('拒绝代理返回的 HTML 页面', async () => {
    await expect(consumeGenerationStream(streamResponse([encode('<html />')], 'text/html'), () => {})).rejects.toThrow('服务器未返回生成进度')
  })
  it('传递连接中断错误，不吞掉已接收部分数据后的失败', async () => {
    const response = new Response(new ReadableStream({ pull(controller) { controller.error(new Error('连接中断')) } }), { headers: { 'Content-Type': 'text/event-stream' } })
    await expect(consumeGenerationStream(response, () => {})).rejects.toThrow('连接中断')
  })
})
