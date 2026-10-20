import { defineStore } from 'pinia';
import {
  getTasksByClazzId,
  updateTask,
  deleteTask,
  finishTask,
  addTask,
  getTaskById,
  addTaskProblems,
  removeTaskProblems,
  getTaskCompletion,
} from '@/api/task';
import type {
  Task,
  TaskCardItem,
  TaskTableRow,
  UpdateTaskRequest,
  FinishTaskRequest,
  TaskType,
  AddTaskRequest,
  AddTaskProblemsRequest,
  RemoveTaskProblemsRequest,
  PageQueryTaskCompletionRequest,
  TaskCompletionResponse,
  PageQueryTaskCompletionResponse,
} from '@/types/task';
import { TaskStatus } from '@/types/task';
import { ElMessage } from 'element-plus';

/**
 * 任务类型映射
 */
function mapTypeToLabel(type: TaskType): { label: string; type: '' | 'success' | 'info'; icon: string } {
  switch (type) {
    case 1: // 题单
      return { label: '题单', type: 'success', icon: 'DocumentCopy' };
    case 2: // 视频
      return { label: '视频', type: 'info', icon: 'VideoCamera' };
    default:
      return { label: '未知', type: '', icon: 'QuestionFilled' };
  }
}

/**
 * 任务状态映射
 */
function mapStatusToLabel(status: TaskStatus): { label: string; type: '' | 'success' | 'warning' | 'info' } {
  switch (status) {
    case 0: // 未开始
      return { label: '未开始', type: 'info' };
    case 1: // 进行中
      return { label: '进行中', type: 'warning' };
    case 2: // 已结束
      return { label: '已结束', type: '' };
    default:
      return { label: '未知', type: '' };
  }
}

/**
 * 格式化时间
 */
function formatTime(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * 计算完成进度百分比
 */
function calculateProgress(finishCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.round((finishCount / totalCount) * 100);
}

/**
 * 将任务实体映射为表格行数据
 */
function toTableRow(task: Task): TaskTableRow {
  const typeInfo = mapTypeToLabel(task.type);
  const statusInfo = mapStatusToLabel(task.status ?? TaskStatus.NOT_STARTED);
  const relationCount = task.questions?.length || task.relation_ids?.length || 0;
  const finishCount = task.finish_ids?.length || 0;

  return {
    id: task.id || '',
    title: task.title,
    description: task.description || '-',
    typeLabel: typeInfo.label,
    typeType: typeInfo.type,
    startTime: formatTime(task.start_time),
    endTime: formatTime(task.end_time),
    statusLabel: statusInfo.label,
    statusType: statusInfo.type,
    progress: `${finishCount}/${relationCount}`,
    relationCount,
    finishCount,
  };
}

/**
 * 将任务实体映射为卡片数据
 */
function toCardItem(task: Task): TaskCardItem {
  const typeInfo = mapTypeToLabel(task.type);
  const statusInfo = mapStatusToLabel(task.status ?? TaskStatus.NOT_STARTED);
  const relationCount = task.questions?.length || task.relation_ids?.length || 0;
  const finishCount = task.finish_ids?.length || 0;

  return {
    id: task.id || '',
    title: task.title,
    description: task.description || '暂无描述',
    typeLabel: typeInfo.label,
    typeType: typeInfo.type,
    typeIcon: typeInfo.icon,
    startTime: formatTime(task.start_time),
    endTime: formatTime(task.end_time),
    statusLabel: statusInfo.label,
    statusType: statusInfo.type,
    progress: calculateProgress(finishCount, relationCount),
    relationCount,
    finishCount,
    relationIds: task.relation_ids || [],
    finishIds: task.finish_ids || [],
  };
}

/**
 * 任务管理 Store
 * - 负责任务的查询、创建、更新、删除、完成等操作
 * - 提供表格和卡片两种数据格式
 */
export const useTaskStore = defineStore('task', {
  state: () => ({
    /** 原始任务列表 */
    rawList: [] as Task[],
    /** 表格任务列表 */
    tableList: [] as TaskTableRow[],
    /** 卡片任务列表 */
    cardList: [] as TaskCardItem[],
    /** 当前班级ID */
    currentClazzId: '',
    /** 加载状态 */
    loading: false,
    /** 当前任务详情 */
    currentTask: null as Task | null,
    /** 任务完成情况列表 */
    completionList: [] as TaskCompletionResponse[],
    /** 完成情况分页信息 */
    completionPagination: {
      total: 0,
      page: 1,
      pageSize: 10,
    },
    /** 完成情况加载状态 */
    completionLoading: false,
  }),
  getters: {
    /** 获取指定任务 */
    getTaskById: (state) => (taskId: string) => {
      return state.rawList.find((t) => t.id === taskId);
    },
    /** 按状态筛选任务 */
    getTasksByStatus: (state) => (status: TaskStatus) => {
      return state.rawList.filter((t) => t.status === status);
    },
    /** 按类型筛选任务 */
    getTasksByType: (state) => (type: TaskType) => {
      return state.rawList.filter((t) => t.type === type);
    },
  },
  actions: {
    /**
     * 加载班级任务列表
     * @param clazzId 班级ID
     */
    async fetchTaskList(clazzId: string) {
      if (!clazzId) {
        return;
      }
      try {
        this.loading = true;
        this.currentClazzId = clazzId;
        
        const data = await getTasksByClazzId(clazzId);
        
        // API返回的数据应该是Task数组（响应拦截器已自动提取data字段）
        this.rawList = Array.isArray(data) ? data : [];
        this.tableList = this.rawList.map(toTableRow);
        this.cardList = this.rawList.map(toCardItem);
        
      } catch (e: any) {
        ElMessage.error(e?.message || '加载任务列表失败');
        this.rawList = [];
        this.tableList = [];
        this.cardList = [];
        throw Error('加载任务列表失败');
      } finally {
        this.loading = false;
      }
    },
    /**
     * 获取任务详情
     * @param clazzId 班级ID
     * @param taskId 任务ID
     */
    async fetchTaskDetail(clazzId: string, taskId: string) {
      try {
        this.loading = true;
        const response = await getTaskById(clazzId, taskId);

        // 根据你的API响应结构调整
        // 如果返回的是 { code, data, message } 结构
        if (response && (response as any).data) {
          this.currentTask = (response as any).data;
        } else {
          this.currentTask = response as Task;
        }

        return this.currentTask;
      } catch (error: any) {
        console.error('获取任务详情失败:', error);
        ElMessage.error(error?.message || '获取任务详情失败');
        this.currentTask = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    /** 获取任务类型标签 */
    getTaskTypeLabel(type: number): string {
      switch (type) {
        case 1: return '题单';
        case 2: return '视频';
        case 3: return '文档';
        default: return '任务';
      }
    },

    /** 获取任务类型样式 */
    getTaskTypeType(type: number): '' | 'success' | 'info' | 'warning' {
      switch (type) {
        case 1: return 'success';
        case 2: return 'info';
        case 3: return 'warning';
        default: return '';
      }
    },

    /** 获取任务状态标签 */
    getTaskStatusLabel(status: number): string {
      switch (status) {
        case 0: return '未开始';
        case 1: return '进行中';
        case 2: return '已结束';
        default: return '未知';
      }
    },

    /** 获取任务状态样式 */
    getTaskStatusType(status: number): '' | 'success' | 'info' | 'warning' {
      switch (status) {
        case 0: return 'warning';
        case 1: return 'success';
        case 2: return 'info';
        default: return '';
      }
    },
    /**
     * 清除当前任务详情
     */
    clearCurrentTask() {
      this.currentTask = null;
    },
    /**
     * 获取单个任务详情
     * @param clazzId 班级ID
     * @param taskId 任务ID
     */
    async fetchTaskById(clazzId: string, taskId: string) {
      try {
        this.loading = true;
        const data = await getTaskById(clazzId, taskId);

        // 新的API直接返回Task对象
        return data as Task;
      } catch (e: any) {
        ElMessage.error(e?.message || '获取任务详情失败');
        throw e;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 刷新当前班级任务列表
     */
    async refresh() {
      if (this.currentClazzId) {
        await this.fetchTaskList(this.currentClazzId);
      }
    },

    /**
     * 添加任务
     * @param clazzId 班级ID (用于刷新列表)
     * @param payload 添加任务请求参数
     */
    async add(clazzId: string, payload: AddTaskRequest) {
      try {
        await addTask(payload);
        ElMessage.success('任务添加成功');
        // 刷新当前班级的任务列表
        if (clazzId === this.currentClazzId) {
          await this.refresh();
        }
      } catch (e: any) {
        ElMessage.error(e?.message || '任务添加失败');
        throw e;
      }
    },

    /**
     * 更新任务
     * @param clazzId 班级ID
     * @param taskId 任务ID
     * @param payload 更新任务请求参数
     */
    async update(clazzId: string, taskId: string, payload: UpdateTaskRequest) {
      try {
        await updateTask(clazzId, taskId, payload);
        ElMessage.success('任务更新成功');
        // 如果当前有任务详情且是同一个任务，则只刷新当前任务
        if (this.currentTask && this.currentTask.id === taskId) {
          await this.fetchTaskDetail(clazzId, taskId);
        }
        // 刷新任务列表
        if (this.currentClazzId === clazzId) {
          await this.refresh();
        }
      } catch (e: any) {
        ElMessage.error(e?.message || '任务更新失败');
        throw e;
      }
    },

    /**
     * 删除任务
     * @param clazzId 班级ID
     * @param taskId 任务ID
     */
    async remove(clazzId: string, taskId: string) {
      try {
        await deleteTask(clazzId, taskId);
        ElMessage.success('任务已删除');
        // 如果删除的是当前任务，清除当前任务详情
        if (this.currentTask && this.currentTask.id === taskId) {
          this.currentTask = null;
        }
        // 刷新任务列表
        if (this.currentClazzId) {
          await this.refresh();
        }
      } catch (e: any) {
        ElMessage.error(e?.message || '任务删除失败');
        throw e;
      }
    },

    /**
     * 完成任务
     * @param clazzId 班级ID
     * @param taskId 任务ID
     * @param payload 完成任务请求参数
     */
    async finish(clazzId: string, taskId: string, payload?: FinishTaskRequest) {
      try {
        await finishTask(clazzId, taskId, payload);
        ElMessage.success('任务已完成');
        // 如果当前有任务详情且是同一个任务，则只刷新当前任务
        if (this.currentTask && this.currentTask.id === taskId) {
          await this.fetchTaskDetail(clazzId, taskId);
        }
        // 否则刷新任务列表
        else if (this.currentClazzId) {
          await this.refresh();
        }
      } catch (e: any) {
        ElMessage.error(e?.message || '任务完成失败');
        throw e;
      }
    },

    /**
     * 给任务新增题目
     * @param clazzId 班级ID
     * @param taskId 任务ID
     * @param payload 新增题目请求参数
     */
    async addProblems(clazzId: string, taskId: string, payload: AddTaskProblemsRequest) {
      try {
        await addTaskProblems(clazzId, taskId, payload);
        ElMessage.success('题目添加成功');
        // 只刷新当前任务详情，避免重复调用
        if (this.currentTask && this.currentTask.id === taskId) {
          await this.fetchTaskDetail(clazzId, taskId);
        }
        // 如果当前没有任务详情，则刷新任务列表
        else if (this.currentClazzId) {
          await this.refresh();
        }
      } catch (e: any) {
        ElMessage.error(e?.message || '题目添加失败');
        throw e;
      }
    },

    /**
     * 删除任务中的题目
     * @param clazzId 班级ID
     * @param taskId 任务ID
     * @param payload 删除题目请求参数
     */
    async removeProblems(clazzId: string, taskId: string, payload: RemoveTaskProblemsRequest) {
      try {
        await removeTaskProblems(clazzId, taskId, payload);
        ElMessage.success('题目删除成功');
        // 只刷新当前任务详情，避免重复调用
        if (this.currentTask && this.currentTask.id === taskId) {
          await this.fetchTaskDetail(clazzId, taskId);
        }
        // 如果当前没有任务详情，则刷新任务列表
        else if (this.currentClazzId) {
          await this.refresh();
        }
      } catch (e: any) {
        ElMessage.error(e?.message || '题目删除失败');
        throw e;
      }
    },

    /**
     * 获取任务完成情况
     * @param clazzId 班级ID
     * @param taskId 任务ID
     * @param payload 查询参数
     */
    async fetchTaskCompletion(clazzId: string, taskId: string, payload: PageQueryTaskCompletionRequest) {
      try {
        this.completionLoading = true;
        const response = await getTaskCompletion(clazzId, taskId, payload);

        this.completionList = response.completion;
        this.completionPagination = {
          total: response.total,
          page: response.page_num,
          pageSize: response.page_size,
        };

        return response;
      } catch (error: any) {
        // 如果是 404 错误，可能是后端未实现该接口，静默失败
        if (error.response?.status === 404) {
          console.warn('获取任务完成情况接口不存在 (404)，后端可能未实现该功能');
        } else {
          console.error('获取任务完成情况失败:', error);
          ElMessage.error('获取任务完成情况失败');
        }
        throw error;
      } finally {
        this.completionLoading = false;
      }
    },

    /**
     * 重置状态
     */
    reset() {
      this.rawList = [];
      this.tableList = [];
      this.cardList = [];
      this.currentClazzId = '';
      this.loading = false;
      this.currentTask = null;
      this.completionList = [];
      this.completionPagination = {
        total: 0,
        page: 1,
        pageSize: 10,
      };
      this.completionLoading = false;
    },
  },
});
