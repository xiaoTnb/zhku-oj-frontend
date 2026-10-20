<template>
  <div class="result-panel">
    <el-tabs :model-value="activeTab" @update:model-value="$emit('update:activeTab', $event)" class="result-tabs">
      <el-tab-pane label="运行结果" name="result">
        <div class="result-content">
          <div v-if="!executeResult" class="no-result">
            <el-empty description="点击运行按钮执行代码" />
          </div>
          <div v-else>
            <div v-if="executeResult.success" class="result-success">
              <h4><el-icon color="#67c23a"><Select /></el-icon> 运行成功</h4>
              <div class="result-output">
                <strong>输出:</strong>
                <pre class="output-code">{{ executeResult.output }}</pre>
              </div>
              <div v-if="executeResult.time_used !== undefined" class="result-stats">
                <span>执行用时: {{ executeResult.time_used }}ms</span>
                <span v-if="executeResult.memory_used !== undefined" style="margin-left: 16px;">内存消耗: {{
                  formatMemoryUsage(executeResult.memory_used) }}KB</span>
              </div>
            </div>
            <div v-else class="result-error">
              <h4><el-icon color="#f56c6c">
                  <Close />
                </el-icon>
                {{ executeResult.status === 'compile_error' ? '编译错误' : '运行失败' }}
              </h4>
              <div class="error-message">
                <strong>状态:</strong> {{ getExecuteStatusText(executeResult.status) }}
              </div>
              <div v-if="executeResult.error" class="error-message">
                <strong>错误信息:</strong>
                <pre class="error-code">{{ executeResult.error }}</pre>
              </div>
              <div v-if="executeResult.output" class="error-message">
                <strong>输出:</strong>
                <pre class="output-code">{{ executeResult.output }}</pre>
              </div>
              <div v-if="executeResult.time_used !== undefined || executeResult.memory_used !== undefined"
                class="result-stats">
                <span v-if="executeResult.time_used !== undefined">执行用时: {{ executeResult.time_used }}ms</span>
                <span v-if="executeResult.memory_used !== undefined" style="margin-left: 16px;">内存消耗: {{
                  formatMemoryUsage(executeResult.memory_used) }}KB</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="提交结果" name="submission">
        <div class="result-content">
          <div v-if="!submitResult" class="no-result">
            <el-empty description="点击提交按钮提交代码" />
          </div>
          <div v-else class="submission-container">
            <!-- WebSocket消息日志区域 -->
            <div v-if="websocketMessages && websocketMessages.length > 0" class="websocket-messages-new">
              <el-collapse v-model="activeCollapse" class="message-collapse-new">
                <el-collapse-item name="messages">
                  <template #title>
                    <div class="collapse-title">
                      <span class="title-text">📋 评测日志</span>
                      <span class="message-count">{{ websocketMessages.length }} 条消息</span>
                    </div>
                  </template>
                  <div class="messages-container">
                    <div v-for="(message, index) in websocketMessages" :key="index" class="message-item"
                      :class="`message-${message.type}`">
                      <div class="message-header">
                        <span class="message-index">#{{ index + 1 }}</span>
                        <!-- <span class="message-type">{{ message.type }}</span> -->
                        <span class="message-type">{{ getMessageSummary(message) }}</span>
                        <!-- <span class="message-summary">{{ getMessageSummary(message) }}</span> -->
                        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                      </div>
                      <div class="message-content">
                        <div class="message-details">
                          <div v-if="message.type === 'status_update'" class="status-details">
                            <div class="detail-row">
                              <span class="detail-label">状态:</span>
                              <span class="detail-value" :class="`status-${message.data.status}`">{{
                                getStatusText(message.data.status) }}</span>
                            </div>
                            <div v-if="message.data.message" class="detail-row">
                              <span class="detail-label">消息:</span>
                              <span class="detail-value">{{ message.data.message }}</span>
                            </div>
                            <div v-if="message.data.result" class="result-stats">
                              <div class="stats-grid">
                                <div v-if="message.data.result.passed_cases !== undefined" class="stat-item-small">
                                  <span class="stat-label-small">通过用例</span>
                                  <span class="stat-value-small">{{ message.data.result.passed_cases }}/{{
                                    message.data.result.total_cases }}</span>
                                </div>
                                <div v-if="message.data.result.time_used !== undefined" class="stat-item-small">
                                  <span class="stat-label-small">用时</span>
                                  <span class="stat-value-small">{{ message.data.result.time_used }}ms</span>
                                </div>
                                <div v-if="message.data.result.memory_used !== undefined" class="stat-item-small">
                                  <span class="stat-label-small">内存</span>
                                  <span class="stat-value-small">{{ formatMemoryUsage(message.data.result.memory_used)
                                    }}KB</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div v-else class="raw-data">
                            <pre class="message-data">{{ JSON.stringify(message.data, null, 2) }}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
            <!-- 提交成功 -->
            <div v-if="submitResult.status === 'accepted'" class="result-success-new">
              <div class="success-banner">
                <div class="success-icon-wrapper">
                  <el-icon color="#52c41a" size="32"><Select /></el-icon>
                </div>
                <div class="success-content">
                  <h2 class="success-title">🎉 恭喜通过！</h2>
                  <p class="success-subtitle">您的代码已通过所有测试用例</p>
                </div>
              </div>

              <div class="performance-summary">
                <div class="summary-card primary">
                  <div class="card-header">
                    <span class="card-title">执行性能</span>
                  </div>
                  <div class="performance-grid">
                    <div class="perf-item">
                      <div class="perf-icon">⏱️</div>
                      <div class="perf-content">
                        <div class="perf-value">{{ submitResult.runtime || 0 }}ms</div>
                        <div class="perf-label">执行时间</div>
                      </div>
                    </div>
                    <div class="perf-item">
                      <div class="perf-icon">💾</div>
                      <div class="perf-content">
                        <div class="perf-value">{{ formatMemoryUsage(submitResult.memory) }}KB</div>
                        <div class="perf-label">内存使用</div>
                      </div>
                    </div>
                    <div class="perf-item">
                      <div class="perf-icon">✅</div>
                      <div class="perf-content">
                        <div class="perf-value">{{ submitResult.passedCount || 0 }}/{{ submitResult.totalCount || 0 }}
                        </div>
                        <div class="perf-label">通过用例</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 提交中或运行中 -->
            <div v-else-if="submitResult.status === 'pending' || submitResult.status === 'running'"
              class="result-pending-new">
              <div class="pending-banner">
                <div class="pending-animation">
                  <el-icon color="#1890ff" size="28">
                    <Loading />
                  </el-icon>
                </div>
                <div class="pending-content">
                  <h2 class="pending-title">
                    {{ submitResult.status === 'pending' ? '⏳ 等待评测' : '🔄 正在评测' }}
                  </h2>
                  <p class="pending-subtitle">
                    {{ submitResult.message || '您的代码正在评测队列中，请稍候...' }}
                  </p>
                </div>
              </div>

              <!-- 评测进度 -->
              <div v-if="submitResult.totalCount && submitResult.totalCount > 0" class="progress-card">
                <div class="card-header">
                  <span class="card-title">评测进度</span>
                  <span class="progress-percentage">{{ Math.round(((submitResult.passedCount || 0) /
                    submitResult.totalCount) * 100) }}%</span>
                </div>

                <div class="progress-details">
                  <div class="progress-info-new">
                    <span class="progress-text">测试用例: {{ submitResult.passedCount || 0 }}/{{ submitResult.totalCount
                      }}</span>
                  </div>
                  <el-progress
                    :percentage="Math.round(((submitResult.passedCount || 0) / submitResult.totalCount) * 100)"
                    :stroke-width="10" :show-text="false"
                    :color="getProgressColor(submitResult.passedCount || 0, submitResult.totalCount)"
                    class="custom-progress" />
                </div>

                <div v-if="submitResult.runtime || submitResult.memory" class="current-performance">
                  <div class="perf-grid">
                    <div v-if="submitResult.runtime" class="mini-perf-item">
                      <span class="mini-perf-icon">⏱️</span>
                      <span class="mini-perf-value">{{ submitResult.runtime }}ms</span>
                    </div>
                    <div v-if="submitResult.memory" class="mini-perf-item">
                      <span class="mini-perf-icon">💾</span>
                      <span class="mini-perf-value">{{ formatMemoryUsage(submitResult.memory) }}KB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 编译错误 -->
            <div v-else-if="submitResult.status === 'compile_error'" class="result-error">
              <div class="error-header">
                <el-icon color="#f56c6c" size="24">
                  <Close />
                </el-icon>
                <h3>编译错误</h3>
              </div>
              <div class="error-details">
                <pre class="error-code">{{ submitResult.compile_error || '编译失败，请检查代码语法' }}</pre>
              </div>
            </div>

            <!-- 运行时错误 -->
            <div v-else-if="submitResult.status === 'runtime_error'" class="result-error">
              <div class="error-header">
                <el-icon color="#f56c6c" size="24">
                  <Close />
                </el-icon>
                <h3>运行时错误</h3>
              </div>
              <div class="error-details">
                <pre class="error-code">{{ submitResult.runtime_error || '程序运行时发生错误' }}</pre>
              </div>
            </div>

            <!-- 其他错误状态 -->
            <div v-else class="result-error-new">
              <div class="error-banner">
                <div class="error-icon-wrapper">
                  <el-icon color="#ff4d4f" size="32">
                    <Close />
                  </el-icon>
                </div>
                <div class="error-content">
                  <h2 class="error-title">❌ {{ getStatusText(submitResult.status) }}</h2>
                  <p v-if="submitResult.message" class="error-subtitle">{{ submitResult.message }}</p>
                </div>
              </div>

              <!-- 评测统计信息 -->
              <div v-if="hasExecutionStats(submitResult)" class="execution-stats">
                <h4>评测统计</h4>
                <el-row :gutter="16">
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-label">通过用例</div>
                      <div class="stat-value"
                        :class="getPassRateClass(submitResult.passedCount, submitResult.totalCount)">
                        {{ submitResult.passedCount || 0 }}/{{ submitResult.totalCount || 0 }}
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-label">执行用时</div>
                      <div class="stat-value">{{ submitResult.runtime || 0 }}ms</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-label">内存消耗</div>
                      <div class="stat-value">{{ formatMemoryUsage(submitResult.memory) }}KB</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-label">评测状态</div>
                      <div class="stat-value status-badge" :class="`status-${submitResult.status}`">
                        {{ getStatusText(submitResult.status) }}
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <!-- 失败用例详情 -->
              <div class="error-details" v-if="submitResult.failedCase">
                <div class="failed-case">
                  <h4>错误用例详情:</h4>
                  <div class="case-content">
                    <div class="case-item">
                      <strong>输入:</strong>
                      <pre class="case-code">{{ submitResult.failedCase.input }}</pre>
                    </div>
                    <div class="case-item">
                      <strong>期望输出:</strong>
                      <pre class="case-code expected">{{ submitResult.failedCase.expected }}</pre>
                    </div>
                    <div class="case-item">
                      <strong>实际输出:</strong>
                      <pre class="case-code actual">{{ submitResult.failedCase.actual }}</pre>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 系统错误的额外提示 -->
              <div v-if="submitResult.status === 'system_error'" class="system-error-tips">
                <el-alert title="系统错误提示" type="warning" :closable="false" show-icon>
                  <template #default>
                    <p>遇到系统错误，可能的原因：</p>
                    <ul>
                      <li>评测服务器暂时不可用</li>
                      <li>代码执行超出系统限制</li>
                      <li>网络连接异常</li>
                    </ul>
                    <p>建议稍后重试，或联系管理员。</p>
                  </template>
                </el-alert>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select, Close, Loading, Warning } from '@element-plus/icons-vue'
import type { RunCodeResult } from '@/types/problem'
import type { SubmitDetail, SubmitResult } from '@/types/submit'

// WebSocket消息接口
interface WebSocketMessageLog {
  type: string
  data: any
  timestamp: number
}

interface Props {
  activeTab: string
  executeResult: RunCodeResult | null
  submitResult: SubmitResult | null
  websocketMessages?: WebSocketMessageLog[]
}

defineProps<Props>()

// 折叠面板状态 - 默认收起
const activeCollapse = ref([])

defineEmits<{
  'update:activeTab': [value: string]
}>()

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'wrong_answer': '解答错误',
    'time_limit': '超时',
    'memory_limit': '内存超限',
    'runtime_error': '运行时错误',
    'compile_error': '编译错误',
    'system_error': '系统错误',
    'pending': '等待评测',
    'running': '评测中',
    'accepted': '通过'
  }
  return statusMap[status] || '未知状态'
}

// 获取运行状态文本
const getExecuteStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'compile_error': '编译错误',
    'runtime_error': '运行时错误',
    'time_limit': '超时',
    'memory_limit': '内存超限',
    'system_error': '系统错误',
    'success': '运行成功'
  }
  return statusMap[status] || status
}

// 将字节转换为KB，保留1位小数
const formatMemoryUsage = (bytes: number | undefined) => {
  if (bytes === undefined || bytes === null) return '0'
  const kb = bytes / 1024
  return kb.toFixed(1)
}

// 格式化时间戳
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const timeString = date.toLocaleTimeString('zh-CN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  // 手动添加毫秒
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0')
  return `${timeString}.${milliseconds}`
}

// 检查是否有执行统计信息
const hasExecutionStats = (result: SubmitResult) => {
  return result && (
    result.passedCount !== undefined || 
    result.totalCount !== undefined || 
    result.runtime !== undefined || 
    result.memory !== undefined
  )
}

// 获取通过率样式类
const getPassRateClass = (passed: number | undefined, total: number | undefined) => {
  if (!passed || !total) return 'pass-rate-none'
  const rate = passed / total
  if (rate === 1) return 'pass-rate-full'
  if (rate >= 0.8) return 'pass-rate-high'
  if (rate >= 0.5) return 'pass-rate-medium'
  return 'pass-rate-low'
}

// 获取进度条颜色
const getProgressColor = (passed: number, total: number): string => {
  const rate = passed / total
  if (rate === 1) return '#52c41a' // 绿色 - 全部通过
  if (rate >= 0.8) return '#1890ff' // 蓝色 - 大部分通过
  if (rate >= 0.5) return '#faad14' // 橙色 - 一半通过
  return '#ff4d4f' // 红色 - 少数通过
}

// 获取消息摘要
const getMessageSummary = (message: WebSocketMessageLog) => {
  switch (message.type) {
    case 'status_update':
      if (message.data.result) {
        return `${getStatusText(message.data.status)} - ${message.data.result.passed_cases || 0}/${message.data.result.total_cases || 0} 用例`
      }
      return `${getStatusText(message.data.status)} - ${message.data.message || ''}`
    case 'test_case_result':
      return `测试用例结果`
    case 'final_result':
      return `最终结果 - ${getStatusText(message.data.status)}`
    case 'error':
      return `错误 - ${message.data.message || '未知错误'}`
    default:
      return '未知消息类型'
  }
}
</script>

<style scoped lang="scss">
.result-panel {
  height: 100%;
  padding: 0 10px;
  border-top: 1px solid $border-default;
  box-sizing: border-box;

  .result-tabs {
    height: 100%;

    :deep(.el-tabs__content) {
      height: calc(100% - 40px);
      padding: 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }

  .result-content {
    height: 100%;
    padding: 16px;
    padding-top: 0;
    overflow-y: auto;

    .no-result {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .result-success h4,
    .result-error h4 {
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .result-success h4 {
      color: $color-success;
    }

    .result-error h4 {
      color: $color-danger;
    }

    .result-output,
    .error-message {
      margin-bottom: 12px;
    }

    .output-code,
    .error-code {
      background-color: $bg-secondary;
      padding: 12px;
      border-radius: $border-radius-card;
      margin: 8px 0 0 0;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      color: $text-primary;
      border: 1px solid $border-light;
      white-space: pre-wrap;
    }

    .error-code {
      color: $color-danger;
      background-color: rgba($color-danger, 0.06);
      border-color: rgba($color-danger, 0.3);
    }

    .result-stats {
      color: $text-secondary;
      font-size: 13px;
    }

    .submission-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .result-success-new {
      background: linear-gradient(135deg, rgba($color-success, 0.08) 0%, rgba($color-primary, 0.06) 100%);
      border-radius: 12px;
      padding: 8px 24px;
      border: 1px solid rgba($color-success, 0.4);

      .success-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 6px;
      }

      .success-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        background: rgba($color-success, 0.08);
        border-radius: 50%;
        border: 2px solid $color-success;
      }

      .success-content {
        flex: 1;
      }

      .success-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: $text-primary;
      }

      .success-subtitle {
        margin: 0;
        font-size: 16px;
        color: $text-secondary;
      }

      .performance-summary {
        margin-top: 10px;
      }

      .summary-card {
        background: $bg-card;
        border-radius: $border-radius-card;
        padding: 20px;
        border: 1px solid rgba($color-success, 0.3);
        box-shadow: $shadow-light;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .card-title {
            font-size: 16px;
            font-weight: 600;
            color: $text-primary;
          }
        }

        .performance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 20px;

          .perf-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: $bg-secondary;
            border-radius: $border-radius-card;
            border: 1px solid $border-light;

            .perf-icon {
              font-size: 20px;
            }

            .perf-content {
              flex: 1;
            }

            .perf-value {
              font-size: 18px;
              font-weight: 600;
              color: $text-primary;
              margin-bottom: 4px;
            }

            .perf-label {
              font-size: 12px;
              color: $text-tertiary;
            }
          }
        }
      }
    }

    .result-pending-new {
      background: linear-gradient(135deg, rgba($color-primary, 0.08) 0%, rgba($color-primary, 0.06) 100%);
      border-radius: 12px;
      padding: 24px;
      border: 1px solid rgba($color-primary, 0.4);

      .pending-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;

        .pending-animation {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: rgba($color-primary, 0.08);
          border-radius: 50%;
          border: 2px solid $color-primary;
          animation: pulse 2s infinite;
        }
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      .pending-content {
        flex: 1;

        .pending-title {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: $text-primary;
        }

        .pending-subtitle {
          margin: 0;
          font-size: 16px;
          color: $text-secondary;
        }
      }

      .progress-card {
        background: $bg-card;
        border-radius: $border-radius-card;
        padding: 20px;
        border: 1px solid $border-light;
        box-shadow: $shadow-light;

        .progress-details {
          margin-bottom: 16px;
        }

        .progress-info-new {
          margin-bottom: 12px;
        }

        .progress-text {
          font-size: 14px;
          font-weight: 500;
          color: $text-primary;
        }

        .progress-percentage {
          font-size: 16px;
          font-weight: 600;
          color: $color-primary;
        }

        .custom-progress {
          margin-bottom: 16px;
        }

        .current-performance {
          padding-top: 16px;
          border-top: 1px solid $border-light;

          .perf-grid {
            display: flex;
            gap: 16px;
            justify-content: center;

            .mini-perf-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background: $bg-secondary;
              border-radius: 6px;
              border: 1px solid $border-light;

              .mini-perf-icon {
                font-size: 16px;
              }

              .mini-perf-value {
                font-size: 14px;
                font-weight: 500;
                color: $text-primary;
              }
            }
          }
        }
      }
    }

    .result-error-new {
      background: linear-gradient(135deg, rgba($color-danger, 0.06) 0%, rgba($color-danger, 0.05) 100%);
      border-radius: 12px;
      padding: 24px;
      border: 1px solid rgba($color-danger, 0.3);

      .error-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;

        .error-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: rgba($color-danger, 0.06);
          border-radius: 50%;
          border: 2px solid $color-danger;
        }

        .error-content {
          flex: 1;

          .error-title {
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: 600;
            color: $text-primary;
          }

          .error-subtitle {
            margin: 0;
            font-size: 16px;
            color: $text-secondary;
          }
        }
      }
    }

    .websocket-messages-new {
      margin-top: 0;

      .message-collapse-new {
        border: 1px solid $border-light;
        border-radius: $border-radius-card;
        overflow: hidden;
      }

      .collapse-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding-right: 16px;

        .title-text {
          font-size: 16px;
          font-weight: 500;
          color: $text-primary;
        }

        .message-count {
          font-size: 12px;
          color: $text-tertiary;
          padding: 2px 8px;
          border-radius: 10px;
        }
      }
    }

    .result-pending {
      text-align: center;
      padding: 20px;

      .pending-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 16px;

        h3 {
          margin: 0;
          color: $color-primary;
          font-size: 18px;
        }
      }

      .progress-section {
        margin: 20px 0;
        padding: 16px;
        background-color: $bg-secondary;
        border-radius: 6px;
        border: 1px solid $border-light;
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .progress-text {
        font-size: 14px;
        font-weight: 500;
        color: $text-primary;
      }

      .progress-percentage {
        font-size: 14px;
        font-weight: 600;
        color: $color-primary;
      }

      .current-stats {
        margin-top: 12px;
        font-size: 12px;
        color: $text-secondary;
        text-align: center;
      }

      .pending-description p {
        margin: 0;
        color: $text-secondary;
        font-size: 14px;
      }
    }

    .success-header,
    .error-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
      }
    }

    .success-header h3 {
      color: $color-success;
    }

    .error-header h3 {
      color: $color-danger;
    }

    .submission-stats {
      margin-top: 16px;
    }

    .stat-card {
      text-align: center;
      padding: 16px;
      background: $bg-secondary;
      border-radius: $border-radius-card;
    }

    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
      color: $text-secondary;
    }

    .failed-case {
      background: rgba($color-danger, 0.06);
      border: 1px solid rgba($color-danger, 0.3);
      border-radius: $border-radius-card;
      padding: 16px;

      h4 {
        margin: 0 0 12px 0;
        color: $color-danger;
        font-size: 14px;
      }

      .case-content {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .case-item strong {
          color: $text-primary;
          font-size: 13px;
        }

        .case-code {
          background-color: $bg-card;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 4px 0 0 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          border: 1px solid $border-light;

          &.expected {
            color: $color-success;
            background-color: rgba($color-success, 0.06);
            border-color: rgba($color-success, 0.3);
          }

          &.actual {
            color: $color-danger;
            background-color: rgba($color-danger, 0.06);
            border-color: rgba($color-danger, 0.3);
          }
        }
      }
    }

    .websocket-messages {
      margin-bottom: 20px;

      .message-collapse {
        border: 1px solid $border-default;
        border-radius: $border-radius-card;

        :deep(.el-collapse-item__header) {
          background-color: $bg-secondary;
          padding: 12px 16px;
          font-weight: 500;
          color: $text-primary;
        }

        :deep(.el-collapse-item__content) {
          padding: 0;
        }
      }

      .messages-container {
        max-height: 300px;
        overflow-y: auto;
        background-color: $bg-secondary;
      }

      .message-item {
        border-bottom: 1px solid $border-default;
        padding: 12px 16px;
        background-color: $bg-card;

        &:last-child {
          border-bottom: none;
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 13px;

          .message-index {
            background-color: $color-primary;
            color: #ffffff;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 500;
            min-width: 30px;
            text-align: center;
          }

          .message-type {
            background-color: rgba($color-primary, 0.08);
            color: $color-primary;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 500;
          }

          .message-summary {
            color: $text-secondary;
            font-size: 12px;
            flex: 1;
            margin-left: 8px;
          }

          .message-time {
            color: $text-tertiary;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            margin-left: auto;
            font-size: 11px;
          }
        }

        .message-content {
          margin-top: 8px;
        }

        .message-details {
          margin-top: 8px;

          .status-details {
            background-color: $bg-secondary;
            border: 1px solid $border-light;
            border-radius: 4px;
            padding: 12px;

            .detail-row {
              display: flex;
              align-items: center;
              margin-bottom: 8px;

              &:last-child {
                margin-bottom: 0;
              }

              .detail-label {
                font-weight: 500;
                color: $text-secondary;
                min-width: 50px;
                font-size: 12px;
              }

              .detail-value {
                color: $text-primary;
                font-size: 12px;
                margin-left: 8px;
              }
            }
          }

          .result-stats {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid $border-light;

            .stats-grid {
              display: flex;
              gap: 16px;
              flex-wrap: wrap;

              .stat-item-small {
                display: flex;
                flex-direction: column;
                align-items: center;
                min-width: 60px;

                .stat-label-small {
                  font-size: 10px;
                  color: $text-tertiary;
                  margin-bottom: 2px;
                }

                .stat-value-small {
                  font-size: 12px;
                  font-weight: 600;
                  color: $text-primary;
                }
              }
            }
          }

          .raw-data .message-data {
            background-color: $bg-secondary;
            border: 1px solid $border-light;
            border-radius: 4px;
            padding: 8px 12px;
            margin: 0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
            color: $text-primary;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
          }
        }
      }
    }

    .error-message-section {
      margin: 16px 0;
      padding: 12px 16px;
      background-color: rgba($color-danger, 0.06);
      border: 1px solid rgba($color-danger, 0.3);
      border-radius: 6px;

      .error-message-content {
        display: flex;
        align-items: center;
        gap: 8px;
        color: $color-danger;
        font-weight: 500;
      }
    }

    .execution-stats {
      margin: 20px 0;
      padding: 16px;
      background-color: $bg-secondary;
      border: 1px solid $border-default;
      border-radius: $border-radius-card;

      h4 {
        margin: 0 0 16px 0;
        color: $text-primary;
        font-size: 16px;
        font-weight: 600;
      }

      .stat-item {
        text-align: center;
        padding: 12px 8px;

        .stat-label {
          font-size: 12px;
          color: $text-tertiary;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: $text-primary;
        }
      }
    }

    .pass-rate-full { color: $color-success; }
    .pass-rate-high { color: $color-warning; }
    .pass-rate-medium { color: $color-warning; }
    .pass-rate-low { color: $color-danger; }
    .pass-rate-none { color: $text-tertiary; }

    .status-badge {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
    }

    .status-system_error,
    .status-wrong_answer,
    .status-runtime_error,
    .status-compile_error {
      background-color: rgba($color-danger, 0.06);
      color: $color-danger;
      border: 1px solid rgba($color-danger, 0.3);
    }

    .status-time_limit,
    .status-memory_limit {
      background-color: rgba($color-warning, 0.08);
      color: $color-warning;
      border: 1px solid rgba($color-warning, 0.4);
    }
  }
}
</style>
