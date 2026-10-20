<template>
  <div class="problems-container">
    <!-- 顶部导航栏由外层布局提供，这里不再重复 -->

    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 左侧边栏 -->
      <ProblemSidebar
        :total-problems="totalProblems"
        :problems-by-difficulty="problemsByDifficulty"
        @start-daily="handleStartDaily"
      />

      <!-- 主内容区 -->
      <el-main class="main-content">
        <!-- 筛选和搜索区域 -->
        <ProblemFilter
          v-model:selected-difficulty="selectedDifficulty"
          v-model:selected-category="selectedCategory"
          v-model:search-keyword="searchKeyword"
          :total-count="totalProblems"
          :categories="categories"
        />

        <!-- 题目列表 -->
        <ProblemTable
          :problems="displayProblems"
          :loading="loading"
          :current-page="currentPage"
          :page-size="pageSize"
          :total-count="totalProblems"
          @update:current-page="handlePageChange"
          @update:page-size="handleSizeChange"
          @start-coding="handleStartCoding"
        />
      </el-main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProblemsStore } from '@/stores/problems'
import type { Category, Difficulty, ProblemBrief } from '@/types/problem'

// 导入组件
import ProblemSidebar from './components/ProblemSidebar.vue'
import ProblemFilter from './components/ProblemFilter.vue'
import ProblemTable from './components/ProblemTable.vue'

const router = useRouter()
const route = useRoute()
const store = useProblemsStore()

// 筛选相关状态
const selectedDifficulty = ref<Difficulty | ''>('')
const selectedCategory = ref<Category | null>(null)
const searchKeyword = ref('')

// 计算属性
const loading = computed(() => store.loading)
const totalProblems = computed(() => store.total)
const problemsByDifficulty = computed(() => store.problemsByDifficulty)
const categories = computed(() => store.categories)
const currentPage = computed(() => store.page)
const pageSize = computed(() => store.pageSize)
const displayProblems = computed(() => store.tableList)

// 事件处理方法
const handleStartDaily = (problemId: string) => {
  const routeUrl = router.resolve(`/editor/${problemId}`)
  window.open(routeUrl.href, '_blank')
}

const handleStartCoding = (problemId: string) => {
  const routeUrl = router.resolve(`/editor/${problemId}`)
  window.open(routeUrl.href, '_blank')
}

const handlePageChange = (page: number) => {
  fetchProblems({ page })
  scrollToTop()
}

const scrollToTop = () => {
  window.scrollTo({
    top: 100,
    behavior: 'smooth'
  })
}

const handleSizeChange = (size: number) => {
  fetchProblems({ page: 1, page_size: size })
}

/**
 * 构建搜索关键词 - 支持题目和分类的统一搜索
 */
const buildSearchKeyword = () => {
  return searchKeyword.value?.trim() || undefined
}

/**
 * 统一的搜索功能 - 始终使用搜索接口
 */
const handleSearch = () => {
  store.searchProblemList({
    keyword: buildSearchKeyword(),
    tags: selectedCategory.value ? selectedCategory.value.name : undefined,
    difficulty: selectedDifficulty.value || undefined,
    page: 1,
    page_size: pageSize.value
  })
  scrollToTop()
}

/**
 * 查询题目列表 - 仅用于初始加载和分页
 */
const fetchProblems = async (params: any = {}) => {
  // 如果有任何搜索条件，使用搜索接口
  if (searchKeyword.value || selectedDifficulty.value || selectedCategory.value) {
    await store.searchProblemList({
      keyword: buildSearchKeyword(),
      tags: selectedCategory.value ? selectedCategory.value.name : undefined,
      difficulty: selectedDifficulty.value || undefined,
      page: params.page ?? 1,
      page_size: params.page_size ?? pageSize.value
    })
  } else {
    // 没有搜索条件时使用普通列表接口
    await store.fetchProblems({
      page: params.page ?? currentPage.value,
      page_size: params.page_size ?? pageSize.value
    })
  }
}

// 监听筛选条件变化
watch([selectedDifficulty, selectedCategory], () => {
  handleSearch()
})

// 监听搜索关键词变化（防抖）
let searchTimer: number | null = null
watch(searchKeyword, (newKeyword) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = window.setTimeout(() => {
    handleSearch()
  }, 300)
})

// 监听路由查询参数变化
// watch(() => route.query.keyword, (newKeyword) => {
//   if (newKeyword && newKeyword !== searchKeyword.value) {
//     searchKeyword.value = newKeyword as string
//     handleSearch()
//   }
// }, { immediate: false })

// 生命周期
onMounted(async () => {
  // 检查路由查询参数中是否有搜索关键词
  // const routeKeyword = route.query.keyword as string;
  // if (routeKeyword) {
  //   searchKeyword.value = routeKeyword;
  //   // 如果有搜索关键词，直接执行搜索
  //   handleSearch();
  // } else {
  //   // 没有搜索关键词时加载默认数据
  //   await fetchProblems();
  // }
  
  // 直接加载默认数据，忽略路由参数
  await fetchProblems();
  
  await Promise.all([
    store.fetchProblemDifficultyStats(),
    store.fetchCategories()
  ]);
});
</script>

<style scoped lang="scss">
.problems-container {
  min-height: 100vh;
  background-color: $bg-primary;

  .main-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    gap: 24px;
    padding: 24px;

    .main-content {
      flex: 1;
      padding: 0;
    }
  }
}
</style>
