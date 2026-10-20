import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import * as submitApi from '@/api/submit';
import type {
  SubmitPayload,
  SubmitListParams,
  SubmitDetail,
} from '@/types/submit';

/**
 * 提交记录管理 Store
 * - 支持代码提交评测
 * - 支持提交记录列表查询
 * - 支持提交详情获取
 */
export const useSubmitStore = defineStore('submit', () => {
  // ==================== 状态 ====================
  
  /** 提交记录列表（原始数据） */
  const rawSubmits = ref<SubmitDetail[]>([]);
  
  /** 当前提交详情 */
  const currentSubmit = ref<SubmitDetail | null>(null);
  
  /** 加载状态 */
  const loading = ref(false);
  
  /** 分页信息 */
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(20);
  const totalPage = ref(0);

  // ==================== Getters ====================
  
  /** 提交记录总数 */
  const totalCount = computed(() => total.value);
  
  /** 通过的提交记录 */
  const acceptedSubmits = computed(() => {
    return rawSubmits.value.filter(submit => submit.status === 'accepted');
  });
  
  /** 失败的提交记录 */
  const failedSubmits = computed(() => {
    return rawSubmits.value.filter(submit => 
      submit.status === 'wrong_answer' || 
      submit.status === 'time_limit' || 
      submit.status === 'memory_limit' ||
      submit.status === 'runtime_error' ||
      submit.status === 'compile_error' ||
      submit.status === 'system_error'
    );
  });
  
  /** 通过率 */
  const acceptanceRate = computed(() => {
    if (rawSubmits.value.length === 0) return 0;
    const acceptedCount = acceptedSubmits.value.length;
    return Math.round((acceptedCount / rawSubmits.value.length) * 100);
  });

  // ==================== Actions ====================
  
  /**
   * 提交代码进行评测
   * @param payload 提交参数
   */
  async function create(payload: SubmitPayload) {
    loading.value = true;
    try {
      const response = await submitApi.createSubmit(payload);
      
      // createSubmit 只返回 submit_id 和 message，不返回完整的提交详情
      // 如果需要获取提交详情，需要单独调用 fetchSubmitById
      ElMessage.success(response.message || '代码提交成功');
      
      return response;
    } catch (error: any) {
      ElMessage.error(error?.message || '提交代码失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * 获取提交列表
   * @param params 查询参数
   */
  async function fetchSubmits(params?: SubmitListParams) {
    loading.value = true;
    try {
      const queryParams = {
        page: params?.page || 1,
        page_size: params?.page_size || 20,
        problem_id: params?.problem_id,
        user_id: params?.user_id,
      };
      
      const response: any = await submitApi.getSubmits(queryParams);
      
      if (response.data && response.data.submits) {
        // 标准API响应格式: { code: 200, message: "success", data: { submits: [...], total: 2, page: 1, page_size: 10, total_page: 1 } }
        rawSubmits.value = response.data.submits || [];
        total.value = response.data.total || rawSubmits.value.length;
        page.value = response.data.page || 1;
        pageSize.value = response.data.page_size || 20;
        totalPage.value = response.data.total_page || Math.ceil(total.value / pageSize.value);
      } else if (response.submits) {
        // 直接submits格式: { submits: [...], total: 2, page: 1, page_size: 10, total_page: 1 }
        rawSubmits.value = response.submits || [];
        total.value = response.total || rawSubmits.value.length;
        page.value = response.page || 1;
        pageSize.value = response.page_size || 20;
        totalPage.value = response.total_page || Math.ceil(total.value / pageSize.value);
      } else if (Array.isArray(response)) {
        // 如果直接返回数组
        rawSubmits.value = response;
        total.value = response.length;
        page.value = 1;
        pageSize.value = response.length;
        totalPage.value = 1;
      } else {
        // 兼容其他可能的分页结构
        rawSubmits.value = response.items || response.data || [];
        total.value = response.total || response.total_count || rawSubmits.value.length;
        page.value = response.page || response.current_page || 1;
        pageSize.value = response.page_size || response.per_page || 20;
        totalPage.value = response.total_page || response.total_pages || Math.ceil(total.value / pageSize.value);
      }
      
      return rawSubmits.value;
    } catch (error: any) {
      ElMessage.error(error?.message || '获取提交列表失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取提交详情/评测结果
   * @param id 提交ID
   */
  async function fetchSubmitById(id: string) {
    loading.value = true;
    try {
      const data = await submitApi.getSubmitById(id);
      currentSubmit.value = data;
      
      // 更新列表中的对应项，但使用新的对象而不是直接替换
      const index = rawSubmits.value.findIndex(submit => submit.id === id);
      if (index !== -1) {
        rawSubmits.value[index] = { ...rawSubmits.value[index], ...data };
      }
      
      return data;
    } catch (error: any) {
      ElMessage.error(error?.message || '获取提交详情失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * 根据ID获取提交记录
   * @param id 提交ID
   */
  function getSubmitById(id: string): SubmitDetail | undefined {
    if (currentSubmit.value?.id === id) {
      return currentSubmit.value;
    }
    return rawSubmits.value.find(submit => submit.id === id);
  }
  
  /**
   * 清空当前提交记录列表
   */
  function clearSubmits() {
    rawSubmits.value = [];
    currentSubmit.value = null;
    total.value = 0;
    page.value = 1;
    pageSize.value = 20;
    totalPage.value = 0;
  }

  // ==================== 导出 ====================
  
  return {
    // 状态
    rawSubmits,
    currentSubmit,
    loading,
    total,
    page,
    pageSize,
    totalPage,
    
    // Getters
    totalCount,
    acceptedSubmits,
    failedSubmits,
    acceptanceRate,
    
    // Actions
    create,
    fetchSubmits,
    fetchSubmitById,
    getSubmitById,
    clearSubmits,
  };
});