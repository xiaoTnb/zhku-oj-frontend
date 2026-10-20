<template>
  <div class="container">
    <el-table
      v-loading="loading"
      :data="problems"
      style="width: 100%"
      @row-click="openProblemDetail"
      :header-cell-style="{ 
        backgroundColor: '#fafafa', 
        color: '#262626',
        fontWeight: '500',
        border: 'none'
      }"
      :cell-style="{ border: 'none' }"
    >
      <!-- 题目标题 -->
      <el-table-column label="题目" width="230" style="margin-left: 20px;" align="center">  
        <template #default="{ row }">
          <div class="title-wrapper">
            <span class="title">
              {{ (row.unique_id != null ? row.unique_id + '.' : '') + row.title }}
            </span>
          </div>
        </template>
      </el-table-column>

      <!-- 标签 -->
      <el-table-column label="标签" width="200" align="center">
        <template #default="{ row }">
          <div class="tag-list" v-if="row.tags && row.tags.length > 0">
            <el-tag
              v-for="tag in row.tags.slice(0, 2)"
              :key="tag"
              size="small"
              type="info"
              effect="plain"
              class="tag"
              disable-transitions
            >
              {{ tag }}
            </el-tag>
            <el-tag
              v-if="row.tags.length > 2"
              size="small"
              type="info"
              effect="plain"
              class="tag"
              disable-transitions
            >
              +{{ row.tags.length - 2 }}
            </el-tag>
          </div>
          <span v-else class="empty-text">暂无标签</span>
        </template>
      </el-table-column>

      <!-- 难度 -->
      <el-table-column label="难度" width="130" align="center">
        <template #default="{ row }">
          <div class="difficulty">
            <div class="dot" :class="row.difficulty"></div>
            <span class="label" :class="row.difficulty">
              {{ getDifficultyText(row.difficulty) }}
            </span>
          </div>
        </template>
      </el-table-column>

      <!-- 提交数 -->
      <el-table-column label="提交数" width="130" align="center">
        <template #default="{ row }">
          <span class="submit-count">
            {{ row.submit_count || 0 }}
          </span>
        </template>
      </el-table-column>

      <!-- 通过率 -->
      <el-table-column label="通过率" width="130" align="center">
        <template #default="{ row }">
          <span class="rate" :class="getAcceptanceClass(getAcRateValue(row))">
            {{ getAcRate(row) }}%
          </span>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click.stop="openCodeEditor(row.id)"
            round
          >
            {{ row.solved ? '再次练习' : '开始刷题' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        :model-value="currentPage"
        @update:current-page="$emit('update:currentPage', $event)"
        :page-size="pageSize"
        @update:page-size="$emit('update:pageSize', $event)"
        :page-sizes="[20, 50, 100]"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Difficulty } from '@/types/problem'
import { Select, Clock } from '@element-plus/icons-vue'

import type { ProblemBrief } from '@/types/problem'

interface Problem extends ProblemBrief {
  solved?: boolean
  attempted?: boolean
}

interface Props {
  problems: Problem[]
  loading: boolean
  currentPage: number
  pageSize: number
  totalCount: number
}

const props = defineProps<Props>()

defineEmits<{
  'update:currentPage': [value: number]
  'update:pageSize': [value: number]
}>()

const router = useRouter()

const openProblemDetail = (row: Problem) => {
  const url = router.resolve(`/problems/${row.id}`).href
  window.open(url, '_blank')
}

const openCodeEditor = (problemId: string) => {
  const url = router.resolve(`/editor/${problemId}`).href
  window.open(url, '_blank')
}

const getDifficultyText = (difficulty: Difficulty) => {
  const texts: Record<Difficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty]
}

const getAcRate = (problem: Problem) => {
  if (problem.ac_rate !== undefined) {
    return problem.ac_rate.toFixed(1)
  }
  if (problem.submit_count && problem.submit_count > 0) {
    const rate = ((problem.ac_count || 0) / problem.submit_count) * 100
    return rate.toFixed(1)
  }
  return '0.0'
}

const getAcRateValue = (problem: Problem): number => {
  if (problem.ac_rate !== undefined) {
    return problem.ac_rate
  }
  if (problem.submit_count && problem.submit_count > 0) {
    return ((problem.ac_count || 0) / problem.submit_count) * 100
  }
  return 0
}

const getAcceptanceClass = (rate: number) => {
  if (rate >= 50) return 'high'
  if (rate >= 30) return 'medium'
  return 'low'
}
</script>

<style lang="scss" scoped>
.container {
  background: $bg-card;
  border-radius: $border-radius-card;
  border: 1px solid $border-card;
  overflow: hidden;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;

  .title {
    color: $text-primary;
    font-weight: 500;
  }
}

:deep(.el-table__row:hover .title) {
  color: $color-primary;
}

.tag-list {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;

  .tag {
    font-size: 11px;
    height: 18px;
    line-height: 18px;
  }

  .empty-text {
    color: $text-quaternary;
    font-size: 12px;
  }
}

.difficulty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.easy { background-color: $color-success; }
    &.medium { background-color: $color-warning; }
    &.hard { background-color: $color-danger; }
  }

  .label {
    &.easy { color: $color-success; }
    &.medium { color: $color-warning; }
    &.hard { color: $color-danger; }
  }
}

.rate {
  font-weight: 500;

  &.high { color: $color-success; }
  &.medium { color: $color-warning; }
  &.low { color: $color-danger; }
}

.submit-count {
  color: $text-secondary;
  font-size: 14px;
}

.pagination {
  padding: 20px 24px;
  display: flex;
  justify-content: center;
  border-top: 1px solid $border-light;
}

/* 表格样式调整 */
:deep(.el-table) {
  border: none;
  --el-table-row-hover-bg-color: #{$bg-hover};
  
  .el-table__header {
    border: none;
  }

  td {
    padding: 16px 0;
  }

  .el-table__body tr:hover > td {
    cursor: pointer;
  }
}
</style>
