<template>
  <el-aside class="problem-panel">
    <div class="problem-content">
      <el-scrollbar height="100%">
        <div class="problem-inner" v-if="problem" v-loading="loading">
          <!-- 页签 -->
          <div class="tabs">
            <el-tabs v-model="activeTab" class="problem-tabs">
              <el-tab-pane label="题目描述" name="description">
                <!-- 题目标题 -->
                <div class="problem-header">
                  <div class="problem-meta">
                    <h1>{{ (problem.unique_id != null ? problem.unique_id + '.' : '') + problem.title }}</h1>
                    <div class="meta-tags">
                      <el-tag 
                        :type="getDifficultyType(problem.difficulty)" 
                        size="default"
                      >
                        {{ getDifficultyText(problem.difficulty) }}
                      </el-tag>
                      <el-tag 
                        v-for="tag in problem.tags" 
                        :key="tag" 
                        type="info" 
                        effect="plain"
                        class="tag-item"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>
                  </div>
                </div>

                <!-- 题目描述 -->
                <div class="description-section">
                  <div class="problem-description" v-html="formatDescription(problem.description)"></div>
                </div>

                <!-- 示例 -->
                <div class="examples-section">
                  <h3>示例</h3>
                  <div v-for="(example, index) in problem.examples" :key="index" class="example">
                    <h4>示例 {{ index + 1 }}:</h4>
                    <div class="example-content">
                      <div class="example-item">
                        <strong>输入:</strong>
                        <pre class="example-code">{{ example.input }}</pre>
                      </div>
                      <div class="example-item">
                        <strong>输出:</strong>
                        <pre class="example-code">{{ example.output }}</pre>
                      </div>
                      <div v-if="example.explanation" class="example-item">
                        <strong>解释:</strong>
                        <p>{{ example.explanation }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 约束条件 -->
                <div class="constraints-section">
                  <h3>约束条件</h3>
                  <ul class="constraints">
                    <li v-for="(constraint, index) in problem.constraints" :key="index">
                      {{ constraint }}
                    </li>
                  </ul>
                </div>
              </el-tab-pane>
              <el-tab-pane label="提交记录" name="submissions">

                
                <!-- 提交记录区域 -->
                <div class="submissions-section" v-loading="submissionsLoading">
                  <!-- 提交记录头部 -->
                  <div class="submissions-header">
                    <div class="submissions-title">
                      <el-icon class="title-icon"><Document /></el-icon>
                      <span>我的提交记录</span>
                    </div>
                    <div class="submissions-stats" v-if="submissionsData.length > 0">
                      <el-tag type="success" size="small">
                        通过: {{ acceptedCount }}
                      </el-tag>
                      <el-tag type="danger" size="small">
                        失败: {{ failedCount }}
                      </el-tag>
                      <el-tag type="info" size="small">
                        总计: {{ submissionsData.length }}
                      </el-tag>
                    </div>
                  </div>

                  <!-- 空状态 -->
                  <div v-if="submissionsData.length === 0 && !submissionsLoading" class="empty-state">
                    <el-empty 
                      description="暂无提交记录" 
                      :image-size="80"
                    >
                      <template #description>
                        <p class="empty-text">还没有提交记录，快去提交代码吧！</p>
                      </template>
                    </el-empty>
                  </div>

                  <!-- 提交记录列表 -->
                  <div v-else class="submissions-list">
                    <div 
                      v-for="submission in submissionsData" 
                      :key="submission.id" 
                      class="submission-item"
                      @click="handleSubmissionClick(submission)"
                    >
                      <div class="submission-main">
                        <div class="submission-status">
                          <el-tag 
                            :type="getSubmissionStatusType(submission.status)" 
                            :effect="submission.status === 'accepted' ? 'dark' : 'plain'"
                            size="small"
                          >
                            {{ getSubmissionStatusText(submission.status) }}
                          </el-tag>
                        </div>
                        <div class="submission-info">
                          <div class="submission-meta">
                            <span class="submission-id">#{{ submission.id.slice(-8) }}</span>
                            <span class="submission-language">{{ submission.language.toUpperCase() }}</span>
                          </div>
                          <div class="submission-time">
                            {{ formatSubmissionTime(submission.created_at) }}
                          </div>
                        </div>
                        <div class="submission-performance">
                          <div class="performance-item">
                            <span class="performance-label">耗时</span>
                            <span class="performance-value">{{ formatTimeUsed(submission.time_used) }}</span>
                          </div>
                          <div class="performance-item">
                            <span class="performance-label">内存</span>
                            <span class="performance-value">{{ formatMemoryUsed(submission.memory_used) }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="submission-arrow">
                        <el-icon><ArrowRight /></el-icon>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 分页 -->
                  <div class="pagination" v-if="submissionsData.length > 0">
                    <el-pagination
                      small
                      layout="prev, pager, next"
                      :total="submissionTotal"
                      :page-size="submissionPageSize"
                      :current-page="submissionPage"
                      @current-change="handlePageChange"
                      background
                    />
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Problem, Difficulty } from '@/types/problem'
import type { SubmitDetail, SubmitListParams } from '@/types/submit'
import { ArrowLeft, Document, ArrowRight } from '@element-plus/icons-vue'
import { useSubmitStore } from '@/stores/submit'
import { useUserStore } from '@/stores/user'

interface Props {
  problem: Problem | null
  loading: boolean
  switchToDetailView?: () => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  goBack: []
  'submission-click': [SubmitDetail]
}>()

const route = useRoute()
const submitStore = useSubmitStore()
const userStore = useUserStore()

// 页签相关
const activeTab = ref('description')

// 提交记录相关状态
const submissionsLoading = ref(false)
const submissionsData = ref<SubmitDetail[]>([])
const submissionTotal = ref(0)
const submissionPage = ref(1)
const submissionPageSize = ref(10)

// 计算属性
const acceptedCount = computed(() => {
  return submissionsData.value.filter(s => s.status === 'accepted').length
})

const failedCount = computed(() => {
  return submissionsData.value.filter(s => s.status !== 'accepted').length
})

// 获取提交记录
const fetchSubmissions = async () => {
  if (!props.problem?.id || !userStore.user?.id) {
    return
  }
  
  submissionsLoading.value = true
  
  try {
    const params: SubmitListParams = {
      problem_id: props.problem.id,
      user_id: userStore.user.id,
      page: submissionPage.value,
      page_size: submissionPageSize.value
    }
    
    await submitStore.fetchSubmits(params)
    submissionsData.value = submitStore.rawSubmits
    submissionTotal.value = submitStore.total
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取提交记录失败')
  } finally {
    submissionsLoading.value = false
  }
}

// 处理分页变化
const handlePageChange = (page: number) => {
  submissionPage.value = page
  fetchSubmissions()
}

// 处理提交记录点击
const handleSubmissionClick = async (submission: SubmitDetail) => {
  try {
    // 调用submitStore.fetchSubmitById获取提交详情
    const submitDetail = await submitStore.fetchSubmitById(submission.id);
    // 发出submission-click事件，传递提交记录详情的副本
    emit('submission-click', JSON.parse(JSON.stringify(submitDetail)));
    // 切换到详情视图
    if (props.switchToDetailView) {
      props.switchToDetailView();
    }
  } catch (error) {
    console.error('获取提交详情失败:', error);
    ElMessage.error('获取提交详情失败');
    // 如果获取详情失败，仍然发出事件，传递原始submission对象的副本
    emit('submission-click', JSON.parse(JSON.stringify(submission)));
  }
}

// 监听问题变化
watch(() => props.problem, (newProblem) => {
  if (newProblem) {
    submissionPage.value = 1
    fetchSubmissions()
  }
}, { immediate: true })

// 监听页签变化
watch(activeTab, (newTab) => {
  if (newTab === 'submissions' && props.problem && submissionsData.value.length === 0) {
    fetchSubmissions()
  }
})

const getDifficultyType = (difficulty?: Difficulty) => {
  if (!difficulty) return ''
  const types: Record<Difficulty, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return types[difficulty]
}

// 暴露方法给父组件
defineExpose({
  fetchSubmissions
})

const getDifficultyText = (difficulty?: Difficulty) => {
  if (!difficulty) return '未知'
  const texts: Record<Difficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty]
}

const getSubmissionStatusType = (status: string) => {
  const statusTypes: Record<string, string> = {
    'accepted': 'success',
    'wrong_answer': 'danger',
    'time_limit': 'warning',
    'memory_limit': 'warning',
    'runtime_error': 'info',
    'compile_error': 'info',
    'system_error': 'info',
    'pending': 'info',
    'running': 'primary'
  }
  return statusTypes[status] || 'info'
}

const getSubmissionStatusText = (status: string) => {
  const statusTexts: Record<string, string> = {
    'accepted': '通过',
    'wrong_answer': '答案错误',
    'time_limit': '超时',
    'memory_limit': '内存超限',
    'runtime_error': '运行错误',
    'compile_error': '编译错误',
    'system_error': '系统错误',
    'pending': '等待中',
    'running': '运行中'
  }
  return statusTexts[status] || status
}

const formatSubmissionTime = (timeStr: string) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  // 小于1天
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  // 超过1天，显示具体日期
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
}

const formatTimeUsed = (timeUsed: number | undefined) => {
  if (timeUsed === undefined || timeUsed === null) return '-'
  return `${timeUsed}ms`
}

const formatMemoryUsed = (memoryUsed: number | undefined) => {
  if (memoryUsed === undefined || memoryUsed === null) return '-'
  return `${(memoryUsed / 1024).toFixed(1)}KB`
}

const formatDescription = (description: string) => {
  return description
    .replace(/## (.*)/g, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}
</script>

<style scoped lang="scss">
.problem-panel {
  height: 100%;
  width: 40%;
  min-width: 300px;
  background: $bg-card;
  border-right: 1px solid $border-default;
  display: flex;
  flex-direction: column;

  .problem-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;

    .problem-inner {
      padding: 10px;
      padding-top: 0;
      height: 100%;

      .tabs {
        .problem-tabs {
          height: 100%;
        }
      }

      .problem-header {
        margin-bottom: 14px;
      }

      .problem-meta {
        margin-top: 16px;

        h1 {
          margin: 0 0 12px 0;
          color: $text-primary;
          font-size: 20px;
          font-weight: 600;
        }

        .meta-tags {
          display: flex;
          gap: 8px;
          align-items: center;
        }
      }

      .submissions-section {
        padding: 16px 0;
        height: 100%;
        display: flex;
        flex-direction: column;

        .submissions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid $border-light;

          .submissions-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 600;
            color: $text-primary;

            .title-icon {
              color: $color-primary;
            }
          }

          .submissions-stats {
            display: flex;
            gap: 8px;
          }
        }

        .empty-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;

          .empty-text {
            color: $text-tertiary;
            font-size: 14px;
            margin: 8px 0 0 0;
          }
        }

        .submissions-list {
          flex: 1;
          overflow-y: auto;

          .submission-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            margin-bottom: 8px;
            background: $bg-secondary;
            border: 1px solid $border-light;
            border-radius: $border-radius-card;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              background: rgba($color-primary, 0.06);
              border-color: $color-primary;
              box-shadow: $shadow-light;
            }

            .submission-main {
              display: flex;
              align-items: center;
              gap: 12px;
              flex: 1;
            }

            .submission-status {
              min-width: 60px;
            }

            .submission-info {
              flex: 1;
              min-width: 0;

              .submission-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 4px;

                .submission-id {
                  font-size: 12px;
                  color: $text-tertiary;
                  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                }

                .submission-language {
                  font-size: 12px;
                  color: $color-primary;
                  background: rgba($color-primary, 0.08);
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-weight: 500;
                }
              }

              .submission-time {
                font-size: 12px;
                color: $text-tertiary;
              }
            }

            .submission-performance {
              display: flex;
              gap: 16px;
              align-items: center;
              margin-top: 4px;

              .performance-item {
                display: flex;
                align-items: center;
                gap: 4px;
                background: $bg-secondary;
                padding: 2px 8px;
                border-radius: 12px;
                border: 1px solid $border-light;

                .performance-label {
                  font-size: 10px;
                  color: $text-tertiary;
                  font-weight: 500;
                }

                .performance-value {
                  font-size: 11px;
                  color: $text-secondary;
                  font-weight: 600;
                  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                }
              }
            }

            .submission-arrow {
              color: $text-tertiary;
              transition: color 0.2s ease;
            }

            &:hover .submission-arrow {
              color: $color-primary;
            }
          }
        }

        .pagination {
          margin-top: 16px;
          display: flex;
          justify-content: center;
          padding-top: 16px;
          border-top: 1px solid $border-light;
        }
      }

      .description-section,
      .examples-section,
      .constraints-section {
        margin-bottom: 24px;

        h3 {
          margin: 0 0 16px 0;
          color: $text-primary;
          font-size: 16px;
          font-weight: 600;
        }
      }

      .problem-description {
        line-height: 1.6;
        color: $text-secondary;
      }

      .example {
        margin-bottom: 20px;
        background-color: $bg-secondary;
        border-radius: $border-radius-card;
        padding: 16px;

        h4 {
          margin: 0 0 12px 0;
          color: $text-primary;
          font-size: 14px;
          font-weight: 600;
        }

        .example-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .example-item strong {
          color: $text-primary;
          font-size: 13px;
        }

        .example-code {
          background-color: $bg-primary;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 4px 0 0 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          color: $color-danger;
          border: 1px solid $border-light;
        }
      }

      .constraints {
        margin: 0;
        padding-left: 20px;

        li {
          margin-bottom: 6px;
          color: $text-secondary;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
