<template>
  <el-aside width="280px" class="sidebar">
    <div class="sidebar-content">
      <!-- 题目统计卡片 -->
      <el-card class="stats-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><DataAnalysis /></el-icon>
            <span>题目统计</span>
          </div>
        </template>
        <div class="stats-content">
          <div class="stat-item">
            <div class="stat-circle total">
              <div class="stat-number">{{ totalProblems }}</div>
              <div class="stat-label">总题数</div>
            </div>
          </div>
          <div class="difficulty-stats">
            <div class="difficulty-item">
              <div class="difficulty-dot easy"></div>
              <span class="difficulty-label">简单</span>
              <span class="difficulty-count">{{ problemsByDifficulty.easy }}</span>
            </div>
            <div class="difficulty-item">
              <div class="difficulty-dot medium"></div>
              <span class="difficulty-label">中等</span>
              <span class="difficulty-count">{{ problemsByDifficulty.medium }}</span>
            </div>
            <div class="difficulty-item">
              <div class="difficulty-dot hard"></div>
              <span class="difficulty-label">困难</span>
              <span class="difficulty-count">{{ problemsByDifficulty.hard }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 每日一题 -->
      <el-card class="daily-card" shadow="never" v-loading="dailyLoading">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Calendar /></el-icon>
            <span>每日一题</span>
          </div>
        </template>
        <div class="daily-problem" v-if="dailyProblem" @click="openDailyProblemDetail">
          <div class="daily-header">
            <div class="daily-badge">
              <el-icon><Calendar /></el-icon>
              <span>{{ getCurrentDate() }}</span>
            </div>
          </div>
          
          <div class="daily-content">
            <h3 class="problem-title">{{ (dailyProblem.unique_id != null ? dailyProblem.unique_id + '.' : '') + dailyProblem.title }}</h3>
            
            <div class="problem-meta">
              <el-tag 
                :type="getDifficultyType(dailyProblem.difficulty)" 
                size="small"
                class="difficulty-tag"
              >
                {{ getDifficultyLabel(dailyProblem.difficulty) }}
              </el-tag>
              
              <div class="problem-tags" v-if="dailyProblem.tags?.length">
                <el-tag
                  v-for="tag in dailyProblem.tags.slice(0, 2)"
                  :key="tag"
                  size="small"
                  effect="plain"
                  type="info"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="daily-action">
            <el-button 
              type="primary" 
              size="default"
              class="start-button"
              @click="openDailyCodeEditor"
            >
              开始刷题
            </el-button>
          </div>
        </div>
        
        <div class="daily-empty" v-else>
          <el-icon class="empty-icon"><Calendar /></el-icon>
          <p>暂无每日推荐题目</p>
        </div>
      </el-card>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Difficulty, ProblemBrief } from '@/types/problem'
import { useProblemsStore } from '@/stores/problems'
import {
  DataAnalysis, Grid, Calendar, DocumentCopy, Link, Share, 
  Cpu, Monitor, Document
} from '@element-plus/icons-vue'

interface Props {
  totalProblems: number
  problemsByDifficulty: {
    easy: number
    medium: number
    hard: number
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  startDaily: [problemId: string]
}>()

const router = useRouter()
const store = useProblemsStore()
const dailyProblem = ref<ProblemBrief | null>(null)
const dailyLoading = ref(false)

const getDifficultyType = (difficulty?: Difficulty) => {
  switch (difficulty) {
    case 'easy': return 'success'
    case 'medium': return 'warning'
    case 'hard': return 'danger'
    default: return 'info'
  }
}

const getDifficultyLabel = (difficulty?: Difficulty) => {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return '未知'
  }
}

const getCurrentDate = () => {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  return `${month}月${day}日`
}

const openDailyProblemDetail = () => {
  if (dailyProblem.value?.id) {
    const routeUrl = router.resolve({
      name: 'ProblemDetail',
      params: { id: dailyProblem.value.id }
    })
    window.open(routeUrl.href, '_blank')
  }
}

const openDailyCodeEditor = (event: Event) => {
  event.stopPropagation() // 阻止事件冒泡到卡片点击事件
  if (dailyProblem.value?.id) {
    const routeUrl = router.resolve({
      name: 'CodeEditor',
      params: { id: dailyProblem.value.id }
    })
    window.open(routeUrl.href, '_blank')
  }
}

const fetchDailyProblem = async () => {
  dailyLoading.value = true
  try {
    const data = await store.fetchDailyProblem()
    if (data?.daily_problem) {
      dailyProblem.value = data.daily_problem
    }
  } catch (error) {
    console.error('获取每日一题失败:', error)
  } finally {
    dailyLoading.value = false
  }
}

onMounted(() => {
  fetchDailyProblem()
})
</script>

<style scoped lang="scss">
.sidebar {
  .sidebar-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .stats-card,
  .daily-card {
    border: 1px solid $border-default;
    border-radius: $border-radius-card;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: $text-primary;
    font-weight: 500;
  }

  .header-icon {
    color: $color-primary;
  }

  .stats-content {
    padding: 5px 0;
  }

  .stat-item {
    text-align: center;
    margin-bottom: 20px;
  }

  .stat-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba($color-primary, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    color: #ffffff;
  }

  .stat-number {
    font-size: 32px;
    font-weight: bold;
  }

  .stat-label {
    font-size: 12px;
    margin-top: 2px;
  }

  .difficulty-stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .difficulty-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .difficulty-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.easy { background-color: $color-success; }
    &.medium { background-color: $color-warning; }
    &.hard { background-color: $color-danger; }
  }

  .difficulty-label {
    flex: 1;
    color: $text-secondary;
  }

  .difficulty-count {
    color: $text-primary;
    font-weight: 500;
  }

  .daily-card {
    background: linear-gradient(135deg, rgba($color-primary, 0.03) 0%, $bg-card 100%);
    border: 1px solid $border-light;
  }

  .daily-problem {
    display: flex;
    flex-direction: column;
    gap: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 8px;
    padding: 4px;
    margin: -4px;
  }

  .daily-header {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }

  .daily-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba($color-primary, 0.8);
    color: #ffffff;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba($color-primary, 0.2);

    :deep(.el-icon) {
      font-size: 14px;
    }
  }

  .daily-content {
    text-align: center;
  }

  .problem-title {
    margin: 0 0 12px 0;
    color: $text-primary;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    word-break: break-word;

    &:hover {
      color: $color-primary;
    }
  }

  .problem-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .difficulty-tag {
    font-weight: 500;
  }

  .problem-tags {
    display: flex;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tag-item {
    border-radius: 12px;
  }

  .daily-action {
    display: flex;
    justify-content: center;
    margin-top: 4px;
  }

  .start-button {
    width: 100%;
    height: 40px;
    border-radius: 20px;
    background: rgba($color-primary, 0.8);
    border: none;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba($color-primary, 0.3);
    transition: all 0.3s ease;
  }

  .start-button:hover {
    box-shadow: 0 6px 16px rgba($color-primary, 0.4);
    background: rgba($color-primary, 0.8);
  }

  .start-button:active {
    transform: translateY(0);
  }

  .daily-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    color: $text-tertiary;
  }

  .empty-icon {
    font-size: 32px;
    color: $border-dark;
  }

  .daily-empty p {
    margin: 0;
    font-size: 14px;
  }
}
</style>
