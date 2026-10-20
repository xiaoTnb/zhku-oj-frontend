import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getUserStatistics,
  getSystemStatistics,
  getUserStatisticsById,
} from '@/api/statistics';
import type {
  UserStatistics,
  SystemStatistics,
} from '@/types/statistics';
import { ElMessage } from 'element-plus';

/**
 * 统计数据管理 Store
 * - 支持获取当前用户统计数据
 * - 支持获取系统统计数据（管理员）
 * - 支持获取指定用户统计数据
 */
export const useStatisticsStore = defineStore('statistics', () => {
  // 状态
  const currentUserStatistics = ref<UserStatistics | null>(null);
  const systemStatistics = ref<SystemStatistics | null>(null);
  const loading = ref(false);

  /**
   * 获取当前用户统计数据
   */
  const fetchUserStatistics = async () => {
    loading.value = true;
    try {
      const data = await getUserStatistics();
      currentUserStatistics.value = data;
      return data;
    } catch (error: any) {
      ElMessage.error(error?.message || '获取用户统计数据失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取系统统计数据（管理员）
   */
  const fetchSystemStatistics = async () => {
    loading.value = true;
    try {
      const data = await getSystemStatistics();
      systemStatistics.value = data;
      return data;
    } catch (error: any) {
      ElMessage.error(error?.message || '获取系统统计数据失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取指定用户统计数据
   * @param id 用户ID
   */
  const fetchUserStatisticsById = async (id: string) => {
    loading.value = true;
    try {
      const data = await getUserStatisticsById(id);
      return data;
    } catch (error: any) {
      ElMessage.error(error?.message || '获取用户统计数据失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 重置状态
   */
  const reset = () => {
    currentUserStatistics.value = null;
    systemStatistics.value = null;
  };

  return {
    // 状态
    currentUserStatistics,
    systemStatistics,
    loading,

    // 操作
    fetchUserStatistics,
    fetchSystemStatistics,
    fetchUserStatisticsById,
    reset,
  };
});