import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  searchProblems,
  getProblemDetailAggregate,
  getDailyProblem,
  getAdminProblems,
  getProblemDifficultyStats,
  runProblemCode,
} from '@/api/problem';
import { getPublicTags } from '@/api/tag';
import type {
  Problem,
  ProblemBrief,
  ProblemListQuery,
  ProblemSearchQuery,
  ProblemListResponse,
  ProblemTableRow,
  ProblemCardItem,
  Category,
  Difficulty,
  CreateProblemRequest,
  UpdateProblemRequest,
  AdminProblemListQuery,
  ProblemDetailAggregate,
  DailyProblem,
  ProblemDifficultyStats,
  RunCodePayload,
  RunCodeResult,
} from '@/types/problem';
import type { Tag } from '@/types/tag';
import { ElMessage } from 'element-plus';

/**
 * 难度映射
 */
function mapDifficultyToTag(difficulty?: Difficulty): {
  label: string;
  type: '' | 'success' | 'warning' | 'danger';
  color: string;
  icon: string;
} {
  if (!difficulty) {
    return { label: '未知', type: '', color: '#909399', icon: '❓' };
  }
  switch (difficulty) {
    case 'easy':
      return { label: '简单', type: 'success', color: '#67c23a', icon: '✅' };
    case 'medium':
      return { label: '中等', type: 'warning', color: '#e6a23c', icon: '⚠️' };
    case 'hard':
      return { label: '困难', type: 'danger', color: '#f56c6c', icon: '❌' };
    default:
      return { label: '未知', type: '', color: '#909399', icon: '❓' };
  }
}

/**
 * 计算通过率
 */
function calculateAcRate(acceptedCount: number, submitCount: number): number {
  if (submitCount === 0) return 0;
  return Math.round((acceptedCount / submitCount) * 100 * 10) / 10;
}

/**
 * 将题目实体映射为表格行数据（保持原始字段结构）
 */
function toTableRow(problem: ProblemBrief): ProblemTableRow {
  const diffInfo = mapDifficultyToTag(problem.difficulty);
  const acceptedCount = problem.accepted_count || problem.ac_count || 0;
  const submitCount = problem.submit_count || 0;
  const acRate = problem.ac_rate || calculateAcRate(acceptedCount, submitCount);

  return {
    ...problem, // 保留所有原始字段
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty, // 保持原始 Difficulty 类型
    difficultyLabel: diffInfo.label, // 添加中文标签
    difficultyType: diffInfo.type,
    tags: problem.tags || [],
    acRate: `${acRate}%`,
    ac_rate: acRate, // 保留数值类型用于计算
    submitCount: submitCount,
    acceptedCount: acceptedCount,
    accepted_count: acceptedCount,
    submit_count: submitCount,
  };
}

/**
 * 将题目实体映射为卡片数据
 */
function toCardItem(problem: ProblemBrief | Problem): ProblemCardItem {
  const diffInfo = mapDifficultyToTag(problem.difficulty);
  const acceptedCount = problem.accepted_count || problem.ac_count || 0;
  const submitCount = problem.submit_count || 0;
  const acRate = problem.ac_rate || calculateAcRate(acceptedCount, submitCount);
  const description = (problem as Problem).description || '';

  return {
    id: problem.id,
    title: problem.title,
    difficulty: diffInfo.label,
    difficultyColor: diffInfo.color,
    difficultyIcon: diffInfo.icon,
    tags: problem.tags || [],
    acRate,
    submitCount,
    acceptedCount,
    description: description.length > 100 ? description.substring(0, 100) + '...' : description,
  };
}

/**
 * 题库管理 Store
 * - 支持题目列表分页查询、搜索、筛选
 * - 支持题目的创建、更新、删除操作
 * - 提供表格和卡片两种数据格式
 */
export const useProblemsStore = defineStore('problems', () => {
  // 状态
  const rawProblems = ref<ProblemBrief[]>([]);
  const tableList = ref<ProblemTableRow[]>([]);
  const cardList = ref<ProblemCardItem[]>([]);
  const categories = ref<Category[]>([]);
  const currentProblem = ref<Problem | null>(null);
  const loading = ref(false);
  const difficultyStats = ref<ProblemDifficultyStats | null>(null);
  
  // 运行代码相关状态
  const runCodeLoading = ref(false);
  const runCodeResult = ref<RunCodeResult | null>(null);
  
  // 分页信息
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(20); // 默认每页20条
  const totalPage = ref(0);
  
  // 最近一次查询条件
  const lastQuery = ref<ProblemListQuery>({});

  // 计算属性
  const totalProblems = computed(() => total.value);
  
  const problemsByDifficulty = computed(() => {
    const stats = difficultyStats.value;
    if (stats) {
      return {
        easy: stats.easy || 0,
        medium: stats.medium || 0,
        hard: stats.hard || 0,
      };
    }
    return {
      easy: rawProblems.value.filter((p) => p.difficulty === 'easy').length,
      medium: rawProblems.value.filter((p) => p.difficulty === 'medium').length,
      hard: rawProblems.value.filter((p) => p.difficulty === 'hard').length,
    };
  });
  
  /**
   * 按ID获取题目简要信息
   */
  const getProblemBriefById = computed(() => (id: string) => {
    return rawProblems.value.find((p) => p.id === id);
  });

  // 操作
  /**
   * 加载题目列表（分页）
   * @param params 查询参数
   */
  const fetchProblems = async (params: ProblemListQuery = {}) => {
    loading.value = true;
    try {
      const query: ProblemListQuery = {
        page: params.page ?? page.value,
        page_size: params.page_size ?? pageSize.value,
        difficulty: params.difficulty,
        tags: params.tags,
        include_private: params.include_private,
      };
      
      const data = await getProblems(query);
      
      rawProblems.value = data.problems || [];
      total.value = data.total ?? 0;
      page.value = data.page ?? query.page ?? 1;
      pageSize.value = data.page_size ?? query.page_size ?? 20;
      totalPage.value = data.total_page ?? 0;
      
      // 转换为UI层数据
      tableList.value = rawProblems.value.map(toTableRow);
      cardList.value = rawProblems.value.map(toCardItem);
      
      lastQuery.value = query;
    } catch (error: any) {
      ElMessage.error(error?.message || '获取题目列表失败');
      rawProblems.value = [];
      tableList.value = [];
      cardList.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 搜索题目
   * @param params 搜索参数
   */
  const searchProblemList = async (params: ProblemSearchQuery) => {
    loading.value = true;
    try {
      const data = await searchProblems(params);
      
      rawProblems.value = data.problems || [];
      total.value = data.total ?? 0;
      page.value = data.page ?? params.page ?? 1;
      pageSize.value = data.page_size ?? params.page_size ?? 20;
      totalPage.value = data.total_page ?? 0;
      
      tableList.value = rawProblems.value.map(toTableRow);
      cardList.value = rawProblems.value.map(toCardItem);
    } catch (error: any) {
      ElMessage.error(error?.message || '搜索题目失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 加载题目分类
   */
  const fetchCategories = async () => {
    try {
      const res = await getPublicTags();

      // 兼容两种响应格式：
      // 1. { tags: [...] }
      // 2. [...] 直接返回数组
      let tags: Tag[] = [];
      if (Array.isArray(res)) {
        tags = res;
      } else if (res.tags && Array.isArray(res.tags)) {
        tags = res.tags;
      }

      // 将 Tag 转换为 Category 格式
      // 如果有 count 字段，按 count 降序排序，取前8个热门分类
      // 否则显示全部
      let sortedTags = tags;
      if (tags.some(tag => typeof tag.count === 'number')) {
        // 有 count 字段，按使用次数降序排序
        sortedTags = [...tags].sort((a, b) => (b.count || 0) - (a.count || 0));
      }

      // 取前8个作为热门分类
      const Tags = sortedTags.slice(0, 8);

      categories.value = Tags.map((tag: Tag, index: number) => ({
        id: typeof tag.id === 'string' ? index + 1 : tag.id,
        name: tag.name,
        description: tag.desc || tag.name,
        count: tag.count || 0,
      }));
    } catch (error: any) {
      console.error('获取分类列表失败:', error);
      ElMessage.error('获取分类列表失败');
    }
  };

  /**
   * 按ID加载题目详情
   * @param id 题目ID
   */
  const fetchProblemById = async (id: string) => {
    loading.value = true;
    try {
      const problem = await getProblemById(id);
      currentProblem.value = problem;
      return problem;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || '获取题目详情失败';
      ElMessage.error(errorMsg);
      currentProblem.value = null;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 创建题目
   * @param payload 创建题目请求参数
   */
  const create = async (payload: CreateProblemRequest) => {
    try {
      const result = await createProblem(payload);
      ElMessage.success('题目创建成功');
      return result;
    } catch (error: any) {
      ElMessage.error(error?.message || '题目创建失败');
      throw error;
    }
  };

  /**
   * 更新题目
   * @param id 题目ID
   * @param payload 更新题目请求参数
   */
  const update = async (id: string, payload: UpdateProblemRequest) => {
    try {
      const result = await updateProblem(id, payload);
      ElMessage.success('题目更新成功');
      return result;
    } catch (error: any) {
      ElMessage.error(error?.message || '题目更新失败');
      throw error;
    }
  };

  /**
   * 删除题目
   * @param id 题目ID
   */
  const remove = async (id: string) => {
    try {
      const result = await deleteProblem(id);
      ElMessage.success('题目已删除');
      return result;
    } catch (error: any) {
      ElMessage.error(error?.message || '题目删除失败');
      throw error;
    }
  };

  /**
   * 获取题目详情聚合信息
   * @param id 题目ID
   */
  const fetchProblemDetailAggregate = async (id: string) => {
    loading.value = true;
    try {
      const data = await getProblemById(id);
      return data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || '获取题目详情聚合信息失败';
      ElMessage.error(errorMsg);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取每日推荐题目
   */
  const fetchDailyProblem = async () => {
    try {
      const data = await getDailyProblem();
      return data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || '获取每日推荐题目失败';
      ElMessage.error(errorMsg);
      throw error;
    }
  };

  /**
   * 获取管理员端题目列表
   * @param params 管理员端查询参数
   */
  const fetchAdminProblems = async (params: AdminProblemListQuery = {}) => {
    loading.value = true;
    try {
      const query: AdminProblemListQuery = {
        page: params.page ?? page.value,
        page_size: params.page_size ?? pageSize.value,
        difficulty: params.difficulty,
        tags: params.tags,
      };
      
      const data = await getAdminProblems(query);
      
      rawProblems.value = data.problems || [];
      total.value = data.total ?? 0;
      page.value = data.page ?? query.page ?? 1;
      pageSize.value = data.page_size ?? query.page_size ?? 20;
      totalPage.value = data.total_page ?? 0;
      
      // 转换为UI层数据
      tableList.value = rawProblems.value.map(toTableRow);
      cardList.value = rawProblems.value.map(toCardItem);
      
      lastQuery.value = query;
      return data;
    } catch (error: any) {
      ElMessage.error(error?.message || '获取管理员端题目列表失败');
      rawProblems.value = [];
      tableList.value = [];
      cardList.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取题目难度统计
   */
  const fetchProblemDifficultyStats = async () => {
    loading.value = true;
    try {
      const data = await getProblemDifficultyStats();
      difficultyStats.value = data;
      return data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || '获取题目难度统计失败';
      ElMessage.error(errorMsg);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 按标签过滤
   */
  const filterProblemsByTag = (tag: string) => {
    return rawProblems.value.filter((p) => {
      if (!p.tags) return false;
      return p.tags.includes(tag);
    });
  };

  /**
   * 按难度过滤
   */
  const filterProblemsByDifficulty = (difficulty: Difficulty) => {
    return rawProblems.value.filter((p) => p.difficulty === difficulty);
  };

  /**
   * 刷新当前列表
   */
  const refresh = async () => {
    await fetchProblems(lastQuery.value);
  };

  /**
   * 重置状态
   */
  const reset = () => {
    rawProblems.value = [];
    tableList.value = [];
    cardList.value = [];
    currentProblem.value = null;
    total.value = 0;
    page.value = 1;
    pageSize.value = 20;
    totalPage.value = 0;
    lastQuery.value = {};
    runCodeResult.value = null;
    difficultyStats.value = null;
  };

  /**
   * 运行代码
   * @param problemId 题目ID
   * @param payload 运行代码的参数
   */
  const runCode = async (problemId: string, payload: RunCodePayload) => {
    runCodeLoading.value = true;
    runCodeResult.value = null;
    try {
      const response = await runProblemCode(problemId, payload);
      runCodeResult.value = response;
      return response;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || '运行代码失败';
      ElMessage.error(errorMsg);
      throw error;
    } finally {
      runCodeLoading.value = false;
    }
  };

  return {
    // 状态
    rawProblems,
    tableList,
    cardList,
    categories,
    difficultyStats,
    currentProblem,
    loading,
    total,
    page,
    pageSize,
    totalPage,
    lastQuery,
    
    // 运行代码相关状态
    runCodeLoading,
    runCodeResult,

    // 计算属性
    totalProblems,
    problemsByDifficulty,
    getProblemBriefById,

    // 操作
    fetchProblems,
    searchProblemList,
    fetchCategories,
    fetchProblemById,
    create,
    update,
    remove,
    filterProblemsByTag,
    filterProblemsByDifficulty,
    refresh,
    reset,
    runCode,
    
    // 新增操作
    fetchProblemDetailAggregate,
    fetchDailyProblem,
    fetchAdminProblems,
    fetchProblemDifficultyStats,
  };
});