<template>
  <div class="code-editor-container">
    <!-- 顶部导航栏 -->
    <div class="editor-header">
      <div class="header-left">
        <el-button @click="handleGoBack" type="primary" text>
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回题目详情
        </el-button>
      </div>
      <div>
        <!-- 工具栏 -->
        <EditorToolbar v-model:selected-language="selectedLanguage" :running="running" :submitting="submitting"
          :is-dark-theme="isDarkTheme" @reset="handleResetCode" @run="handleRunCode" @submit="handleSubmitCode"
          @toggle-theme="handleToggleTheme" />
      </div>
      <div class="header-right">
        <el-avatar :size="32" icon="UserFilled" />
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="editor-main">
      <el-container class="editor-container-wrapper">
        <!-- 左侧题目描述 -->
        <ProblemPanel ref="problemPanelRef" :key="`problem-${currentProblem?.id || 'empty'}`" :problem="currentProblem" :loading="loading" @go-back="handleGoBack" @submission-click="handleSubmissionClick" :switch-to-detail-view="switchToDetailView" />

        <!-- 右侧编辑器区域 -->
        <el-main class="editor-panel">
          <div class="editor-container">
            <!-- 代码区域标题 -->
            <div class="code-area-header">
              <div class="tabs-container">
                <span 
                  class="code-title tab" 
                  :class="{ active: editorView === 'code' }"
                  @click="editorView = 'code'"
                >
                  <el-icon class="tab-icon"><Document /></el-icon>
                  <span>代码</span>
                </span>
                <span 
                  v-if="showDetailTab"
                  class="code-title tab" 
                  :class="{ active: editorView === 'detail' }"
                  @click="editorView = 'detail'"
                  style="margin-left: 20px;"
                >
                  <el-icon class="tab-icon"><InfoFilled /></el-icon>
                  <span>详情</span>
                </span>
                <div class="tab-indicator" :class="editorView"></div>
              </div>
            </div>

            <!-- Monaco Editor 或 空白页面 -->
            <div class="editor-content-wrapper" :style="{ height: `${editorHeight}px` }">
              <MonacoEditor 
                v-if="editorView === 'code'" 
                v-model:value="currentCode" 
                :language="selectedLanguage"
                :theme="isDarkTheme ? 'vs-dark' : 'vs'" 
                @ready="handleEditorReady" 
                class="monaco-wrapper"
              />
              <SubmissionDetail v-if="showDetailTab && editorView === 'detail'" :key="`submission-${currentSubmitDetail?.id || 'empty'}`" :submission="currentSubmitDetail || undefined" />
            </div>

            <!-- 可拖拽的分隔条 -->
            <div 
              class="resizer" 
              @mousedown="startResize"
              :class="{ 'resizing': isResizing }"
            >
              <div class="resizer-line"></div>
            </div>

            <!-- 底部结果面板 -->
            <div class="result-wrapper" :style="{ height: `${resultHeight}px` }">
              <ResultPanel v-model:active-tab="activeTab" :execute-result="executeResult" :submit-result="submitResult" :websocket-messages="websocketMessages" />
            </div>
          </div>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { Problem, RunCodePayload, RunCodeResult } from '@/types/problem'
import { ArrowLeft, UserFilled, Document, InfoFilled } from '@element-plus/icons-vue'
import { useProblemsStore } from '@/stores/problems'
import { useSubmitStore } from '@/stores/submit'
import { useUserStore } from '@/stores/user'
import { useTaskStore } from '@/stores/task'
import { runProblemCode } from '@/api/problem'
import { createSubmit } from '@/api/submit'
import type { SubmitPayload, WebSocketMessage, SubmissionResult, TestCaseResult, SubmitResult, SubmitDetail } from '@/types/submit'
import { convertLanguageForApi, languageTemplates } from '@/utils/codeTemplates'
import { createSubmitWebSocket, type SubmitWebSocket } from '@/utils/websocket'
import { getAuthToken } from '@/utils/request'

// 导入组件
import ProblemPanel from './components/ProblemPanel.vue'
import EditorToolbar from './components/EditorToolbar.vue'
import MonacoEditor from './components/MonacoEditor.vue'
import ResultPanel from './components/ResultPanel.vue'
import SubmissionDetail from './components/SubmissionDetail.vue'

// 组件引用
const problemPanelRef = ref<InstanceType<typeof ProblemPanel> | null>(null)

// ACM模式不需要代码模板

const route = useRoute()
const router = useRouter()
const problemsStore = useProblemsStore()
const submitStore = useSubmitStore()
const userStore = useUserStore()
const taskStore = useTaskStore()

// 使用真实数据
const currentProblem = ref<Problem | null>(null)
const loading = ref(true)
const selectedLanguage = ref('Java')
const currentCode = ref('')
const activeTab = ref('result')
const running = ref(false)
const submitting = ref(false)
const editorView = ref('code') // 'code' 或 'detail'，用于切换编辑器视图
const showDetailTab = ref(false) // 控制是否显示详情tab

const executeResult = ref<RunCodeResult | null>(null)
const submitResult = ref<SubmitResult | null>(null)
const isDarkTheme = ref(false)

// 提交详情数据
const currentSubmitDetail = ref<SubmitDetail | null>(null)

// 任务相关参数
const taskParams = ref<{
  task_id?: string
  clazz_id?: string
  relation_id?: string
} | null>(null)

// WebSocket相关状态
let submitWebSocket: SubmitWebSocket | null = null
const currentSubmitId = ref<string | null>(null)

// WebSocket消息日志
interface WebSocketMessageLog {
  type: string
  data: any
  timestamp: number
}
const websocketMessages = ref<WebSocketMessageLog[]>([])

// 拖拽调节相关状态
const isResizing = ref(false)
const containerHeight = ref(600) // 编辑器容器总高度
const resultHeight = ref(300) // 结果面板高度
const minResultHeight = 150 // 最小高度
const maxResultHeight = 600 // 最大高度

// 计算编辑器高度
const editorHeight = computed(() => {
  return containerHeight.value - resultHeight.value - 44 // 减去分隔条高度(4px)和标题高度(40px)
})

// Monaco Editor实例类型
import type * as monaco from 'monaco-editor'
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let isLanguageChanging = false // 标志变量，防止watch循环触发

// 初始化代码 - ACM模式下不提供基础代码
const initCode = () => {
  // 默认加载Java模板代码
  loadTemplateForLanguage('Java')
}

// 加载指定语言的模板代码
const loadTemplateForLanguage = (language: string) => {
  // 清空当前代码
  currentCode.value = ''
  
  // 检查是否有该语言的模板
  if (languageTemplates[language.toLowerCase()]) {
    currentCode.value = languageTemplates[language.toLowerCase()]
  }
}

// 获取题目详情
const fetchProblemDetail = async () => {
  loading.value = true
  try {
    const problemId = String(route.params.id || '')
    if (!problemId) {
      ElMessage.error('题目ID不能为空')
      return
    }
    
    // 调用store中的方法获取题目详情
    const problem = await problemsStore.fetchProblemById(problemId)
    currentProblem.value = problem
    
    // 处理examples字段
    if (currentProblem.value && !currentProblem.value.examples) {
      // 如果接口返回的数据没有examples字段，则从sample_input和sample_output构造
      currentProblem.value.examples = []
      if (currentProblem.value.sample_input && currentProblem.value.sample_output) {
        currentProblem.value.examples.push({
          input: currentProblem.value.sample_input,
          output: currentProblem.value.sample_output,
          explanation: currentProblem.value.hint || ''
        })
      }
    }
    
    // 处理constraints字段
    if (currentProblem.value) {
      // 确保constraints字段存在
      currentProblem.value.constraints = []
      if (currentProblem.value.input) {
        // 将input字段按行分割，每行作为一个约束条件
        currentProblem.value.constraints = currentProblem.value.input.split('\n').filter(line => line.trim() !== '')
      }
    }
    
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取题目详情失败')
  } finally {
    loading.value = false
  }
}

// 事件处理方法
const handleGoBack = () => {
  // 检查是否有任务相关参数，如果有则传递给题目详情页面
  if (taskParams.value && taskParams.value.task_id && taskParams.value.clazz_id) {
    router.push({
      path: `/problems/${route.params.id}`,
      query: {
        task_id: taskParams.value.task_id,
        clazz_id: taskParams.value.clazz_id
      }
    })
  } else {
    router.push(`/problems/${route.params.id}`)
  }
}

// 切换到详情视图
const switchToDetailView = () => {
  editorView.value = 'detail'
  showDetailTab.value = true // 显示详情tab
}

// 处理提交记录点击事件
const handleSubmissionClick = async (submission: SubmitDetail) => {
  console.log('提交记录详情:', submission)
  // 存储提交详情并切换到详情视图
  currentSubmitDetail.value = submission
  editorView.value = 'detail' // 切换到详情视图
  showDetailTab.value = true // 显示详情tab
}

const handleEditorReady = (editor: monaco.editor.IStandaloneCodeEditor) => {
  editorInstance = editor
}

const handleResetCode = () => {
  // 如果当前代码为空，直接返回
  if (currentCode.value.trim() === '') {
    ElMessage.info('当前代码已为空')
    return
  }
  
  // 弹出确认对话框
  ElMessageBox.confirm(
    '确定要清空当前代码吗？此操作不可撤销。',
    '重置代码确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 用户确认，清空代码
    currentCode.value = ''
    ElMessage.success('代码已重置')
  }).catch(() => {
    // 用户取消，不做任何操作
    ElMessage.info('已取消重置操作')
  })
}

const handleToggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
}

// 拖拽调节相关方法
const startResize = (e: MouseEvent) => {
  isResizing.value = true
  const startY = e.clientY
  const startHeight = resultHeight.value
  
  const handleMouseMove = (e: MouseEvent) => {
    const deltaY = e.clientY - startY
    const newHeight = startHeight - deltaY // 向上拖拽增加结果面板高度
    
    // 限制在最小和最大高度之间
    resultHeight.value = Math.max(minResultHeight, Math.min(maxResultHeight, newHeight))
  }
  
  const handleMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = 'ns-resize'
  document.body.style.userSelect = 'none'
}

// 初始化容器高度
const initContainerHeight = () => {
  const editorContainer = document.querySelector('.editor-container')
  if (editorContainer) {
    containerHeight.value = editorContainer.clientHeight
  }
}

// 窗口大小变化时更新容器高度
const handleResize = () => {
  initContainerHeight()
}

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    initContainerHeight()
  })
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const handleRunCode = async () => {
  if (!editorInstance || !currentProblem.value) return
  
  running.value = true
  executeResult.value = null
  activeTab.value = 'result'
  
  try {
    // 直接调用API函数
    const payload: RunCodePayload = {
      code: currentCode.value,
      language: convertLanguageForApi(selectedLanguage.value),
      input: currentProblem.value?.sample_input || ''
    }
    
    const response = await runProblemCode(currentProblem.value.id, payload)
    const result = response
    
    // 直接使用API响应，因为它已经符合RunCodeResult类型
    executeResult.value = result
    
    if (result.success) {
      ElMessage.success('代码运行成功')
    } else {
      ElMessage.warning('代码运行完成，但存在问题')
    }
  } catch (error: unknown) {
    executeResult.value = {
      status: 'system_error',
      success: false,
      output: '',
      error: error instanceof Error ? error.message : '网络错误或服务器异常'
    }
    ElMessage.error('运行代码失败')
  } finally {
    running.value = false
  }
}

const handleSubmitCode = async () => {
  if (!editorInstance || !currentProblem.value || !userStore.token) return
  
  submitting.value = true
  submitResult.value = null
  activeTab.value = 'submission'
  
  // 清空之前的WebSocket消息日志
  websocketMessages.value = []
  
  try {
    // 1. 调用提交接口
    const payload: SubmitPayload = {
      problem_id: currentProblem.value.id,
      code: currentCode.value,
      language: convertLanguageForApi(selectedLanguage.value)
    }
    
    const response = await createSubmit(payload)
    
    // 保存提交ID
    currentSubmitId.value = response.submit_id
    
    // 显示提交成功消息
    ElMessage.success(response.message)
    
    // 刷新提交列表
    if (problemPanelRef.value) {
      problemPanelRef.value.fetchSubmissions()
    }
    
    // 初始化提交结果状态
    submitResult.value = {
      success: false,
      status: 'pending',
      runtime: 0,
      memory: 0,
      passedCount: 0,
      totalCount: 0,
      test_results: [],
      compile_error: '',
      runtime_error: '',
      submission_id: response.submit_id,
      message: '正在评测中...'
    }
    
    // 2. 建立WebSocket连接
    const token = getAuthToken()
    await connectWebSocket(response.submit_id, token)
    
  } catch (error: any) {
    submitResult.value = {
      success: false,
      status: 'system_error',
      message: error?.message || '网络错误或服务器异常',
      submission_id: null
    }
    ElMessage.error('提交代码失败')
    submitting.value = false
  }
}

// WebSocket连接处理函数
const connectWebSocket = async (submitId: string, token: string) => {
  // 关闭之前的连接（如果存在）
  if (submitWebSocket) {
    submitWebSocket.close()
  }
  
  // 创建新的WebSocket连接
  submitWebSocket = createSubmitWebSocket(submitId, token)
  
  // 设置事件回调
  submitWebSocket.onMessage(handleWebSocketMessage)
  submitWebSocket.onError(() => {
    ElMessage.error('WebSocket连接失败')
    submitting.value = false
  })
  submitWebSocket.onClose((event: CloseEvent) => {
    if (submitting.value && event.code !== 1000) {
      ElMessage.warning('WebSocket连接已断开')
      submitting.value = false
    }
  })
  
  // 建立连接
  await submitWebSocket.connect()
}

// WebSocket消息处理函数
const handleWebSocketMessage = async (message: WebSocketMessage) => {
  const data = typeof message.data === 'string' ? JSON.parse(message.data) : message.data
  
  // 将消息添加到消息日志中
  websocketMessages.value.push({
    type: message.type,
    data: data,
    timestamp: Date.now()
  })
  
  if (!submitResult.value) {
    return
  }
  
  switch (message.type) {
    case 'status_update':
      if (data) {
        submitResult.value.status = data.status || 'pending'
        submitResult.value.message = data.message || '正在评测中...'
        
        // 提取result字段中的统计信息
        if (data.result) {
          submitResult.value.runtime = data.result.time_used || 0
          submitResult.value.memory = data.result.memory_used || 0
          submitResult.value.passedCount = data.result.passed_cases || 0
          submitResult.value.totalCount = data.result.total_cases || 0
        }
        
        // 检查状态，如果不是pending或running，则关闭WebSocket连接
        const currentStatus = data.status
        if (currentStatus && currentStatus !== 'pending' && currentStatus !== 'running') {
          
          // 根据状态显示相应的消息
          if (currentStatus === 'accepted') {
            ElMessage.success('代码提交成功，通过所有测试用例！')
            submitResult.value.message = '恭喜！通过所有测试用例'
            submitResult.value.success = true
            
            // 只有从任务详情跳转过来的才调用完成任务接口
            if (taskParams.value && taskParams.value.task_id && taskParams.value.clazz_id) {
              try {
                await taskStore.finish({
                  task_id: taskParams.value.task_id!,
                  clazz_id: taskParams.value.clazz_id!,
                  relation_id: taskParams.value.relation_id!
                })
                ElMessage.success('任务已完成！')
              } catch (error) {
                console.error('调用完成任务接口失败:', error)
                // 不影响主流程，只记录错误
              }
            }
          } else {
            // 其他状态（wrong_answer, time_limit, memory_limit, compile_error, runtime_error, system_error等）
            const statusMessages: Record<string, string> = {
              'wrong_answer': '答案错误',
              'time_limit': '超时',
              'memory_limit': '内存超限',
              'compile_error': '编译错误',
              'runtime_error': '运行错误',
              'system_error': '系统错误'
            }
            const statusText = statusMessages[currentStatus] || '评测失败'
            ElMessage.error(`代码提交失败：${statusText}`)
            submitResult.value.message = data.message || statusText
            submitResult.value.success = false
          }
          
          // 关闭WebSocket连接
          if (submitWebSocket) {
            submitWebSocket.close()
            submitWebSocket = null
          }
          submitting.value = false
          
          // 判题完成后刷新提交列表
          if (problemPanelRef.value) {
            problemPanelRef.value.fetchSubmissions()
          }
        }
      }
      break
      
    case 'test_case_result':
      if (data?.test_results) {
        submitResult.value.test_results = data.test_results
        const passedCount = data.test_results.filter((test: TestCaseResult) => test.status === 'passed').length
        submitResult.value.passedCount = passedCount
        submitResult.value.totalCount = data.test_results.length
      }
      break
      
    case 'final_result':
      if (data) {
        // 只更新数据，不显示消息和关闭连接（这些已在status_update中处理）
        submitResult.value.runtime = data.runtime || data.time_used || submitResult.value.runtime || 0
        submitResult.value.memory = data.memory || data.memory_used || submitResult.value.memory || 0
        submitResult.value.compile_error = data.compile_error || ''
        submitResult.value.runtime_error = data.runtime_error || ''
      }
      
      break
      
    case 'error':
      submitResult.value.success = false
      submitResult.value.message = data?.message || '评测过程中发生错误'
      submitResult.value.status = 'system_error'
      ElMessage.error('评测过程中发生错误')
      
      // 错误情况下立即关闭WebSocket连接
      if (submitWebSocket) {
        submitWebSocket.close()
        submitWebSocket = null
      }
      submitting.value = false
      
      // 错误情况下也刷新提交列表
      if (problemPanelRef.value) {
        problemPanelRef.value.fetchSubmissions()
      }
      break
      
    default:
      break
  }
}

// 处理评测错误
// 监听语言变化
watch(selectedLanguage, (newLanguage, oldLanguage) => {
  if (!oldLanguage) return // 初始化时不执行
  if (isLanguageChanging) return // 如果正在处理语言变化，避免重复触发
  
  // ACM模式下，如果用户已经编写了代码，询问是否在切换语言时清空
  if (currentCode.value.trim() !== '') {
    ElMessageBox.confirm(
      '切换语言将清空当前代码，是否继续？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      // 用户确认，清空代码并加载新语言的模板（如果有）
      loadTemplateForLanguage(newLanguage)
    }).catch(() => {
      // 用户取消，恢复之前的语言选择
      isLanguageChanging = true // 设置标志，防止watch重复触发
      selectedLanguage.value = oldLanguage
      // 使用nextTick确保DOM更新后再重置标志
      nextTick(() => {
        isLanguageChanging = false
      })
    })
  } else {
    // 当前代码为空，直接加载新语言的模板（如果有）
    loadTemplateForLanguage(newLanguage)
  }
})

// 监听editorView变化，动态调整tab指示条位置
watch(editorView, () => {
  nextTick(() => {
    updateTabIndicatorPosition()
  })
})

// 更新tab指示条位置的函数
const updateTabIndicatorPosition = () => {
  const activeTab = document.querySelector('.code-title.tab.active') as HTMLElement | null
  const indicator = document.querySelector('.tab-indicator') as HTMLElement | null
  
  if (activeTab && indicator) {
    const tabRect = activeTab.getBoundingClientRect()
    const containerRect = activeTab.parentElement?.getBoundingClientRect()
    
    if (containerRect) {
      const left = tabRect.left - containerRect.left
      indicator.style.width = `${tabRect.width}px`
      indicator.style.left = `${left}px`
    }
  }
}

// 在组件挂载时更新一次位置
onMounted(() => {
  nextTick(() => {
    updateTabIndicatorPosition()
  })
  
  // 获取任务相关参数
  const taskId = route.query.task_id as string
  const clazzId = route.query.clazz_id as string
  
  // 只有当存在task_id和clazz_id时，才认为是从任务详情跳转过来的
  if (taskId && clazzId) {
    taskParams.value = {
      task_id: taskId,
      clazz_id: clazzId,
      relation_id: String(route.params.id || '') // 使用当前题目ID作为relation_id
    }
  }
  
  // 获取题目详情
  fetchProblemDetail()
  
  // 初始化代码
  initCode()
})

// 组件销毁时清理WebSocket连接
onBeforeUnmount(() => {
  if (submitWebSocket) {
    submitWebSocket.close()
    submitWebSocket = null
  }
})

// 生命周期
onMounted(async () => {
  // 获取任务相关参数
  const taskId = route.query.task_id as string
  const clazzId = route.query.clazz_id as string
  
  // 只有当存在task_id和clazz_id时，才认为是从任务详情跳转过来的
  if (taskId && clazzId) {
    taskParams.value = {
      task_id: taskId,
      clazz_id: clazzId,
      relation_id: String(route.params.id || '') // 使用当前题目ID作为relation_id
    }
  }
  
  // 获取题目详情
  await fetchProblemDetail()
  
  // 初始化代码
  initCode()
})
</script>

<style scoped lang="scss">
.code-editor-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: $bg-secondary;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;

  .editor-header {
    height: 40px;
    background: $bg-secondary;
    border-bottom: 1px solid $border-light;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px;
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      width: 300px;
      cursor: pointer;
    }

    .header-right {
      display: flex;
      align-items: center;
      margin-right: 20px;
    }
  }

  .editor-container-wrapper {
    height: 100%;
    width: 100%;
  }

  .editor-main {
    height: calc(100vh - 60px);
    min-height: 0;
    margin: 0;
    padding: 0;
  }

  .editor-panel {
    padding: 0;
    margin: 0;
    background: $bg-card;
    height: 100%;
  }

  .code-area-header {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    color: $text-primary;
    background: $bg-secondary;
    border-radius: 8px 8px 0 0;
    border-bottom: 1px solid $border-default;
    flex-shrink: 0;
    height: 40px;
    box-sizing: border-box;

    .tabs-container {
      position: relative;
      display: flex;
      align-items: center;
      margin-left: 16px;

      .code-title {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.5px;

        &.tab {
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.3s ease;
          z-index: 1;
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;

          &.active {
            color: $color-primary;
            font-weight: 600;
          }
        }
      }

      .tab-icon {
        width: 1em;
        height: 1em;
        font-size: 14px;
      }

      .tab-indicator {
        position: absolute;
        bottom: 0;
        height: 3px;
        background-color: $color-primary;
        border-radius: 3px;
        transition: all 0.3s ease;
      }
    }
  }

  .editor-container {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    margin: 8px;
    border-radius: 8px;
    overflow: hidden;

    .editor-content-wrapper {
      flex: none;
      overflow: hidden;
      border-bottom: 1px solid $border-default;
    }

    .monaco-wrapper {
      width: 100%;
      height: 100%;
    }

    .result-wrapper {
      flex: none;
      overflow: hidden;
      background: $bg-card;
    }

    .resizer {
      height: 4px;
      background: $border-default;
      cursor: ns-resize;
      position: relative;
      flex: none;
      transition: background-color 0.2s ease;

      &:hover {
        background: $color-primary;
      }

      &.resizing {
        background: $color-primary;
      }

      .resizer-line {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 2px;
        background: $text-tertiary;
        border-radius: 1px;
        transition: all 0.2s ease;
      }

      &:hover .resizer-line,
      &.resizing .resizer-line {
        background: $bg-card;
        width: 60px;
      }
    }
  }
}
</style>
