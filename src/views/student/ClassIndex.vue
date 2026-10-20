<template>
  <div class="student-class-view">
    <!-- 页头：标题 -->
    <section class="page-header">
      <h1 class="title">我的班级</h1>
      <p class="subtitle">查看你所加入的班级，了解成员与关联课程。</p>
    </section>

    <!-- 统计卡片 -->
    <section class="stats">
      <div class="grid">
        <el-card class="stat-card" shadow="never" v-for="(stat, i) in stats" :key="i">
          <div class="stat-inner">
            <div class="stat-icon" :class="stat.type">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </section>

    <!-- 操作栏 -->
    <section class="actions">
      <div class="left">
        <div class="search-join">
          <input class="input" placeholder="搜索班级名称" v-model="keyword" @keyup.enter="onSearch" />
          <button class="join-search" @click="onSearch">
            <el-icon><Search /></el-icon>
          </button>
        </div>

        <el-dropdown @command="handleStatusFilter">
          <el-button class="dropdown-btn">
            {{ getStatusFilterLabel() }}
            <el-icon><Sort /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">全部</el-dropdown-item>
              <el-dropdown-item command="active">活跃</el-dropdown-item>
              <el-dropdown-item command="pending">待激活</el-dropdown-item>
              <el-dropdown-item command="archived">已归档</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="right">
        <!-- 扫码加入班级入口暂时隐藏，保留逻辑以便后续开启 -->
        <el-button v-if="enableQRJoin" type="primary" round @click="showQRScanner">
          扫码加入班级
        </el-button>
        <!-- 加入班级（表单弹窗） -->
        <el-button type="primary" round @click="showJoinDialog">
          加入班级
        </el-button>
      </div>
    </section>

    <!-- 班级列表（表格） -->
    <section class="table-section">
      <el-card class="table-card" shadow="never" v-loading="loading">
        <div class="table-wrap" v-if="displayClasses.length > 0">
          <table class="plain-table">
            <thead>
              <tr>
                <!-- <th>班级名称</th> -->
                <th>班级名称</th>
                <th>成员数量</th>
                <th>关联课程</th>
                <th>加入日期</th>
                <th>状态</th>
                <th class="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover-row" v-for="item in displayClasses" :key="item.id">
                <td class="link-cell">{{ item.name }}</td>
                <!-- <td class="muted">
                  <template v-if="item.teacher_loading">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span class="loading-text">加载中...</span>
                  </template>
                  <template v-else-if="item.teacher_name">
                    {{ item.teacher_name }}
                  </template>
                  <template v-else>
                    <span class="no-teacher">暂未分配</span>
                  </template>
                </td> -->
                <td class="muted">{{ item.memberDisplay }}</td>
                <td class="muted">{{ item.course_name }}</td>
                <td class="muted">{{ formatDate(item.created_at) }}</td>
                <td>
                  <el-tag :type="item.statusType" effect="plain" round>{{ item.statusLabel }}</el-tag>
                </td>
                <td class="table-actions text-right">
                  <el-button 
                    v-if="item.class_id" 
                    class="ghost-btn" 
                    text 
                    @click="viewClassDetail(item.class_id, item.course_name)"
                  >
                    查看详情
                  </el-button>
                  <span v-else class="muted">无法查看</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 移动端卡片布局 -->
        <div class="mobile-card-list" v-if="displayClasses.length > 0">
          <div class="class-card" v-for="item in displayClasses" :key="item.id">
            <div class="class-card-header">
              <h3 class="class-card-title">{{ item.name }}</h3>
              <el-tag :type="item.statusType" effect="plain" round size="small">
                {{ item.statusLabel }}
              </el-tag>
            </div>
            
            <div class="class-card-info">
              <div class="class-card-info-item">
                <span class="class-card-info-label">成员数量</span>
                <span class="class-card-info-value">{{ item.memberDisplay }}</span>
              </div>
              <div class="class-card-info-item">
                <span class="class-card-info-label">关联课程</span>
                <span class="class-card-info-value">{{ item.course_name }}</span>
              </div>
              <div class="class-card-info-item">
                <span class="class-card-info-label">加入日期</span>
                <span class="class-card-info-value">{{ formatDate(item.created_at) }}</span>
              </div>
            </div>
            
            <div class="class-card-actions" v-if="item.class_id">
              <el-button 
                type="primary" 
                size="small" 
                @click="viewClassDetail(item.class_id, item.course_name)"
              >
                查看详情
              </el-button>
            </div>
            <div class="class-card-actions" v-else>
              <span class="muted">无法查看</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="displayClasses.length === 0 && !loading">
          <div class="empty-icon">👥</div>
          <h3 class="empty-title">暂无班级</h3>
          <p class="empty-desc">请联系老师或输入班级邀请码加入。</p>
          <!-- <el-button type="primary" round>加入新班级</el-button> -->
        </div>

        <!-- Element Plus 分页 -->
        <div class="table-footer" v-if="total > 0">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="handlePageChange"
            background
            small
          />
        </div>
      </el-card>
    </section>
  </div>

  <!-- QR 扫描对话框 -->
  <el-dialog
    v-model="qrScannerVisible"
    title="扫码加入班级"
    width="400px"
    :before-close="closeQRScanner"
  >
    <CustomQRScanner
      v-if="qrScannerVisible"
      :scanning="qrScannerVisible"
      @qr-detected="handleQRDetected"
      @error="handleQRError"
    />
    <template #footer>
      <el-button @click="closeQRScanner">取消</el-button>
    </template>
  </el-dialog>

  <!-- 加入班级表单对话框 -->
  <el-dialog
    v-model="joinDialogVisible"
    title="加入班级"
    width="420px"
    :before-close="closeJoinDialog"
  >
    <el-form :model="joinForm" label-position="top">
      <el-form-item label="班级邀请码">
        <el-input v-model="joinForm.inviteCode" placeholder="请输入班级邀请码" clearable />
      </el-form-item>
      <el-form-item label="班级ID">
        <el-input v-model="joinForm.classId" placeholder="请输入班级ID" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeJoinDialog">取消</el-button>
      <el-button type="primary" :loading="joinLoading" @click="onJoinConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import { Reading, UserFilled, CirclePlus, Sort, Search, Loading } from '@element-plus/icons-vue';
import { useClassStore } from '@/stores/class';
import type { StudentClassResponse, ClassStatus } from '@/types/class';
import CustomQRScanner from '@/components/common/CustomQRScanner.vue';
import { joinClass } from '@/api/class';

// 移除不必要的用户API导入，因为我们不再需要加载教师信息
// import { getUserById } from '@/api/user';
// import type { UserProfile } from '@/types/user';

const stats = ref([
  { value: 0, label: '我的班级数', type: 'info', icon: Reading },
  { value: 0, label: '同学总人数', type: 'success', icon: UserFilled },
  { value: 0, label: '待开始课程', type: 'warning', icon: CirclePlus },
]);

const store = useClassStore();
const userStore = useUserStore();
const router = useRouter();
const keyword = ref('');
const status = ref<string | undefined>(undefined); // 改为string类型

const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const currentPage = ref(1);

// QR 扫描相关
const qrScannerVisible = ref(false);

// 扫码加入入口开关（暂时关闭，后续拿到域名后再开启）
const enableQRJoin = false;

// 加入班级（表单弹窗）相关
const joinDialogVisible = ref(false);
const joinLoading = ref(false);
const joinForm = ref({
  inviteCode: '',
  classId: ''
});
function showJoinDialog() {
  joinDialogVisible.value = true;
}
function closeJoinDialog() {
  joinDialogVisible.value = false;
}

// 移除教师信息缓存，因为不再需要加载教师信息
// const teacherCache = ref<Record<string, { name: string; loading: boolean }>>({});

// 获取当前登录学生的ID
const currentStudentId = computed(() => {
  if (userStore.user?.id) {
    return userStore.user.id;
  }
  
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
  } catch (e) {
    console.error('解析用户信息失败:', e);
  }
  
  console.warn('未找到用户ID，请先登录');
  return null;
});

// 移除教师信息加载函数，因为表格中不再显示教师信息
// 这样可以避免不必要的API调用，提高页面加载性能

/**
 * 注释掉的教师信息加载逻辑
 * 如果将来需要显示教师信息，可以取消注释并恢复相关代码
 */
// const loadTeacherInfo = async (teacherId: string) => { ... }
// const loadAllTeacherInfo = async (classList: any[]) => { ... }

// 处理后的班级数据（优化版本，移除教师信息加载）
const classes = computed(() => {
  if (!store.studentClasses) return [];

  return store.studentClasses.map(item => {
    const classId = item.class_id || item.class?.id;
    console.log('📋 班级数据映射:', {
      item_id: item.id,
      class_id: item.class_id,
      class_id_from_class_obj: item.class?.id,
      final_class_id: classId,
      class_name: item.class?.name
    });

    return {
      ...item,
      name: item.class?.name || '-',
      memberDisplay: getMemberDisplay(item),
      course_name: item.course?.name || '-',
      created_at: item.join_time || item.ctime,
      statusLabel: getStatusLabel(item.class?.status),
      statusType: getStatusType(item.class?.status),
      id: item.id,
      class_id: classId
    };
  });
});

// 显示的分页数据
const displayClasses = computed(() => {
  let filteredClasses = classes.value;
  
  if (keyword.value) {
    const searchTerm = keyword.value.toLowerCase();
    filteredClasses = filteredClasses.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.course_name.toLowerCase().includes(searchTerm)
      // 移除teacher_name搜索，因为我们已经优化掉了教师信息加载
    );
  }
  
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  
  total.value = filteredClasses.length;
  return filteredClasses.slice(start, end);
});

/**
 * 加载学生的班级列表（优化版本）
 */
const loadStudentClasses = async () => {
  const studentId = currentStudentId.value;
  
  if (!studentId) {
    ElMessage.error('无法获取学生ID，请重新登录');
    return;
  }

  loading.value = true;
  try {
    // 加载班级数据
    await store.fetchStudentClasses(studentId);
    
    // 移除教师信息加载，减少不必要的API调用
    // 如果需要显示教师信息，建议后端在班级数据中直接包含教师信息
    
    updateStats();
  } catch (error) {
    console.error('加载班级列表失败:', error);
    ElMessage.error('加载班级列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 更新统计信息
 */
const updateStats = () => {
  const classList = store.studentClasses || [];
  
  stats.value[0].value = classList.length;
  
  stats.value[1].value = classList.reduce((sum, item) => {
    const totalMembers = item.class?.member_ids?.length || 0;
    return sum + (totalMembers > 0 ? totalMembers - 1 : 0);
  }, 0);
  
  stats.value[2].value = classList.filter(item => item.class?.status === 0).length;
};

/**
 * 获取成员显示信息
 */
const getMemberDisplay = (item: StudentClassResponse) => {
  const currentMembers = item.class?.member_ids?.length || 0;
  const maxMembers = item.class?.max_members || 0;
  return maxMembers > 0 ? `${currentMembers} / ${maxMembers}` : `${currentMembers}`;
};

/**
 * 获取状态标签
 */
const getStatusLabel = (status?: number) => {
  switch (status) {
    case 1: return '进行中';
    case 2: return '已结束';
    case 0: return '未开始';
    default: return '未知';
  }
};

/**
 * 获取状态类型
 */
const getStatusType = (status?: number) => {
  switch (status) {
    case 1: return 'success';
    case 2: return 'info';
    case 0: return 'warning';
    default: return '';
  }
};

/**
 * 搜索处理
 */
async function onSearch() {
  currentPage.value = 1;
  await loadStudentClasses();
}

/**
 * 分页处理
 */
function handlePageChange(page: number) {
  currentPage.value = page;
}

/** 格式化日期 */
function formatDate(date?: string) {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('zh-CN');
  } catch {
    return '-';
  }
}

/** 获取状态筛选标签 */
function getStatusFilterLabel() {
  if (!status.value) return '筛选：全部';
  switch (status.value) {
    case 'active': return '筛选：活跃';
    case 'pending': return '筛选：待激活';
    case 'archived': return '筛选：已归档';
    default: return '筛选：全部';
  }
}

/** 处理状态筛选 */
function handleStatusFilter(command: string) {
  if (command === 'all') {
    status.value = undefined;
  } else {
    status.value = command;
  }
  onSearch();
}

/** 查看班级详情 */
function viewClassDetail(classId: string, courseName?: string) {
  console.log('🔗 跳转到班级详情:', { classId, courseName });
  if (!classId) {
    ElMessage.error('班级ID不存在，无法查看详情');
    return;
  }
  router.push({
    name: 'StudentClassDetail',
    params: { id: classId },
    query: { courseName: courseName || '' }
  });
}

/** 显示QR扫描器 */
function showQRScanner() {
  qrScannerVisible.value = true;
}

/** 关闭QR扫描器 */
function closeQRScanner() {
  qrScannerVisible.value = false;
}

/** 处理QR码检测结果 */
async function handleQRDetected(qrCode: string) {
  console.log('🎯 检测到QR码:', qrCode);
  
  // 关闭扫描器
  closeQRScanner();
  
  try {
    // 解析二维码内容：格式为 "邀请码,班级ID"
    const parts = qrCode.split(',');
    if (parts.length !== 2) {
      throw new Error('二维码格式不正确，应为：邀请码,班级ID');
    }
    
    const [inviteCode, clazzId] = parts.map(part => part.trim());
    
    if (!inviteCode || !clazzId) {
      throw new Error('邀请码或班级ID不能为空');
    }
    
    console.log('📝 解析结果:', { inviteCode, clazzId });
    
    // 显示加载提示
    const loadingMessage = ElMessage({
      message: '正在加入班级...',
      type: 'info',
      duration: 0, // 不自动关闭
      showClose: false
    });
    
    // 调用加入班级API
    await joinClass(clazzId, inviteCode);
    
    // 关闭加载提示
    loadingMessage.close();
    
    // 显示成功消息
    ElMessage.success('成功加入班级！');
    
    // 重新加载班级列表
    await loadStudentClasses();
    
  } catch (error: any) {
    console.error('❌ 加入班级失败:', error);
    
    // 显示错误消息
    const errorMessage = error?.response?.data?.message || error?.message || '加入班级失败';
    ElMessage.error(`加入班级失败: ${errorMessage}`);
  }
}

/** 处理QR扫描错误 */
function handleQRError(error: string) {
  console.error('❌ QR扫描错误:', error);
  ElMessage.error(`扫描失败: ${error}`);
}

/** 表单方式加入班级 */
async function onJoinConfirm() {
  const inviteCode = joinForm.value.inviteCode.trim();
  const clazzId = joinForm.value.classId.trim();

  if (!inviteCode || !clazzId) {
    ElMessage.error('请输入完整的邀请码和班级ID');
    return;
  }

  try {
    joinLoading.value = true;
    const loadingMessage = ElMessage({
      message: '正在加入班级...',
      type: 'info',
      duration: 0,
      showClose: false
    });

    await joinClass(clazzId, inviteCode);

    loadingMessage.close();
    ElMessage.success('成功加入班级！');
    closeJoinDialog();
    joinForm.value.inviteCode = '';
    joinForm.value.classId = '';

    await loadStudentClasses();
  } catch (error: any) {
    console.error('❌ 加入班级失败:', error);
    const errorMessage = error?.response?.data?.message || error?.message || '加入班级失败';
    ElMessage.error(`加入班级失败: ${errorMessage}`);
  } finally {
    joinLoading.value = false;
  }
}

onMounted(() => {
  loadStudentClasses();
});
</script>

<style scoped>
.student-class-view { max-width: 1440px; margin: 0 auto; padding: 24px; box-sizing: border-box; }

.page-header { margin-bottom: 24px; }
.title { margin: 0; font-size: 28px; font-weight: 800; color: #1f2937; letter-spacing: -0.02em; }
.subtitle { margin-top: 6px; color: #6b7280; font-size: 14px; }

.stats .grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
.stats .grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); justify-content: start; }

.stat-card { 
  border: 1px solid #e5e7eb !important; 
  border-radius: 16px !important; 
  box-shadow: none !important;
  transition: none !important; 
}
.stat-card:hover { 
  border: 1px solid #e5e7eb !important;
  border-color: #e5e7eb !important; 
  box-shadow: none !important; 
  transform: none !important; 
}
.stat-inner { display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.stat-icon.info { background: rgba(59,130,246,0.12); color: #3b82f6; }
.stat-icon.success { background: rgba(34,197,94,0.12); color: #22c55e; }
.stat-icon.warning { background: rgba(245,158,11,0.12); color: #f59e0b; }
.stat-value { font-size: 28px; font-weight: 800; color: #111827; line-height: 1.2; }
.stat-label { margin-top: 2px; color: #6b7280; font-size: 13px; }

.actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 24px 0; flex-wrap: wrap; }
.left { display: inline-flex; gap: 10px; align-items: center; }
.right { display: inline-flex; align-items: center; }
.dropdown-btn :deep(.el-icon) { margin-left: 6px; }
.search-join { display: inline-flex; align-items: center; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.input { border: none; padding: 10px 12px; width: 260px; outline: none; }
.join-search { border: none; background: #fff; padding: 10px 12px; border-left: 1px solid #e5e7eb; }

.table-card { border: 1px solid #e5e7eb !important; border-radius: 16px !important; box-shadow: none !important; }
.table-wrap { overflow-x: auto; }
.plain-table { width: 100%; border-collapse: collapse; }
.plain-table thead th { text-align: left; padding: 14px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500; }
.plain-table tbody td { padding: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.hover-row:hover { background: #f9fafb; }
.muted { color: #6b7280; }
.link-cell { color: #2563eb; font-weight: 500; cursor: default; }
.table-actions { display: inline-flex; gap: 10px; }
.ghost-btn { color: #374151; }
.no-teacher { color: #9ca3af; font-style: italic; }
.loading-text { margin-left: 8px; color: #6b7280; font-size: 13px; }

.empty-state { text-align: center; padding: 40px 16px; }
.empty-icon { font-size: 48px; color: #9aa2af; display: inline-block; background: #f3f4f6; padding: 16px; border-radius: 50%; }
.empty-title { margin-top: 12px; font-size: 18px; font-weight: 600; color: #111827; }
.empty-desc { margin-top: 2px; color: #6b7280; }

.table-footer { display: flex; justify-content: center; align-items: center; padding: 16px; border-top: 1px solid #e5e7eb; }
.table-footer :deep(.el-pagination) { justify-content: center; }

.mobile-card-list { display: none; }
</style>
