<template>
  <div class="problem-detail">
    <el-container>
      <el-main v-loading="loading">
        <!-- 错误状态 -->
        <div v-if="!loading && !currentProblem" class="error-state">
          <el-result
            icon="error"
            title="加载失败"
            sub-title="无法获取题目详情"
          >
            <template #extra>
              <el-button type="primary" @click="goBack">返回题库</el-button>
              <el-button @click="retryLoad">重试</el-button>
            </template>
          </el-result>
        </div>

        <!-- 正常内容 -->
        <div class="problem-content" v-else-if="currentProblem">
          <div class="problem-header">
            <h1>{{ (currentProblem?.unique_id != null ? currentProblem.unique_id + '.' : '') + currentProblem.title }}</h1>
            <div class="problem-meta">
              <el-tag :type="getDifficultyType(currentProblem.difficulty)" size="large">
                {{ getDifficultyText(currentProblem.difficulty) }}
              </el-tag>
              <div class="problem-stats">
                <span v-if="currentProblem.ac_rate !== undefined">通过率: {{ currentProblem.ac_rate }}%</span>
                <span v-if="currentProblem.submit_count !== undefined">提交次数: {{ currentProblem.submit_count }}</span>
                <span v-if="currentProblem.ac_count !== undefined && currentProblem.submit_count !== undefined">
                  通过数: {{ currentProblem.ac_count }}/{{ currentProblem.submit_count }}
                </span>
              </div>
            </div>
          </div>

          <el-row :gutter="20">
            <el-col :span="16">
              <!-- 题目描述 -->
              <el-card class="section-card">
                <template #header>
                  <h3>题目描述</h3>
                </template>
                <div class="problem-description" v-html="formatDescription(currentProblem.description)"></div>
              </el-card>

              <!-- 输入输出说明 -->
              <el-card v-if="currentProblem.input || currentProblem.output" class="section-card">
                <template #header>
                  <h3>输入输出说明</h3>
                </template>
                <div v-if="currentProblem.input" class="io-section">
                  <h4>输入:</h4>
                  <p>{{ currentProblem.input }}</p>
                </div>
                <div v-if="currentProblem.output" class="io-section">
                  <h4>输出:</h4>
                  <p>{{ currentProblem.output }}</p>
                </div>
              </el-card>

              <!-- 示例 -->
              <el-card class="section-card">
                <template #header>
                  <h3>示例</h3>
                </template>
                <div v-if="currentProblem.sample_input && currentProblem.sample_output" class="example">
                  <h4>示例:</h4>
                  <div class="example-content">
                    <div class="example-item">
                      <strong>输入:</strong>
                      <pre>{{ currentProblem.sample_input }}</pre>
                    </div>
                    <div class="example-item">
                      <strong>输出:</strong>
                      <pre>{{ currentProblem.sample_output }}</pre>
                    </div>
                  </div>
                </div>
                <div v-else class="no-examples">
                  <el-empty description="暂无示例" />
                </div>
              </el-card>

              <!-- 提示 -->
              <el-card v-if="currentProblem.hint" class="section-card">
                <template #header>
                  <h3>提示</h3>
                </template>
                <p>{{ currentProblem.hint }}</p>
              </el-card>
            </el-col>

            <el-col :span="8">
              <!-- 标签 -->
              <el-card v-if="currentProblem.tags && currentProblem.tags.length > 0" class="section-card">
                <template #header>
                  <h3>标签</h3>
                </template>
                <div class="tags">
                  <el-tag
                    v-for="tag in currentProblem.tags"
                    :key="tag"
                    class="tag-item"
                    type="primary"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </el-card>

              <!-- 来源 -->
              <el-card v-if="currentProblem.source || currentProblem.author" class="section-card">
                <template #header>
                  <h3>来源</h3>
                </template>
                <div class="source-info">
                  <p v-if="currentProblem.source">来源: {{ currentProblem.source }}</p>
                  <p v-if="currentProblem.author">作者: {{ currentProblem.author }}</p>
                </div>
              </el-card>

              <!-- 限制 -->
              <el-card v-if="currentProblem.time_limit || currentProblem.memory_limit" class="section-card">
                <template #header>
                  <h3>限制</h3>
                </template>
                <div class="limits">
                  <p v-if="currentProblem.time_limit">时间限制: {{ currentProblem.time_limit }} ms</p>
                  <p v-if="currentProblem.memory_limit">内存限制: {{ currentProblem.memory_limit }} MB</p>
                </div>
              </el-card>

              <!-- 开始做题按钮 -->
              <div class="action-buttons">
                <el-button type="primary" size="large" @click="startCoding" style="width: 100%; margin-top: 20px;">
                  开始做题
                </el-button>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProblemsStore } from '@/stores/problems'
import type { Difficulty, Problem } from '@/types/problem'

const route = useRoute()
const router = useRouter()
const problemsStore = useProblemsStore()

// 使用响应式数据
const loading = ref(true)
const currentProblem = ref<Problem | null>(null)

const goBack = () => {
  router.push('/problems')
}

const retryLoad = async () => {
  await fetchProblemData()
}

const startCoding = () => {
  // 检查是否有任务相关参数
  const taskId = route.query.task_id as string
  const clazzId = route.query.clazz_id as string
  
  if (taskId && clazzId) {
    // 如果有任务参数，同标签页跳转并传递给代码编辑器
    router.push({
      path: `/editor/${route.params.id}`,
      query: {
        task_id: taskId,
        clazz_id: clazzId
      }
    })
  } else {
    // 普通题目练习，同标签页跳转不传递任务参数
    router.push(`/editor/${route.params.id}`)
  }
}

const getDifficultyType = (difficulty?: Difficulty) => {
  if (!difficulty) return ''
  const types: Record<Difficulty, '' | 'success' | 'warning' | 'danger'> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return types[difficulty]
}

const getDifficultyText = (difficulty?: Difficulty) => {
  if (!difficulty) return '未知'
  const texts: Record<Difficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty]
}

const formatDescription = (description: string) => {
  if (!description) return ''
  // 简单的 Markdown 格式化
  return description
    .replace(/## (.*)/g, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

// 获取题目数据
const fetchProblemData = async () => {
  const problemId = String(route.params.id || '')
  if (!problemId) {
    ElMessage.error('题目ID不能为空')
    return
  }

  loading.value = true
  try {
    // 获取题目详情
    const problem = await problemsStore.fetchProblemById(problemId)
    currentProblem.value = problem
  } catch (error: any) {
    ElMessage.error(error?.message || '获取题目详情失败')
    currentProblem.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProblemData()
})
</script>

<style scoped lang="scss">
.problem-detail {
  min-height: 100vh;
  background-color: $bg-secondary;

  .problem-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 20px;

    .problem-header {
      margin-bottom: 30px;
      background-color: $bg-card;
      padding: 25px;
      border-radius: $border-radius-card;
      box-shadow: $shadow-light;

      h1 {
        margin: 0 0 20px 0;
        color: $text-primary;
        font-size: 32px;
        font-weight: 600;
        border-left: 4px solid $color-primary;
        padding-left: 15px;
      }

      .problem-meta {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }
    }

    .problem-stats {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: $text-secondary;
      background-color: $bg-secondary;
      padding: 8px 15px;
      border-radius: 20px;

      span {
        display: flex;
        align-items: center;

        &::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: $color-primary;
          margin-right: 8px;
        }
      }
    }

    .section-card {
      margin-bottom: 25px;
      border-radius: $border-radius-card;
      overflow: hidden;
      transition: all 0.3s;
      box-shadow: $shadow-light;

      

      :deep(.el-card__header) {
        padding: 18px 20px;
        border-bottom: 1px solid $border-light;
        background-color: $bg-secondary;
      }

      h3 {
        margin: 0;
        color: $text-primary;
        font-size: 18px;
        font-weight: 600;
        display: flex;
        align-items: center;

        &::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 16px;
          background-color: $color-primary;
          margin-right: 10px;
          border-radius: 2px;
        }
      }
    }

    .problem-description {
      line-height: 1.8;
      color: $text-secondary;
      padding: 5px 0;
    }

    .io-section {
      margin-bottom: 20px;
      background-color: $bg-secondary;
      padding: 15px;
      border-radius: 6px;

      h4 {
        margin: 0 0 10px 0;
        color: $color-primary;
        font-size: 16px;
        font-weight: 600;
      }

      p {
        margin: 0;
        color: $text-secondary;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        white-space: pre-wrap;
        line-height: 1.6;
      }
    }

    .example {
      margin-bottom: 25px;
      border-bottom: 1px dashed $border-light;
      padding-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
        border-bottom: none;
        padding-bottom: 0;
      }

      h4 {
        margin: 0 0 12px 0;
        color: $color-primary;
        font-weight: 600;
      }

      .example-content {
        background-color: $bg-secondary;
        padding: 18px;
        border-radius: $border-radius-card;
        border-left: 3px solid $color-primary;
      }

      .example-item {
        margin-bottom: 15px;

        &:last-child {
          margin-bottom: 0;
        }

        strong {
          color: $text-primary;
          font-size: 15px;
        }

        pre {
          background-color: $bg-card;
          padding: 12px 15px;
          border-radius: 6px;
          border: 1px solid $border-dark;
          margin: 8px 0 0 0;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          color: $color-warning;
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.6;
        }

        p {
          margin: 8px 0 0 0;
          color: $text-secondary;
        }
      }
    }

    .tags,
    .companies {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .tag-item,
    .company-item {
      margin: 0;
      transition: all 0.3s;
    }

    

    .source-info p,
    .limits p {
      margin: 8px 0;
      color: $text-secondary;
      display: flex;
      align-items: center;

      &::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: $color-primary;
        margin-right: 8px;
      }
    }

    .no-examples {
      padding: 30px 0;
    }

    .action-buttons {
      margin-top: 25px;

      :deep(.el-button) {
        transition: all 0.3s;
        font-weight: 600;
        letter-spacing: 1px;
        height: 50px;
        border-radius: 25px;
      }

      
    }
  }
}
</style>
