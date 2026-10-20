<template>
  <div class="student-class-detail" v-loading="loading">
    <!-- 页头 -->
    <section class="page-header">
      <div class="header-left">
        <h1 class="title">{{ classData?.name || '班级详情' }}</h1>
        <p class="subtitle">{{ classData?.description || '查看班级信息与任务列表' }}</p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回我的班级
        </el-button>
      </div>
    </section>

    <!-- 班级信息概览 -->
    <section class="class-overview">
      <div class="overview-grid">
        <!-- 班级名称卡片 -->
        <!-- <div class="info-card name-card">
          <div class="card-icon">
            <el-icon><Histogram /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">班级名称</div>
            <div class="card-value">{{ classData?.name || '-' }}</div>
          </div>
        </div> -->

        <!-- 关联课程卡片 -->
        <div class="info-card course-card">
          <div class="card-icon">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">关联课程</div>
            <div class="card-value">{{ courseNameFromQuery || courseName || '未知课程' }}</div>
          </div>
        </div>

        <!-- 授课教师卡片 -->
        <!-- <div class="info-card teacher-card">
          <div class="card-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">授课教师</div>
            <div class="card-value">{{ classData?.teacher_name || '-' }}</div>
          </div>
        </div> -->

        <!-- 班级状态卡片 -->
        <div class="info-card status-card">
          <div class="card-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">班级状态</div>
            <div class="card-value">
              <el-tag :type="getStatusType(classData?.status)" effect="plain" round size="large" disable-transitions>
                {{ getStatusLabel(classData?.status) }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 授课时间卡片 -->
        <!-- <div class="info-card schedule-card">
          <div class="card-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">授课时间</div>
            <div class="card-value">{{ classData?.schedule || '未设置' }}</div>
          </div>
        </div> -->

        <!-- 成员人数卡片 -->
        <div class="info-card members-card">
          <div class="card-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">成员人数</div>
            <div class="card-value">
              <span class="member-count">{{ classData?.add_nums || 0 }}</span>
              <span v-if="classData?.max_members" class="max-members"> / {{ classData.max_members }}</span>
              <span class="unit">人</span>
            </div>
          </div>
        </div>

        <!-- 创建时间卡片 -->
        <div class="info-card time-card">
          <div class="card-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">创建时间</div>
            <div class="card-value">{{ formatDate(classData?.ctime) }}</div>
          </div>
        </div>
      </div>

      <!-- 授课时间 -->
      <el-card class="schedule-card" shadow="never" v-if="classData?.schedule">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon><Clock /></el-icon>
              授课时间
            </span>
          </div>
        </template>
        <div class="schedule-content">
          <p>{{ classData.schedule }}</p>
        </div>
      </el-card>
    </section>

    <!-- 班级任务列表 -->
    <section class="tasks">
      <el-card class="tasks-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon><List /></el-icon>
              班级任务
              <el-tag size="small" class="count-tag" disable-transitions>{{ filteredTasks.length }}</el-tag>
            </span>
            <el-button-group>
              <el-button 
                :type="taskFilter === 'all' ? 'primary' : ''"
                size="small"
                @click="taskFilter = 'all'"
              >
                全部
              </el-button>
              <el-button 
                :type="taskFilter === 'ongoing' ? 'primary' : ''"
                size="small"
                @click="taskFilter = 'ongoing'"
              >
                进行中
              </el-button>
              <el-button 
                :type="taskFilter === 'completed' ? 'primary' : ''"
                size="small"
                @click="taskFilter = 'completed'"
              >
                已结束
              </el-button>
            </el-button-group>
          </div>
        </template>

        <div class="tasks-content">
          <el-empty v-if="filteredTasks.length === 0" description="暂无任务" />
          
          <div v-else class="task-grid">
            <el-card 
              v-for="task in filteredTasks" 
              :key="task.id" 
              class="task-card" 
              shadow="never"
              @click="handleViewTask(task.id)"
            >
              <div class="task-header">
                <div class="task-title-row">
                  <h3 class="task-title">{{ task.title }}</h3>
                  <el-tag :type="task.statusType" size="small" disable-transitions>{{ task.statusLabel }}</el-tag>
                </div>
                <el-tag :type="task.typeType" size="small" effect="plain" disable-transitions>
                  <el-icon><component :is="getTaskTypeIcon(task.typeLabel)" /></el-icon>
                  {{ task.typeLabel }}
                </el-tag>
              </div>
              
              <div class="task-description" v-if="task.description">
                {{ task.description }}
              </div>

              <div class="task-meta">
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>开始: {{ formatTaskDate(task.startTime) }}</span>
                </div>
                <div class="meta-item" v-if="task.endTime">
                  <el-icon><Timer /></el-icon>
                  <span>截止: {{ formatTaskDate(task.endTime) }}</span>
                </div>
              </div>

              <div class="task-progress">
                <div class="progress-info">
                  <span class="progress-label">我的完成进度</span>
                  <span class="progress-value">{{ getMyProgress(task) }}</span>
                </div>
                <el-progress 
                  :percentage="getMyProgressPercentage(task)" 
                  :status="getMyProgressPercentage(task) === 100 ? 'success' : ''"
                />
              </div>

              <div class="task-footer">
                <div class="task-stats">
                  <span class="stat-item">
                    <el-icon><Files /></el-icon>
                    {{ task.relationCount }} 个资源
                  </span>
                  <span class="stat-item">
                    <el-icon><CircleCheck /></el-icon>
                    {{ task.finishCount }} 人完成
                  </span>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  ArrowLeft, Histogram, Reading, UserFilled, Clock, User, Calendar, 
  Document, List, CircleCheck, Timer, Files, DocumentCopy, VideoCamera
} from '@element-plus/icons-vue';
import { useClassStore } from '@/stores/class';
import { useTaskStore } from '@/stores/task';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const classStore = useClassStore();
const taskStore = useTaskStore();
const userStore = useUserStore();
const courseName = ref('');

const classData = ref<any>(null);
const loading = ref(false);
const taskFilter = ref<'all' | 'ongoing' | 'completed'>('all');

// 从路由query中获取课程名称
const courseNameFromQuery = computed(() => {
  return route.query.courseName as string || '';
});

/** 筛选后的任务列表 */
const filteredTasks = computed(() => {
  const tasks = taskStore.cardList || [];
  
  if (taskFilter.value === 'all') return tasks;
  if (taskFilter.value === 'ongoing') {
    return tasks.filter((t: any) => getTaskStatusLabel(t) === '进行中');
  }
  return tasks.filter((t: any) => getTaskStatusLabel(t) === '已结束');
});

/** 从学生班级列表中获取课程名称 */
function getCourseNameFromStudentClasses() {
  if (!classData.value?.course_id) {
    return '未关联课程';
  }
  
  // 遍历所有学生班级，查找匹配的
  for (const item of classStore.studentClasses) {
    // 多种匹配方式确保能找到
    if (item.class_id === classData.value?.id || 
        item.class?.id === classData.value?.id ||
        item.course_id === classData.value?.course_id ||
        item.course?.id === classData.value?.course_id) {
      return item.course?.name || '未知课程';
    }
  }
  
  return '未知课程';
}

/** 格式化日期 */
function formatDate(date?: string) {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

/** 格式化任务日期 */
function formatTaskDate(date?: string) {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN');
  } catch {
    return '-';
  }
}

/** 获取状态标签 */
function getStatusLabel(status?: number): string {
  switch (status) {
    case 1: return '进行中';
    case 2: return '已结束';
    case 0: return '未开始';
    default: return '未知';
  }
}

/** 获取状态类型 */
function getStatusType(status?: number): '' | 'success' | 'info' | 'warning' {
  switch (status) {
    case 1: return 'success';
    case 2: return 'info';
    case 0: return 'warning';
    default: return 'info'; // 默认使用 info 类型，避免空字符串导致警告
  }
}

/** 获取任务状态标签 */
function getTaskStatusLabel(task: any): string {
  // 根据任务的实际状态字段调整
  return task.statusLabel || '未知';
}

/** 获取任务状态类型 */
function getTaskStatusType(task: any): '' | 'success' | 'info' | 'warning' {
  const status = getTaskStatusLabel(task);
  switch (status) {
    case '进行中': return 'success';
    case '已结束': return 'info';
    case '未开始': return 'warning';
    default: return '';
  }
}

/** 获取任务类型标签 */
function getTaskTypeLabel(task: any): string {
  return task.typeLabel || '任务';
}

/** 获取任务类型类型 */
function getTaskTypeType(task: any): '' | 'success' | 'info' | 'warning' {
  const type = getTaskTypeLabel(task);
  switch (type) {
    case '题单': return 'success';
    case '视频': return 'info';
    default: return 'warning';
  }
}

/** 获取任务类型图标 */
function getTaskTypeIcon(task: any) {
  const type = getTaskTypeLabel(task);
  return type === '题单' ? 'DocumentCopy' : 'VideoCamera';
}

/** 获取我的完成进度 */
function getMyProgress(task: any) {
  const userId = userStore.user?.id || '';
  const myFinished = (task.finishIds || []).filter((id: string) => id === userId).length;
  return `${myFinished} / ${task.relation_count || 0}`;
}

/** 获取我的完成进度百分比 */
function getMyProgressPercentage(task: any) {
  const userId = userStore.user?.id || '';
  const myFinished = (task.finishIds || []).filter((id: string) => id === userId).length;
  if (!task.relation_count || task.relation_count === 0) return 0;
  return Math.round((myFinished / task.relation_count) * 100);
}

/** 查看任务详情 */
function handleViewTask(taskId: string) {
  router.push({
    name: 'StudentTaskDetail',
    params: { id: taskId },
    query: { clazzId: String(route.params.id || '') }
  });
}

/** 返回上一页 */
function goBack() {
  router.push('/student/class');
}

/** 加载班级详情 */
async function load() {
  const id = String(route.params.id || '');
  
  if (!id) {
    ElMessage.error('班级ID不能为空');
    return;
  }
  
  loading.value = true;
  try {
    // 加载班级详情
    const response = await classStore.fetchById(id);
    classData.value = response;
    
    // 从学生班级列表中获取课程名称
    courseName.value = getCourseNameFromStudentClasses();
    
    // 加载班级任务列表
    await taskStore.fetchTaskList(id);
    
  } catch (error) {
    console.error('加载班级详情失败:', error);
    ElMessage.error('加载班级详情失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  load();
});
</script>

<style scoped lang="scss">
.student-class-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;

    .header-left {
      flex: 1;
    }

    .title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: $text-primary;
    }

    .subtitle {
      margin-top: 8px;
      color: $text-tertiary;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .class-overview {
    margin-bottom: 32px;

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .info-card {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 24px;
      background: $bg-card;
      border: 1px solid $border-card;
      border-radius: $border-radius-card-large;
      overflow: hidden;

      .card-icon {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-icon-bg);
        border-radius: 14px;
        font-size: 26px;
        color: var(--card-icon-color);
        margin-bottom: 16px;
      }

      .card-content {
        flex: 1;
      }

      .card-label {
        font-size: 13px;
        font-weight: 500;
        color: $text-secondary;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 8px;
      }

      .card-value {
        font-size: 20px;
        font-weight: 700;
        color: $text-primary;
        line-height: 1.4;
        word-break: break-word;

        .unit {
          font-size: 14px;
          font-weight: 500;
          color: $text-tertiary;
          margin-left: 4px;
        }
      }

      .member-count {
        font-size: 20px;
        font-weight: 700;
        color: var(--card-icon-color);
      }

      .max-members {
        font-size: 16px;
        color: $text-tertiary;
      }
    }

    .name-card {
      --card-gradient-from: #3b82f6;
      --card-gradient-to: #2563eb;
      --card-border-hover: #3b82f6;
      --card-shadow: rgba(59, 130, 246, 0.2);
      --card-icon-bg: rgba(59, 130, 246, 0.1);
      --card-icon-color: #3b82f6;
    }

    .course-card {
      --card-gradient-from: #10b981;
      --card-gradient-to: #059669;
      --card-border-hover: #10b981;
      --card-shadow: rgba(16, 185, 129, 0.2);
      --card-icon-bg: rgba(16, 185, 129, 0.1);
      --card-icon-color: #10b981;
    }

    .teacher-card {
      --card-gradient-from: #f59e0b;
      --card-gradient-to: #d97706;
      --card-border-hover: #f59e0b;
      --card-shadow: rgba(245, 158, 11, 0.2);
      --card-icon-bg: rgba(245, 158, 11, 0.1);
      --card-icon-color: #f59e0b;
    }

    .status-card {
      --card-gradient-from: #10b981;
      --card-gradient-to: #059669;
      --card-border-hover: #10b981;
      --card-shadow: rgba(16, 185, 129, 0.2);
      --card-icon-bg: rgba(16, 185, 129, 0.1);
      --card-icon-color: #10b981;
    }

    .schedule-card {
      --card-gradient-from: #06b6d4;
      --card-gradient-to: #0891b2;
      --card-border-hover: #06b6d4;
      --card-shadow: rgba(6, 182, 212, 0.2);
      --card-icon-bg: rgba(6, 182, 212, 0.1);
      --card-icon-color: #06b6d4;
    }

    .members-card {
      --card-gradient-from: #8b5cf6;
      --card-gradient-to: #7c3aed;
      --card-border-hover: #8b5cf6;
      --card-shadow: rgba(139, 92, 246, 0.2);
      --card-icon-bg: rgba(139, 92, 246, 0.1);
      --card-icon-color: #8b5cf6;
    }

    .time-card {
      --card-gradient-from: #ec4899;
      --card-gradient-to: #db2777;
      --card-border-hover: #ec4899;
      --card-shadow: rgba(236, 72, 153, 0.2);
      --card-icon-bg: rgba(236, 72, 153, 0.1);
      --card-icon-color: #ec4899;
    }

    .schedule-card {
      border: 1px solid $border-card;
      border-radius: $border-radius-card-large;

      .card-header {
        display: flex;
        align-items: center;
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
      }

      .schedule-content {
        padding: 8px 0;

        p {
          margin: 0;
          color: $text-secondary;
          font-size: 15px;
          line-height: 1.8;
          white-space: pre-wrap;
        }
      }
    }
  }

  .tasks {
    margin-bottom: 24px;

    .tasks-card {
      box-shadow: none;
      border: 1px solid $border-card;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;

        .count-tag {
          margin-left: 8px;
        }
      }
    }

    .tasks-content {
      padding: 20px 0;
    }

    .task-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .task-card {
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
      border: 1px solid $border-card;
      box-shadow: none;
      transition: none;

      &:hover {
        border-color: $border-card;
        box-shadow: none;
        transform: none;
      }

      .task-header {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;

        .task-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;

          .task-title {
            flex: 1;
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: $text-primary;
            line-height: 1.4;
          }
        }
      }

      .task-description {
        color: $text-secondary;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .task-meta {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: $text-tertiary;
          font-size: 13px;

          .el-icon {
            font-size: 14px;
          }
        }
      }

      .task-progress {
        margin-bottom: 16px;

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .progress-label {
            color: $text-secondary;
            font-size: 13px;
          }

          .progress-value {
            color: $text-primary;
            font-size: 14px;
            font-weight: 600;
          }
        }
      }

      .task-footer {
        padding-top: 16px;
        border-top: 1px solid $border-light;
        margin-top: auto;

        .task-stats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;

          .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: $text-tertiary;
            font-size: 13px;

            .el-icon {
              font-size: 14px;
              color: $color-primary;
            }
          }
        }
      }
    }
  }
}
</style>
