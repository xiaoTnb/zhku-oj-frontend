<template>
  <div class="submission-detail-wrapper">
    <div class="submission-detail-content">
      <div class="header">
        <h2>提交详情</h2>
        <div class="status-badge" :class="[submissionData.status, getStatusColorClass(submissionData.status || '')]">
            {{ getStatusText(submissionData.status || '') }}
          </div>
      </div>
      
      <div class="info-grid">
        <div class="info-card">
          <h3>基本信息</h3>
          <div class="info-item">
            <span class="label">语言:</span>
            <span class="value" style="font-weight: bold;">{{ submissionData.language || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">提交时间:</span>
            <span class="value">{{ formatDate(submissionData.created_at || '') }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新时间:</span>
            <span class="value">{{ formatDate(submissionData.updated_at || '') }}</span>
          </div>
        </div>
        
        <div class="info-card">
          <h3>执行结果</h3>
          <div class="info-item">
            <span class="label">状态:</span>
            <span class="value" :class="getStatusColorClass(submissionData.result?.status || '')" >
{{ getStatusText(submissionData.result?.status || '') }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">运行时间:</span>
            <span class="value">{{ submissionData.result?.time_used ?? 0 }} ms</span>
          </div>
          <div class="info-item">
            <span class="label">内存使用:</span>
            <span class="value">{{ submissionData.result?.memory_used ?? 0 }} KB</span>
          </div>
          <div class="info-item" v-if="submissionData.result?.compile_error">
            <span class="label">编译错误:</span>
            <span class="value error">{{ submissionData.result?.compile_error || '' }}</span>
          </div>
          <div class="info-item" v-if="submissionData.result?.runtime_error">
            <span class="label">运行时错误:</span>
            <span class="value error">{{ submissionData.result?.runtime_error || '' }}</span>
          </div>
        </div>
      </div>
      
      <div class="code-section">
        <div class="code-header">
          <h3>提交代码</h3>
        </div>
        <div class="code-block-container">
          <el-tooltip :content="copyStatus ? '已复制' : '复制'" placement="top">
            <button class="copy-button" @click="copyCode">
              <el-icon><DocumentCopy /></el-icon>
            </button>
          </el-tooltip>
          <pre class="code-block" :class="{ collapsed: isCodeCollapsed && isCodeLong }"><code>{{ isCodeCollapsed && isCodeLong ? submissionData.code?.split('\n').slice(0, 8).join('\n') : submissionData.code || '' }}</code></pre>
          <div v-if="isCodeLong" class="code-collapse-toggle" @click="toggleCodeCollapse">
            <span>{{ isCodeCollapsed ? '展开全部' : '收起代码' }}</span>
            <el-icon class="toggle-icon" :class="{ rotated: !isCodeCollapsed }">
              <ArrowDown />
            </el-icon>
          </div>
        </div>
      </div>
      
      <div class="test-results">
        <h3>测试结果</h3>
        <div class="test-cases">
          <div 
            v-for="(testResult, index) in submissionData.result?.test_results || []" 
            :key="index" 
            class="test-case"
            :class="testResult?.status"
          >
            <div class="test-case-header">
              <span class="test-case-status" :class="[testResult?.status, getStatusColorClass(testResult?.status || '')]">
                {{ getStatusText(testResult?.status || '') }}
              </span>
            </div>
            <div class="test-case-details">
              <div class="detail-row">
                <span class="label">运行时间:</span>
                <span class="value">{{ testResult?.time_used ?? 0 }} ms</span>
              </div>
              <div class="detail-row">
                <span class="label">内存使用:</span>
                <span class="value">{{ testResult?.memory_used ?? 0 }} KB</span>
              </div>
              <div class="detail-row" v-if="testResult.output !== undefined">
                <span class="label">输出:</span>
                <span class="value">{{ testResult?.output || '' }}</span>
              </div>
              <div class="detail-row" v-if="testResult.expected !== undefined">
                <span class="label">期望:</span>
                <span class="value">{{ testResult?.expected || '' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 提交详情组件
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy, ArrowDown } from '@element-plus/icons-vue'
import type { SubmitDetail } from '@/types/submit'

// 定义组件props
const props = defineProps<{
  submission?: SubmitDetail
}>()

// 响应式变量
const copyStatus = ref(false)
const isCodeCollapsed = ref(true) // 默认折叠
const isCodeLong = ref(false)

// 使用传入的submission数据，如果没有则返回空对象
const submissionData = computed<SubmitDetail>(() => {
  return props.submission || {} as SubmitDetail
})

// 检查代码是否过长需要折叠
    const checkCodeLength = () => {
      const code = submissionData.value.code || ''
      const lines = code.split('\n')
      isCodeLong.value = lines.length > 10 // 超过10行就折叠
      // 如果代码不长，则不折叠
      if (!isCodeLong.value) {
        isCodeCollapsed.value = false
      }
    }

// 在组件挂载时检查代码长度
onMounted(() => {
  checkCodeLength()
})

// 监听submission prop的变化，重新检查代码长度
watch(() => props.submission, () => {
  // 使用nextTick确保DOM更新后再检查代码长度
  nextTick(() => {
    checkCodeLength()
  })
})

// 切换代码折叠状态
const toggleCodeCollapse = () => {
  isCodeCollapsed.value = !isCodeCollapsed.value
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    accepted: '通过',
    wrong_answer: '答案错误',
    time_limit: '超时',
    memory_limit: '内存超限',
    compile_error: '编译错误',
    runtime_error: '运行时错误',
    system_error: '系统错误',
    pending: '等待中',
    running: '运行中',
    passed: '通过',
    failed: '失败'
  }
  return statusMap[status] || status
}

// 获取状态颜色类
const getStatusColorClass = (status: string) => {
  const successStatuses = ['accepted', 'passed']
  const errorStatuses = ['wrong_answer', 'time_limit', 'memory_limit', 'compile_error', 'runtime_error', 'system_error', 'failed']
  const warningStatuses = ['waiting', 'running']
  
  if (successStatuses.includes(status)) {
    return 'status-success'
  } else if (errorStatuses.includes(status)) {
    return 'status-error'
  } else if (warningStatuses.includes(status)) {
    return 'status-warning'
  } else {
    return 'status-default'
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 复制代码到剪贴板
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(submissionData.value.code || '')
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
    console.error('复制失败:', error)
  }
}
</script>

<style scoped lang="scss">
.submission-detail-wrapper {
  width: 100%;
  height: 100%;
  background-color: $bg-secondary;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;

  .submission-detail-content {
    max-width: 1200px;
    margin: 0 auto;
    color: $text-primary;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid $border-default;

      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }

      .status-badge {
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 500;

        &.accepted {
          background-color: rgba($color-primary, 0.06);
          color: $color-primary;
          border: 1px solid $color-primary;
        }

        &.status-success {
          background-color: rgba($color-success, 0.06);
          color: $color-success;
          border: 1px solid $color-success;
        }

        &.status-error {
          background-color: rgba($color-danger, 0.06);
          color: $color-danger;
          border: 1px solid $color-danger;
        }

        &.status-warning {
          background-color: rgba($color-warning, 0.08);
          color: $color-warning;
          border: 1px solid $color-warning;
        }

        &.status-default {
          background-color: $bg-secondary;
          color: $text-tertiary;
          border: 1px solid $border-light;
        }
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;

      .info-card {
        background: $bg-card;
        border-radius: $border-radius-card;
        padding: 20px;
        box-shadow: $shadow-light;

        h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
          color: $text-primary;
        }

        .info-item {
          display: flex;
          margin-bottom: 12px;

          .label {
            width: 100px;
            font-weight: 500;
            color: $text-secondary;
          }

          .value {
            flex: 1;
            color: $text-primary;
            font-size: 18px;

            &.status-success { color: $color-success; }
            &.status-error { color: $color-danger; }
            &.status-warning { color: $color-warning; }
            &.error { color: $color-danger; white-space: pre-wrap; }
          }
        }
      }
    }

    .code-section {
      background: $bg-card;
      border-radius: $border-radius-card;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: $shadow-light;

      h3 {
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 18px;
        color: $text-primary;
      }

      .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .code-block-container {
        position: relative;
        background: $bg-secondary;
        border-radius: 4px;
        padding: 16px;
        overflow-x: auto;
        margin: 0;

        .copy-button {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 6px 12px;
          background-color: transparent;
          color: $text-secondary;
          border: 1px solid $border-light;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0.7;
        }

        &:hover .copy-button {
          opacity: 1;
        }

        .copy-button:hover {
          background-color: $bg-hover;
          color: $text-primary;
          border-color: $border-default;
        }

        .copy-button:active {
          background-color: $bg-secondary;
        }
      }

      .code-block {
        margin: 0;
        padding: 0;
        background: transparent;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;

        &.collapsed {
          max-height: 200px;
          overflow: hidden;
        }
      }

      .code-collapse-toggle {
        text-align: center;
        padding: 10px;
        background-color: rgba($text-primary, 0.03);
        color: $text-secondary;
        cursor: pointer;
        border-radius: 0 0 4px 4px;
        font-size: 14px;
        transition: background-color 0.3s;
        backdrop-filter: blur(2px);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;

        &:hover {
          background-color: rgba($text-primary, 0.06);
        }
      }

      .toggle-icon {
        transition: transform 0.3s ease;

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .test-results {
      background: $bg-card;
      border-radius: $border-radius-card;
      padding: 20px;
      box-shadow: $shadow-light;

      h3 {
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 18px;
        color: $text-primary;
      }

      .test-cases {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .test-case {
          border: 1px solid $border-default;
          border-radius: 6px;
          padding: 16px;

          &.passed,
          &.accepted {
            border-color: rgba($color-success, 0.4);
            background-color: rgba($color-success, 0.06);
          }
          &.failed,
          &.wrong_answer,
          &.time_limit,
          &.memory_limit,
          &.compile_error,
          &.runtime_error,
          &.system_error {
            border-color: rgba($color-danger, 0.3);
            background-color: rgba($color-danger, 0.06);
          }
          &.pending,
          &.running {
            border-color: rgba($color-warning, 0.4);
            background-color: rgba($color-warning, 0.08);
          }

          .test-case-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .test-case-status {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 18px;
              font-weight: 500;

              &.status-success { color: $color-success; }
              &.status-error { color: $color-danger; }
              &.status-warning { color: $color-warning; }
              &.status-default { color: $text-tertiary; }
            }
          }

          .test-case-details {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .detail-row {
              display: flex;

              .label {
                width: 80px;
                font-size: 14px;
                color: $text-secondary;
              }

              .value {
                flex: 1;
                font-size: 14px;
                color: $text-primary;
                word-break: break-all;
              }
            }
          }
        }
      }
    }
  }
}

:global(html.dark) .submission-detail-wrapper {
  background-color: #0d1117;
}
</style>
