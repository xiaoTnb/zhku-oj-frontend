import type { WebSocketMessage } from '@/types/submit'

/**
 * 简洁的WebSocket连接管理类
 * 用于处理提交评测的实时状态更新
 */
export class SubmitWebSocket {
  private ws: WebSocket | null = null
  private submitId: string
  private token: string
  private baseUrl: string

  // 事件回调
  private onMessageCallback?: (message: WebSocketMessage) => void
  private onErrorCallback?: (error: Event) => void
  private onCloseCallback?: (event: CloseEvent) => void
  private onOpenCallback?: () => void

  private static trimTrailingSlash(value: string): string {
    return value.replace(/\/+$/, '')
  }

  private static resolveBaseUrl(): string {
    const envValue = ((import.meta.env.VITE_WS_BASE_URL as string | undefined) || '').trim()

    if (!envValue) {
      throw new Error('Missing VITE_WS_BASE_URL')
    }

    if (!/^wss?:\/\//i.test(envValue)) {
      throw new Error('VITE_WS_BASE_URL must start with ws:// or wss://')
    }

    return SubmitWebSocket.trimTrailingSlash(envValue)
  }

  constructor(submitId: string, token: string) {
    this.submitId = submitId
    this.token = token
    this.baseUrl = SubmitWebSocket.resolveBaseUrl()
  }

  /**
   * 建立WebSocket连接
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 构建WebSocket URL
        const wsUrl = `${this.baseUrl}/ws/submit/${encodeURIComponent(this.submitId)}?token=${encodeURIComponent(this.token)}`
        
        console.log('🔗 WebSocket连接中...')

        // 创建WebSocket连接
        this.ws = new WebSocket(wsUrl)

        // 设置连接超时（10秒）
        const connectTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            console.warn('⏰ WebSocket连接超时')
            this.ws.close()
            reject(new Error('WebSocket连接超时'))
          }
        }, 10000)

        // 连接成功
        this.ws.onopen = () => {
          clearTimeout(connectTimeout)
          console.log('✅ WebSocket连接成功')
          this.onOpenCallback?.()
          resolve()
        }

        // 接收消息
        this.ws.onmessage = (event) => {
          try {
            console.log('📨 WebSocket原始消息:', event.data)
            console.log('📨 WebSocket原始消息类型:', typeof event.data)
            
            const message: WebSocketMessage = JSON.parse(event.data)
            console.log('📨 WebSocket解析后消息:', JSON.stringify(message, null, 2))
            console.log('📨 WebSocket消息结构:', {
              type: typeof message,
              keys: Object.keys(message),
              message: message
            })
            
            this.onMessageCallback?.(message)
          } catch (error) {
            console.error('❌ 解析消息失败:', error)
            console.error('❌ 原始数据:', event.data)
          }
        }

        // 连接错误
        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout)
          console.error('❌ WebSocket连接错误:', error)
          this.onErrorCallback?.(error)
          reject(new Error('WebSocket连接失败'))
        }

        // 连接关闭
        this.ws.onclose = (event) => {
          clearTimeout(connectTimeout)
          
          const reason = event.code === 1000 ? '正常关闭' : '异常关闭'
          console.log(`🔌 WebSocket连接关闭: ${event.code} - ${reason}`)
          
          this.onCloseCallback?.(event)
          
          // 如果是异常关闭且还在连接阶段，触发reject
          if (event.code !== 1000 && this.ws?.readyState === WebSocket.CONNECTING) {
            reject(new Error(`WebSocket连接关闭: ${event.code} - ${reason}`))
          }
        }

      } catch (error) {
        console.error('❌ WebSocket初始化失败:', error)
        reject(error)
      }
    })
  }

  /**
   * 发送消息
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  /**
   * 关闭连接
   */
  close(): void {
    if (this.ws) {
      this.ws.close(1000, '正常关闭')
      this.ws = null
    }
  }

  /**
   * 设置消息接收回调
   */
  onMessage(callback: (message: WebSocketMessage) => void): void {
    this.onMessageCallback = callback
  }

  /**
   * 设置错误回调
   */
  onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback
  }

  /**
   * 设置关闭回调
   */
  onClose(callback: (event: CloseEvent) => void): void {
    this.onCloseCallback = callback
  }

  /**
   * 设置打开回调
   */
  onOpen(callback: () => void): void {
    this.onOpenCallback = callback
  }

  /**
   * 获取连接状态
   */
  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  /**
   * 检查是否已连接
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

/**
 * 创建提交WebSocket连接的工厂函数
 */
export function createSubmitWebSocket(
  submitId: string, 
  token: string
): SubmitWebSocket {
  return new SubmitWebSocket(submitId, token)
}
