<template>
  <div class="task-detail" v-loading="loading">
    <!-- 优化后的页头 -->
    <section class="page-header">
      <div class="header-content">
        <!-- 返回按钮和标题区域 -->
        <div class="header-main">
          <div class="header-left">
            <el-button @click="goBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
          </div>
          
          <div class="header-center">
            <div class="title-section">
              <h1 class="title">{{ taskData?.title || '任务详情' }}</h1>
              <div class="title-sub">
                <span class="sub-text">{{ taskData?.description || '暂无描述' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 状态标签区域 -->
        <div class="header-right">
          <div class="status-cards">
            <div class="status-card">
              <div class="status-icon" :class="statusType">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="status-info">
                <div class="status-value">{{ statusLabel }}</div>
                <div class="status-label">任务状态</div>
              </div>
            </div>

            <div class="status-card">
              <div class="status-icon" :class="typeType">
                <el-icon>
                  <component :is="typeIcon" />
                </el-icon>
              </div>
              <div class="status-info">
                <div class="status-value">{{ typeLabel }}</div>
                <div class="status-label">任务类型</div>
              </div>
            </div>

            <div class="status-card">
              <div class="status-icon" :class="completionStatusType">
                <el-icon>
                  <component :is="completionIcon" />
                </el-icon>
              </div>
              <div class="status-info">
                <div class="status-value">{{ completionText }}</div>
                <div class="status-label">完成进度</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 优化后的任务概览 -->
    <section class="task-overview">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="24">
          <el-card class="info-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon>
                    <InfoFilled />
                  </el-icon>
                  任务信息
                </span>
              </div>
            </template>

            <div class="info-content">
              <div class="info-grid">
                <!-- 基本信息列 -->
                <div class="info-column">
                  <div class="info-item">
                    <div class="info-label">
                      <div class="label-icon">
                        <el-icon><Calendar /></el-icon>
                      </div>
                      <div class="label-text">开始时间</div>
                    </div>
                    <div class="info-value">{{ formatDate(taskData?.start_time) }}</div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <div class="label-icon">
                        <el-icon><Timer /></el-icon>
                      </div>
                      <div class="label-text">结束时间</div>
                    </div>
                    <div class="info-value">{{ formatDate(taskData?.end_time) }}</div>
                  </div>
                </div>

                <!-- 进度信息列 -->
                <div class="info-column">
                  <div class="info-item">
                    <div class="info-label">
                      <div class="label-icon">
                        <el-icon><TrendCharts /></el-icon>
                      </div>
                      <div class="label-text">完成进度</div>
                    </div>
                    <div class="info-value">
                      <div class="progress-info">
                        <div class="progress-bar-container">
                          <div class="progress-bar">
                            <div 
                              class="progress-fill" 
                              :style="{ width: completionRate + '%' }"
                              :class="{ 'completed': completionRate === 100 }"
                            ></div>
                          </div>
                          <span class="progress-text">{{ completionRate }}%</span>
                        </div>
                        <div class="progress-detail">
                          {{ completedCount }}/{{ totalQuestions }} 题目
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 关联题目列表 -->
    <section class="task-questions">
      <el-card class="questions-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon>
                <List />
              </el-icon>
              关联题目
              <el-tag size="small" class="count-tag" disable-transitions>{{ totalQuestions }}</el-tag>
              <span class="completion-info">
                (已完成: {{ completedCount }}/{{ totalQuestions }})
              </span>
            </span>
          </div>
        </template>

        <div class="questions-content">
          <el-empty v-if="totalQuestions === 0" description="暂无关联题目" />
          <div v-else>
            <!-- 题目列表 -->
            <div class="question-list">
              <div v-for="(question, index) in taskData?.questions" :key="question.id" 
                   class="question-item" :class="{ 'completed': question.completed }">
                <div class="question-index">
                  {{ index + 1 }}
                  <el-icon v-if="question.completed" class="completed-icon">
                    <CircleCheck />
                  </el-icon>
                </div>
                <div class="question-info">
                  <div class="question-header">
                    <span class="question-title">{{ ((question?.unique_id != null ? question.unique_id + '.' : '') + (question.title || `题目 ${index + 1}`)) }}</span>
                    <div class="question-tags">
                      <el-tag :type="getDifficultyType(question.difficulty)"
                        size="small" class="difficulty-tag" disable-transitions>
                        {{ getDifficultyLabel(question.difficulty) }}
                      </el-tag>
                      <el-tag v-if="question.completed" type="success" size="small" class="status-tag" disable-transitions>
                        <el-icon><Select /></el-icon>
                        已完成
                      </el-tag>
                      <el-tag v-else type="info" size="small" class="status-tag" disable-transitions>
                        未完成
                      </el-tag>
                    </div>
                  </div>
                  <div class="question-actions">
                    <!-- 查看题目详情按钮 - 新开标签页 -->
                    <el-button 
                      type="primary" 
                      size="small" 
                      text
                      class="action-btn detail-btn"
                      @click="handleViewQuestion(question)">
                      <el-icon>
                        <View />
                      </el-icon>
                      查看题目
                    </el-button>
                    
                    <!-- 开始做题按钮 - 新开标签页 -->
                    <el-button 
                      type="primary" 
                      size="small" 
                      class="action-btn coding-btn"
                      @click="handleStartCoding(question)">
                      <el-icon>
                        <Edit />
                      </el-icon>
                      {{ question.completed ? '重新做题' : '开始做题' }}
                    </el-button>
                    
                    <!-- 查看解答按钮（仅已完成题目显示） -->
                    <!-- <el-button 
                      v-if="question.completed"
                      type="success" 
                      size="small" 
                      text
                      class="action-btn view-solution-btn"
                      @click="handleViewSolution(question)">
                      <el-icon>
                        <Document />
                      </el-icon>
                      查看解答
                    </el-button> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft, InfoFilled, Document, Reading, Calendar, Timer, Clock,
  List, View, CircleCheck, Select, DocumentCopy, VideoCamera, Edit,
  TrendCharts
} from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { Task } from '@/types/task'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const userStore = useUserStore()

const loading = ref(false)
const taskData = ref<Task | null>(null)

// 判断是否是教师
const isTeacher = computed(() => {
  return userStore.user?.role === 'teacher' || userStore.user?.role === 'admin'
})

// 计算完成情况 - 基于 questions 数组中的 completed 字段
const totalQuestions = computed(() => {
  return taskData.value?.questions?.length || 0
})

const completedCount = computed(() => {
  if (!taskData.value?.questions) return 0
  // 统计 completed 为 true 的题目数量
  return taskData.value.questions.filter(q => q.completed === true).length
})

const completionRate = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((completedCount.value / totalQuestions.value) * 100)
})

// 任务类型信息
const typeLabel = computed(() => {
  if (!taskData.value) return '-'
  return taskData.value.type === 1 ? '题单' : '视频'
})

const typeType = computed(() => {
  if (!taskData.value) return 'info'
  return taskData.value.type === 1 ? 'success' : 'info'
})

const typeIcon = computed(() => {
  if (!taskData.value) return 'Document'
  return taskData.value.type === 1 ? 'DocumentCopy' : 'VideoCamera'
})

// 任务状态信息
const statusLabel = computed(() => {
  if (!taskData.value) return '-'
  switch (taskData.value.status) {
    case 0: return '未开始'
    case 1: return '进行中'
    case 2: return '已结束'
    default: return '未知'
  }
})

const statusType = computed(() => {
  if (!taskData.value) return 'info'
  switch (taskData.value.status) {
    case 0: return 'info'      // 未开始 - 蓝色
    case 1: return 'success'   // 进行中 - 绿色
    case 2: return 'warning'   // 已结束 - 橙色
    default: return 'info'
  }
})

// 完成进度相关计算属性
const completionStatusType = computed(() => {
  if (completionRate.value === 100) return 'success'
  if (completionRate.value > 0) return 'warning'
  return 'info'
})

const completionIcon = computed(() => {
  return completionRate.value === 100 ? 'CircleCheck' : 'Timer'
})

const completionText = computed(() => {
  if (completionRate.value === 100) return '全部完成'
  if (completionRate.value > 0) return `${completedCount.value}/${totalQuestions.value}`
  if (taskData.value?.status === 1) return '待开始'
  return '未开始'
})

// 格式化时间
function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 查看题目详情 - 新开标签页
function handleViewQuestion(question: any) {
  if (!question.id) {
    ElMessage.error('题目ID不存在')
    return
  }
  
  // 获取任务ID和班级ID
  const taskId = String(route.params.id || '')
  const clazzId = String(route.query.clazzId || taskData.value?.clazz_id || '')
  
  // 新开标签页打开题目详情，传递任务相关参数
  const routeData = router.resolve({
    path: `/problems/${question.id}`,
    query: {
      task_id: taskId,
      clazz_id: clazzId
    }
  })
  window.open(routeData.href, '_blank')
}

// 开始做题 - 新开标签页
function handleStartCoding(question: any) {
  if (!question.id) {
    ElMessage.error('题目ID不存在')
    return
  }
  
  // 获取任务ID和班级ID
  const taskId = String(route.params.id || '')
  const clazzId = String(route.query.clazzId || taskData.value?.clazz_id || '')
  
  // 新开标签页打开做题页面，传递任务相关参数
  const routeData = router.resolve({
    path: `/editor/${question.id}`,
    query: {
      task_id: taskId,
      clazz_id: clazzId
    }
  })
  window.open(routeData.href, '_blank')
}

// 查看解答
function handleViewSolution(question: any) {
  if (!question.id) {
    ElMessage.error('题目ID不存在')
    return
  }
  
  // 跳转到查看解答页面
  ElMessage.info('查看解答功能开发中')
  // const routeData = router.resolve(`/solution/${question.id}`)
  // window.open(routeData.href, '_blank')
}

// 获取难度标签类型
function getDifficultyType(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'success'
    case 'medium': return 'warning'
    case 'hard': return 'danger'
    default: return 'info'
  }
}

// 获取难度标签文本
function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return '未知'
  }
}

// 返回上一页
function goBack() {
  router.back()
}

// 加载任务数据
async function loadTaskData() {
  const clazzId = String(route.query.clazzId || '')
  const taskId = String(route.params.id || '')
  if (!taskId || !clazzId) {
    ElMessage.error('任务ID或班级ID不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    // 调用API获取任务详情，包含题目详情和完成状态
    const task = await taskStore.fetchTaskById(clazzId, taskId)
    if (task) {
      taskData.value = task
      
      // 调试信息：检查题目完成状态
      if (task.questions && task.questions.length > 0) {
        // 题目完成状态统计已移除console.log
      }
    } else {
      ElMessage.error('任务不存在')
      setTimeout(() => {
        router.back()
      }, 1500)
    }
  } catch (error) {
    console.error('加载任务详情失败:', error)
    ElMessage.error('加载任务详情失败')
    setTimeout(() => {
      router.back()
    }, 1500)
  } finally {
    loading.value = false
  }
}

onMounted(loadTaskData)
</script>

<style lang="scss" scoped>
.task-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  .header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 32px;
  }

  .header-main {
    flex: 1;
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }

  .header-left {
    flex-shrink: 0;
  }

  .back-btn {
    padding: 8px 16px;
  }

  .header-center {
    flex: 1;
  }

  .title-section {
    color: $text-primary;
  }

  .title {
    margin: 0 0 12px 0;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
  }

  .title-sub {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sub-text {
    font-size: 14px;
    color: $text-tertiary;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .header-right {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: flex-end;
  }

  .status-cards {
    display: flex;
    gap: 16px;
  }

  .status-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: $bg-card;
    border-radius: 12px;
    border: 1px solid $border-default;
    min-width: 140px;

    .status-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #fff;

      &.success {
        background: rgba($color-success, 0.1);
        color: $color-success;
      }

      &.info {
        background: rgba($color-primary, 0.1);
        color: $color-primary;
      }

      &.warning {
        background: rgba($color-warning, 0.1);
        color: $color-warning;
      }
    }

    .status-info {
      color: $text-primary;

      .status-value {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 4px;
        color: $text-primary;
      }

      .status-label {
        font-size: 12px;
        color: $text-tertiary;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }

  .progress-tags {
    display: flex;
    gap: 12px;
  }

  .completion-tag {
    font-weight: 600;
  }

  .task-overview {
    margin-bottom: 24px;
  }

  .info-card {
    box-shadow: none;
    border: 1px solid $border-default;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
  }

  .count-tag {
    margin-left: 8px;
  }

  .completion-info {
    margin-left: 12px;
    font-size: 14px;
    color: $text-secondary;
  }

  .info-content {
    padding: 8px 0;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  .info-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background: $bg-tertiary;
    border-radius: 12px;
    flex: 1;
  }

  .info-label {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
  }

  .label-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba($color-primary, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary;
    font-size: 16px;
  }

  .label-text {
    color: $text-secondary;
    font-size: 14px;
    font-weight: 500;
  }

  .info-value {
    color: $text-primary;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.5;
  }

  .progress-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .progress-bar-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .progress-bar {
    flex: 1;
    height: 16px;
    background: $border-default;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 40px;
  }

  .progress-fill {
    height: 100%;
    background: $color-primary;
    border-radius: 4px;
    transition: width 0.5s ease;

    &.completed {
      background: $color-success;
    }
  }

  .progress-text {
    font-size: 14px;
    font-weight: 600;
    color: $color-primary;
    min-width: 40px;
    margin-top: 40px;
  }

  .progress-detail {
    font-size: 13px;
    color: $text-tertiary;
    margin-top: 45px;
  }

  .task-questions {
    margin-bottom: 24px;
  }

  .questions-card {
    box-shadow: none;
    border: 1px solid $border-default;
  }

  .questions-content {
    padding: 20px 0;
  }

  .question-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .question-item {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: $bg-tertiary;
    border-radius: 12px;
    border: 1px solid $border-dark;

    &.completed {
      background: rgba($color-success, 0.06);
      border-color: rgba($color-success, 0.4);
    }

    .question-index {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba($color-primary, 0.1);
      color: $color-primary;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 700;
      position: relative;
    }

    &.completed .question-index {
      background: rgba($color-success, 0.1);
      color: $color-success;
    }

    .completed-icon {
      position: absolute;
      top: -4px;
      right: -4px;
      background: $color-success;
      border-radius: 50%;
      padding: 2px;
      font-size: 12px;
    }

    .question-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .question-title {
      flex: 1;
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
      line-height: 1.4;
    }

    .question-tags {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .difficulty-tag {
      font-size: 12px;
    }

    .status-tag {
      font-size: 12px;
    }

    .question-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-btn {
      border-radius: 8px;
      font-size: 14px;
      padding: 8px 16px;
      transition: all 0.3s ease;
    }

    .detail-btn:hover {
      background: $bg-tertiary;
    }

    .coding-btn {
      background: $color-primary;
      border: none;
      color: #fff;
    }

    .coding-btn:hover {
      background: $color-primary-hover;
    }

    .view-solution-btn:hover {
      background: rgba($color-success, 0.08);
    }
  }
}
</style>
