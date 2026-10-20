import { ref, type Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { BrowserMultiFormatReader } from '@zxing/browser'

/**
 * 二维码扫描结果接口
 */
export interface QRScanResult {
  success: boolean
  data?: string
  error?: string
}

/**
 * 班级邀请码信息接口
 */
export interface ClassInviteInfo {
  classId: string
  className: string
  teacherName?: string
  inviteCode: string
}

/**
 * 二维码扫描器类
 */
export class QRCodeScanner {
  private isScanning: Ref<boolean>
  private scanResult: Ref<string>
  private error: Ref<string>

  constructor() {
    this.isScanning = ref(false)
    this.scanResult = ref('')
    this.error = ref('')
    console.log('🔍 QRCodeScanner 初始化完成')
  }

  /**
   * 获取扫描状态
   */
  get scanning() {
    return this.isScanning.value
  }

  /**
   * 获取扫描结果
   */
  get result() {
    return this.scanResult.value
  }

  /**
   * 获取错误信息
   */
  get errorMessage() {
    return this.error.value
  }

  /**
   * 开始扫描
   */
  async startScan() {
    console.log('📹 开始启动摄像头扫描...')
    this.isScanning.value = true
    this.error.value = ''
    this.scanResult.value = ''
    
    // 检查浏览器是否支持摄像头
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = '当前浏览器不支持摄像头功能'
      console.error('❌ 摄像头支持检查失败:', errorMsg)
      this.error.value = errorMsg
      this.isScanning.value = false
      return
    }
    
    console.log('✅ 浏览器支持摄像头，qr-stream 组件将处理摄像头权限...')
    
    // 不再主动请求权限，让 qr-stream 组件自己处理
    // 这样可以避免权限冲突问题
  }

  /**
   * 停止扫描
   */
  stopScan() {
    console.log('🛑 停止摄像头扫描')
    this.isScanning.value = false
  }

  /**
   * 处理扫描结果
   */
  onScanSuccess(result: string): QRScanResult {
    console.log('🎯 扫描到二维码:', result)
    try {
      this.scanResult.value = result
      this.stopScan()
      
      // 验证二维码格式
      const inviteInfo = this.parseInviteCode(result)
      if (!inviteInfo) {
        throw new Error('无效的班级邀请码格式')
      }

      return {
        success: true,
        data: result
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '扫描失败'
      this.error.value = errorMsg
      return {
        success: false,
        error: errorMsg
      }
    }
  }

  /**
   * 处理扫描错误
   */
  onScanError(error: Error) {
    console.error('❌ 摄像头扫描出错:', error)
    console.error('错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    
    // 根据不同的错误类型提供更具体的错误信息
    let errorMessage = error.message || '扫描出错'
    
    if (error.name === 'NotAllowedError') {
      errorMessage = '摄像头权限被拒绝，请允许访问摄像头'
      console.error('🚫 用户拒绝了摄像头权限')
    } else if (error.name === 'NotFoundError') {
      errorMessage = '未找到摄像头设备'
      console.error('📷 未检测到摄像头设备')
    } else if (error.name === 'NotSupportedError') {
      errorMessage = '浏览器不支持摄像头功能'
      console.error('🌐 浏览器不支持摄像头')
    } else if (error.name === 'NotReadableError') {
      errorMessage = '摄像头被其他应用占用'
      console.error('🔒 摄像头设备被占用')
    }
    
    this.error.value = errorMessage
    this.stopScan()
    ElMessage.error(`扫描失败: ${errorMessage}`)
  }

  /**
   * 解析班级邀请码
   * 假设二维码格式为: zkcodearena://join-class?classId=xxx&inviteCode=xxx&className=xxx
   */
  parseInviteCode(qrData: string): ClassInviteInfo | null {
    try {
      // 检查是否是我们的应用二维码
      if (!qrData.startsWith('zkcodearena://join-class')) {
        return null
      }

      const url = new URL(qrData)
      const classId = url.searchParams.get('classId')
      const inviteCode = url.searchParams.get('inviteCode')
      const className = url.searchParams.get('className')
      const teacherName = url.searchParams.get('teacherName')

      if (!classId || !inviteCode || !className) {
        return null
      }

      return {
        classId,
        className: decodeURIComponent(className),
        teacherName: teacherName ? decodeURIComponent(teacherName) : undefined,
        inviteCode
      }
    } catch (error) {
      console.error('解析邀请码失败:', error)
      return null
    }
  }

  /**
   * 显示加入班级确认对话框
   */
  async showJoinConfirmDialog(inviteInfo: ClassInviteInfo): Promise<boolean> {
    try {
      const teacherInfo = inviteInfo.teacherName ? `\n授课教师: ${inviteInfo.teacherName}` : ''
      
      await ElMessageBox.confirm(
        `确认要加入以下班级吗？\n\n班级名称: ${inviteInfo.className}${teacherInfo}\n邀请码: ${inviteInfo.inviteCode}`,
        '加入班级确认',
        {
          confirmButtonText: '确认加入',
          cancelButtonText: '取消',
          type: 'info',
          center: true
        }
      )
      return true
    } catch {
      return false
    }
  }

  /**
   * 重置扫描器状态
   */
  reset() {
    this.isScanning.value = false
    this.scanResult.value = ''
    this.error.value = ''
  }
}

/**
 * 创建二维码扫描器实例
 */
export function useQRScanner() {
  return new QRCodeScanner()
}

/**
 * 验证班级邀请码格式
 */
export function validateInviteCode(code: string): boolean {
  // 简单的邀请码格式验证
  return /^[A-Z0-9]{6,12}$/.test(code)
}

/**
 * 生成班级邀请二维码数据
 * 这个函数主要供教师端使用
 */
export function generateClassInviteQR(classInfo: {
  classId: string
  className: string
  inviteCode: string
  teacherName?: string
}): string {
  const params = new URLSearchParams({
    classId: classInfo.classId,
    inviteCode: classInfo.inviteCode,
    className: encodeURIComponent(classInfo.className)
  })

  if (classInfo.teacherName) {
    params.append('teacherName', encodeURIComponent(classInfo.teacherName))
  }

  return `zkcodearena://join-class?${params.toString()}`
}

/**
 * 从 DataURL 格式的二维码图片中解码出文本内容
 * 兼容形如 `data:image/png;base64,...` 的字符串
 */
export async function decodeQRFromDataURL(dataUrl: string): Promise<string | null> {
  if (!dataUrl) return null
  try {
    const reader = new BrowserMultiFormatReader()
    const result = await reader.decodeFromImageUrl(dataUrl)
    return result?.getText() || null
  } catch (error) {
    console.error('decodeQRFromDataURL 失败:', error)
    return null
  }
}

/**
 * 解析二维码中的班级邀请信息（多格式兼容）
 * 支持：
 *  - 逗号分隔: "inviteCode,classId"
 *  - 自定义协议: zkcodearena://join-class?classId=...&inviteCode=...
 *  - JSON 文本: { inviteCode: "...", classId: "..." }
 */
export function parseClassInvitePayload(text: string): { inviteCode: string; classId: string } | null {
  if (!text) return null
  const s = text.trim()

  // 1) 逗号分隔格式
  if (s.includes(',')) {
    const [inviteCode, classId] = s.split(',').map(v => v.trim())
    if (inviteCode && classId) return { inviteCode, classId }
  }

  // 2) 自定义协议格式
  const info = new QRCodeScanner().parseInviteCode(s)
  if (info && info.inviteCode && info.classId) {
    return { inviteCode: info.inviteCode, classId: info.classId }
  }

  // 3) JSON 文本格式
  try {
    const obj = JSON.parse(s)
    const inviteCode = obj.inviteCode || obj.code || obj.invite_code
    const classId = obj.classId || obj.id || obj.class_id
    if (inviteCode && classId) return { inviteCode, classId }
  } catch {}

  return null
}