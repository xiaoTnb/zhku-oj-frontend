<template>
  <div class="my-tasks">
    <!-- 页头 -->
    <section class="page-header">
      <div class="header-left">
        <h1 class="title">我的任务</h1>
        <p class="subtitle">查看和管理您的所有任务</p>
      </div>
      <div class="header-right">
        <el-button @click="onRefresh" :loading="loading">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </section>

    <!-- 筛选栏 -->
    <section class="filters">
      <div class="filters-left">
        <el-select v-model="filterState" placeholder="完成情况" clearable style="width: 150px" @change="onFilterChange">
          <el-option label="未完成" :value="0" />
          <el-option label="已完成" :value="1" />
        </el-select>

        <el-select v-model="filterType" placeholder="任务类型" clearable style="width: 150px" @change="onFilterChange">
          <el-option label="题单" :value="1" />
          <el-option label="视频" :value="2" />
        </el-select>

        <el-select v-model="filterStatus" placeholder="任务状态" clearable style="width: 150px" @change="onFilterChange">
          <el-option label="未开始" :value="0" />
          <el-option label="进行中" :value="1" />
          <el-option label="已结束" :value="2" />
        </el-select>
      </div>


    </section>

    <!-- 任务列表 -->
    <section class="tasks-list" v-loading="loading">
      <div v-if="filteredTasks.length > 0" class="tasks-grid">
        <el-card
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-card"
          shadow="hover"
          @click="goToTaskDetail(task)"
        >
          <div class="task-header">
            <div class="task-title-row">
              <h3 class="task-title">{{ task.title }}</h3>
              <el-tag :type="getTaskStateType(task.state)" size="small">
                {{ getTaskStateLabel(task.state) }}
              </el-tag>
            </div>
            <div class="task-meta-row">
              <el-tag :type="getTaskTypeColor(task.type)" size="small" effect="plain">
                {{ getTaskTypeLabel(task.type) }}
              </el-tag>
              <el-tag :type="getTimeStatusType(task)" size="small" effect="plain">
                {{ getStatusLabel(task.status) }}
              </el-tag>
            </div>
          </div>

          <p v-if="task.description" class="task-description">{{ task.description }}</p>

          <div class="task-footer">
            <div class="task-info">

              <div v-if="task.end_time || task.deadline" class="info-item">
                <el-icon>
                  <Clock />
                </el-icon>
                <span>{{ formatDeadline(task.end_time || task.deadline) }}</span>
              </div>
            </div>
            <el-button type="primary" size="small" @click.stop="goToTaskDetail(task)">
              查看详情
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="暂无任务" :image-size="120">
        <p class="empty-hint">调整筛选条件或创建新任务</p>
      </el-empty>
    </section>

    <!-- 分页 -->
    <section class="pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onSizeChange"
        @current-change="onPageChange"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Refresh,
  Clock,
  View
} from '@element-plus/icons-vue';
import { getUserTasks } from '@/api/user';

import type {
  UserTask,
  GetUserTasksParams,
  UserTaskState,
  UserTaskType,
  UserTaskStatus
} from '@/types/user';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const tasks = ref<UserTask[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);



// 筛选条件
const filterState = ref<UserTaskState | undefined>(undefined);
const filterType = ref<UserTaskType | undefined>(undefined);
const filterStatus = ref<UserTaskStatus | undefined>(undefined);
const filterClazzId = ref<string | undefined>(undefined);

/** 根据时间计算任务状态（进行中/已结束/未开始） */
function calculateTaskStatus(task: UserTask): '未开始' | '进行中' | '已结束' {
  const now = new Date();
  const startTime = task.start_time ? new Date(task.start_time) : null;
  const endTime = task.end_time || task.deadline;

  // 没有开始时间
  if (!startTime) {
    if (!endTime) return '进行中'; // 没有截止时间，默认进行中
    const end = new Date(endTime);
    return now < end ? '进行中' : '已结束';
  }

  // 没有结束时间
  if (!endTime) {
    return now < startTime ? '未开始' : '进行中';
  }

  // 既有开始时间又有结束时间
  const end = new Date(endTime);
  if (now < startTime) return '未开始';
  if (now > end) return '已结束';
  return '进行中';
}



// 筛选后的任务列表（后端已筛选，前端直接显示）
const filteredTasks = computed(() => {
  return tasks.value;
});

/** 获取任务状态标签文本 */
function getTaskStateLabel(state?: UserTaskState): string {
  switch (state) {
    case 0: return '未完成';
    case 1: return '已完成';
    default: return '未知';
  }
}

/** 获取任务状态标签类型 */
function getTaskStateType(state?: UserTaskState): 'success' | 'info' | 'warning' {
  switch (state) {
    case 1: return 'success';  // 已完成
    case 0: return 'warning';  // 未完成
    default: return 'info';
  }
}

/** 获取任务类型标签文本 */
function getTaskTypeLabel(type?: UserTaskType): string {
  switch (type) {
    case 1: return '题单';
    case 2: return '视频';
    default: return '未知';
  }
}

/** 获取任务类型标签颜色 */
function getTaskTypeColor(type?: UserTaskType): 'primary' | 'success' | 'info' {
  switch (type) {
    case 1: return 'primary';  // 题单
    case 2: return 'success';  // 视频
    default: return 'info';
  }
}

/** 获取任务状态标签文本 */
function getStatusLabel(status?: UserTaskStatus): string {
  switch (status) {
    case 0: return '未开始';
    case 1: return '进行中';
    case 2: return '已结束';
    default: return '未知';
  }
}

/** 获取任务状态标签类型 */
function getTimeStatusType(task: UserTask): 'success' | 'info' | 'warning' {
  switch (task.status) {
    case 0: return 'warning';  // 未开始
    case 1: return 'success';  // 进行中
    case 2: return 'info';    // 已结束
    default: return 'info';
  }
}

/** 格式化截止时间 */
function formatDeadline(deadline?: string): string {
  if (!deadline) return '无截止时间';
  try {
    const date = new Date(deadline);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return `已过期 ${Math.abs(days)} 天`;
    } else if (days === 0) {
      const hours = Math.ceil(diff / (1000 * 60 * 60));
      return `剩余 ${hours} 小时`;
    } else if (days <= 3) {
      return `剩余 ${days} 天`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch {
    return deadline;
  }
}



/** 加载任务列表 */
async function loadTasks() {
  loading.value = true;
  try {
    const params: GetUserTasksParams = {
      page_num: currentPage.value,
      page_size: pageSize.value,
      state: filterState.value,
      type: filterType.value,
      status: filterStatus.value
    };

    console.log('请求参数:', params);
    console.log('filterStatus值:', filterStatus.value, '类型:', typeof filterStatus.value);

    const response = await getUserTasks(params);
    tasks.value = response.tasks || [];
    total.value = response.total || 0;

    // 调试：打印任务数据以检查字段名
    console.log('任务数据:', tasks.value);
    if (tasks.value.length > 0) {
      console.log('第一个任务的status值:', tasks.value[0].status, '类型:', typeof tasks.value[0].status);
    }
  } catch (error: any) {
    console.error('加载任务列表失败:', error);
    ElMessage.error(error?.message || '加载任务列表失败');
  } finally {
    loading.value = false;
  }
}



/** 筛选条件变化 */
function onFilterChange() {
  currentPage.value = 1;
  loadTasks();
}

/** 页码变化 */
function onPageChange(page: number) {
  currentPage.value = page;
  loadTasks();
}

/** 每页数量变化 */
function onSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  loadTasks();
}

/** 刷新 */
function onRefresh() {
  loadTasks();
  ElMessage.success('刷新成功');
}

/** 跳转到任务详情 */
function goToTaskDetail(task: UserTask) {
  const taskId = task.id;
  const clazzId = task.clazz_ids;
  console.log('任务ID:', taskId, '班级ID:', clazzId);
  if (!taskId || !clazzId) {
    ElMessage.warning('任务信息不完整，无法查看详情');
    return;
  }

  router.push({
    name: 'StudentTaskDetail',
    params: { id: taskId },
    query: { clazzId: clazzId }
  });
}

onMounted(() => {
  loadTasks(); // 加载任务列表（会在内部加载班级信息）
});
</script>

<style scoped>
.my-tasks {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
}

/* 页头 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
}

.title {
  margin: 0 0 6px 0;
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.header-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 筛选栏 */
.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.filters-left {
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

/* 任务列表 */
.tasks-list {
  min-height: 400px;
  margin: 24px 0;
}

.tasks-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 768px) {
  .tasks-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .tasks-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.task-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.task-header {
  margin-bottom: 12px;
}

.task-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.task-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  flex: 1;
}

.task-meta-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.task-description {
  margin: 0 0 16px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
  min-height: 42px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #eef2f7;
  gap: 12px;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 13px;
}

.info-item .el-icon {
  font-size: 14px;
  color: #3b82f6;
}

.empty-hint {
  margin: 12px 0 0;
  color: #6b7280;
  font-size: 14px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eef2f7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-tasks {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .title {
    font-size: 24px;
    line-height: 1.3;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }

  .filters-left {
    width: 100%;
    flex-wrap: wrap;
  }

  .tasks-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .task-card {
    border-radius: 14px;
  }

  .task-title {
    font-size: 16px;
  }

  .task-description {
    font-size: 13px;
    margin-bottom: 12px;
  }

  .task-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .pagination {
    margin-top: 24px;
  }
}

@media (max-width: 480px) {
  .my-tasks {
    padding: 12px;
  }

  .title {
    font-size: 22px;
  }

  .tasks-grid {
    gap: 12px;
  }

  .task-title {
    font-size: 15px;
  }

  .task-description {
    font-size: 12px;
  }
}
</style>
