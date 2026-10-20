import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import * as testApi from '@/api/test';
import type {
  TestCase,
  CreateTestCase,
  CreateTestCaseBatch,
  UpdateTestCase,
} from '@/types/test';

/**
 * 测试用例管理 Store
 * - 支持测试用例的增删改查操作
 * - 支持批量创建测试用例
 * - 提供测试用例的分类和统计功能
 */
export const useTestCaseStore = defineStore('testCase', () => {
  // ==================== 状态 ====================
  
  /** 测试用例列表（原始数据） */
  const rawTestCases = ref<TestCase[]>([]);
  
  /** 当前题目ID */
  const currentProblemId = ref<string>('');
  
  /** 加载状态 */
  const loading = ref(false);

  // ==================== Getters ====================
  
  /** 样例用例列表 */
  const sampleTestCases = computed(() => {
    return rawTestCases.value.filter(tc => tc.is_sample);
  });
  
  /** 非样例用例列表 */
  const hiddenTestCases = computed(() => {
    return rawTestCases.value.filter(tc => !tc.is_sample);
  });
  
  /** 测试用例总数 */
  const totalCount = computed(() => rawTestCases.value.length);
  
  /** 样例数量 */
  const sampleCount = computed(() => sampleTestCases.value.length);
  
  /** 隐藏用例数量 */
  const hiddenCount = computed(() => hiddenTestCases.value.length);
  
  /** 总分数 */
  const totalScore = computed(() => {
    return rawTestCases.value.reduce((sum, tc) => sum + tc.score, 0);
  });

  // ==================== Actions ====================
  
  /**
   * 获取题目的测试用例列表
   * @param problemId 题目ID
   */
  async function fetchTestCasesByProblemId(problemId: string) {
    loading.value = true;
    try {
      const data = await testApi.getTestCasesByProblemId(problemId);
      // API返回格式: { test_cases: TestCase[], total: number }
      // 需要提取test_cases数组
      const testCases = (data as any)?.test_cases || data;
      rawTestCases.value = Array.isArray(testCases) ? testCases : [];
      currentProblemId.value = problemId;
      return testCases;
    } catch (error: any) {
      console.error('获取测试用例列表失败:', error);
      ElMessage.error(error?.message || '获取测试用例列表失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * 获取单个测试用例详情
   * @param id 测试用例ID
   */
  async function fetchTestCaseById(id: string) {
    loading.value = true;
    try {
      const data = await testApi.getTestCaseById(id);
      // 更新列表中的对应项
      const index = rawTestCases.value.findIndex(tc => tc.id === id);
      if (index !== -1) {
        rawTestCases.value[index] = data;
      }
      return data;
    } catch (error: any) {
      console.error('获取测试用例详情失败:', error);
      ElMessage.error(error?.message || '获取测试用例详情失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * 创建测试用例
   * @param payload 创建参数
   */
  async function create(payload: CreateTestCase) {
    loading.value = true;
    try {
      const data = await testApi.createTestCase(payload);
      rawTestCases.value.push(data);
      ElMessage.success('创建测试用例成功');
      return data;
    } catch (error: any) {
      console.error('创建测试用例失败:', error);
      ElMessage.error(error?.message || '创建测试用例失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * 批量创建测试用例
   * @param payload 批量创建参数
   */
  async function createBatch(payload: CreateTestCaseBatch) {
    loading.value = true;
    try {
      const data = await testApi.createTestCaseBatch(payload);
      rawTestCases.value.push(...data);
      ElMessage.success(`成功创建 ${data.length} 个测试用例`);
      return data;
    } catch (error: any) {
      console.error('批量创建测试用例失败:', error);
      ElMessage.error(error?.message || '批量创建测试用例失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * 更新测试用例
   * @param id 测试用例ID
   * @param payload 更新参数
   */
  async function update(id: string, payload: UpdateTestCase) {
    loading.value = true;
    try {
      const data = await testApi.updateTestCase(id, payload);
      // 更新列表中的对应项
      const index = rawTestCases.value.findIndex(tc => tc.id === id);
      if (index !== -1) {
        rawTestCases.value[index] = data;
      }
      ElMessage.success('更新测试用例成功');
      return data;
    } catch (error: any) {
      console.error('更新测试用例失败:', error);
      ElMessage.error(error?.message || '更新测试用例失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * 删除测试用例
   * @param id 测试用例ID
   */
  async function remove(id: string) {
    loading.value = true;
    try {
      await testApi.deleteTestCase(id);
      // 从列表中移除
      const index = rawTestCases.value.findIndex(tc => tc.id === id);
      if (index !== -1) {
        rawTestCases.value.splice(index, 1);
      }
      ElMessage.success('删除测试用例成功');
    } catch (error: any) {
      console.error('删除测试用例失败:', error);
      ElMessage.error(error?.message || '删除测试用例失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * 根据ID获取测试用例
   * @param id 测试用例ID
   */
  function getTestCaseById(id: string): TestCase | undefined {
    return rawTestCases.value.find(tc => tc.id === id);
  }
  
  /**
   * 清空当前测试用例列表
   */
  function clearTestCases() {
    rawTestCases.value = [];
    currentProblemId.value = '';
  }

  // ==================== 导出 ====================
  
  return {
    // 状态
    rawTestCases,
    currentProblemId,
    loading,
    
    // Getters
    sampleTestCases,
    hiddenTestCases,
    totalCount,
    sampleCount,
    hiddenCount,
    totalScore,
    
    // Actions
    fetchTestCasesByProblemId,
    fetchTestCaseById,
    create,
    createBatch,
    update,
    remove,
    getTestCaseById,
    clearTestCases,
  };
});