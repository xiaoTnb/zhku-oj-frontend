<template>
  <div class="filter-section">
    <div class="filter-header">
      <h2>题库</h2>
      <div class="filter-stats">
        共 {{ totalCount }} 题
      </div>
    </div>
    
    <div class="filter-controls">
      <div class="filter-left">
        <el-select
          :model-value="selectedDifficulty"
          @update:model-value="$emit('update:selectedDifficulty', $event)"
          placeholder="难度"
          clearable
          size="default"
          style="width: 120px"
        >
          <el-option label="简单" value="easy">
            <div class="difficulty-option">
              <div class="difficulty-dot easy"></div>
              <span>简单</span>
            </div>
          </el-option>
          <el-option label="中等" value="medium">
            <div class="difficulty-option">
              <div class="difficulty-dot medium"></div>
              <span>中等</span>
            </div>
          </el-option>
          <el-option label="困难" value="hard">
            <div class="difficulty-option">
              <div class="difficulty-dot hard"></div>
              <span>困难</span>
            </div>
          </el-option>
        </el-select>

        <el-select
          :model-value="selectedCategory"
          @update:model-value="$emit('update:selectedCategory', $event)"
          placeholder="分类"
          clearable
          size="default"
          style="width: 140px"
          value-key="id"
        >
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category"
          />
        </el-select>
      </div>

      <div class="filter-right">
        <el-input
          :model-value="searchKeyword"
          @update:model-value="handleSearch"
          placeholder="搜索题目或分类..."
          size="default"
          style="width: 300px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Difficulty, Category } from '@/types/problem'
import { Search } from '@element-plus/icons-vue'

interface Props {
  selectedDifficulty: Difficulty | ''
  selectedCategory: Category | null
  searchKeyword: string
  totalCount: number
  categories: Category[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:selectedDifficulty': [value: Difficulty | '']
  'update:selectedCategory': [value: Category | null]
  'update:searchKeyword': [value: string]
}>()

// 使用防抖处理搜索
let searchTimer: number | null = null
const handleSearch = (value: string) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = window.setTimeout(() => {
    emit('update:searchKeyword', value)
  }, 300)
}
</script>

<style scoped lang="scss">
.filter-section {
  background: $bg-card;
  border-radius: $border-radius-card;
  border: 1px solid $border-default;
  padding: 24px;
  margin-bottom: 16px;

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: $text-primary;
      font-size: 24px;
      font-weight: 600;
    }

    .filter-stats {
      color: $text-secondary;
      font-size: 14px;
    }
  }

  .filter-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;

    .filter-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filter-right {
      display: flex;
      align-items: center;
    }
  }

  .difficulty-option {
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
}
</style>
