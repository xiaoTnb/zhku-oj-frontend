<template>
  <div class="category-view">
    <el-container>
      <el-main>
        <div class="category-content">
          <div class="category-header">
            <h1>题库分类</h1>
            <p>按不同算法和数据结构分类的题目</p>
          </div>

          <div class="categories-grid" v-loading="loading">
            <el-card
              v-for="category in categories"
              :key="category.id"
              class="category-card"
              shadow="hover"
              @click="goToCategory(category.name)"
            >
              <div class="category-info">
                <h3>{{ category.name }}</h3>
                <p class="category-description">{{ category.description }}</p>
                <div class="category-stats">
                  <el-tag type="info" size="small">{{ category.count }} 题</el-tag>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Category } from '@/types/problem'

const router = useRouter()

const activeIndex = ref('2')
const loading = ref(false)

// 使用静态数据
const categories = ref<Category[]>([
  { id: 1, name: '数组', description: '数组相关题目', count: 120 },
  { id: 2, name: '链表', description: '链表相关题目', count: 80 },
  { id: 3, name: '树', description: '树结构相关题目', count: 95 },
  { id: 4, name: '图', description: '图论相关题目', count: 65 },
  { id: 5, name: '动态规划', description: '动态规划题目', count: 75 },
  { id: 6, name: '贪心算法', description: '贪心算法题目', count: 60 },
  { id: 7, name: '回溯算法', description: '回溯算法题目', count: 45 },
  { id: 8, name: '字符串', description: '字符串处理题目', count: 90 },
])

const handleSelect = (key: string) => {
  switch (key) {
    case '1':
      router.push('/problems')
      break
    case '2':
      router.push('/problems/category')
      break
    case '3':
      router.push('/about')
      break
  }
}

const goToCategory = (categoryName: string) => {
  router.push(`/problems?category=${categoryName}`)
}

onMounted(() => {
  // 使用静态数据，无需请求接口
})
</script>

<style scoped lang="scss">
.category-view {
  min-height: 100vh;

  .category-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .category-header {
    text-align: center;
    margin-bottom: 40px;

    h1 {
      margin: 0 0 10px 0;
      color: $text-primary;
    }

    p {
      margin: 0;
      color: $text-tertiary;
      font-size: 16px;
    }
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }

  .category-card {
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-heavy;
    }
  }

  .category-info {
    h3 {
      margin: 0 0 10px 0;
      color: $color-primary;
      font-size: 18px;
    }
  }

  .category-description {
    margin: 0 0 15px 0;
    color: $text-secondary;
    font-size: 14px;
    line-height: 1.5;
  }

  .category-stats {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
