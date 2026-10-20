<template>
  <div class="admin-user-view">
    <!-- 页头 -->
    <div class="page-header">
      <h1 class="title">用户管理</h1>
    </div>

    <!-- 筛选区 -->
    <el-card class="toolbar" shadow="never">
      <div class="toolbar-grid">
        <el-input
          v-model="filterKeyword"
          placeholder="搜索用户名/真实姓名/邮箱"
          clearable
          class="w-full"
          @keyup.enter="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="filterRole" placeholder="角色" clearable>
          <el-option label="admin" value="admin" />
          <el-option label="teacher" value="teacher" />
          <el-option label="student" value="student" />
        </el-select>

        <!-- <el-select v-model="filterActive" placeholder="状态" clearable>
          <el-option label="已激活" value="true" />
          <el-option label="未激活" value="false" />
        </el-select> -->

        <div class="toolbar-actions">
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="users"
        :loading="tableLoading"
        border
        stripe
        size="large"
        style="width: 100%"
        :header-cell-style="headerStyle"
        :cell-style="cellStyle"
      >
        <el-table-column prop="student_id" label="学号/工号" min-width="120" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="real_name" label="真实姓名" min-width="140" />
        <el-table-column prop="role" label="角色" min-width="120">
          <template #default="{ row }">
            <el-tag
              effect="plain"
              :type="row.role === 'admin' ? 'danger' : row.role === 'teacher' ? 'warning' : 'success'"
            >
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="is_active" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" round>
              {{ row.is_active ? '已激活' : '未激活' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatCreateTime(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <div class="op-row">
              <el-button type="primary" text @click="onEdit(row)">编辑</el-button>
              <el-button type="danger" text @click="onDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="page"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editVisible" title="编辑用户" width="480px" :close-on-click-modal="false">
      <el-form label-width="88px">
        <el-form-item label="角色">
          <el-select v-model="editForm.role" placeholder="选择角色" style="width: 200px">
            <el-option label="admin" value="admin" />
            <el-option label="teacher" value="teacher" />
            <el-option label="student" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="editForm.is_active" active-text="已激活" inactive-text="未激活" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" @click="onSaveEdit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getUsers, getUserById, updateUser, deleteUser } from '@/api/user';
import type { GetUsersResponseData, UpdateUserRequest } from '@/types/user';
import { formatCreateTime } from '@/utils/getTime';

// 筛选
const filterKeyword = ref('');
const filterRole = ref<string | undefined>();
const filterActive = ref<string | undefined>(); // 'true' | 'false'

// 列表与分页
const users = ref<GetUsersResponseData['users']>([]);
const tableLoading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 编辑弹窗
const editVisible = ref(false);
const editingId = ref<string>('');
const editForm = reactive<{ role: UpdateUserRequest['role']; is_active: boolean }>({
  role: undefined,
  is_active: true,
});

const headerStyle = () => ({
  background: '#f7f8fa',
  color: '#3b3b3b',
  fontWeight: 600,
});
const cellStyle = () => ({
  color: '#333',
});

// 拉取列表
const fetchList = async () => {
  tableLoading.value = true;
  try {
    const params: Record<string, any> = {
      page: page.value,
      page_size: pageSize.value,
    };
    if (filterRole.value) params.role = filterRole.value;
    if (filterKeyword.value) params.keyword = filterKeyword.value;
    if (filterActive.value) params.is_active = filterActive.value; // 若后端不支持此筛选，可移除

    const res = await getUsers(params as any);
    users.value = res.users || [];
    total.value = res.total || 0;
    // page/pageSize 可根据返回 pagination 回写（如有）
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '获取用户列表失败');
  } finally {
    tableLoading.value = false;
  }
};

const onSearch = () => {
  page.value = 1;
  fetchList();
};
const onReset = () => {
  filterKeyword.value = '';
  filterRole.value = undefined;
  filterActive.value = undefined;
  page.value = 1;
  fetchList();
};
const onPageChange = (p: number) => {
  page.value = p;
  fetchList();
};

const onSizeChange = (size: number) => {
  pageSize.value = size;
  page.value = 1; // 重置到第一页
  fetchList();
};

const onEdit = async (row: { id: string }) => {
  try {
    const detail = await getUserById(row.id);
    editingId.value = detail.id;
    editForm.role = detail.role as any;
    editForm.is_active = !!detail.is_active;
    editVisible.value = true;
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '获取用户详情失败');
  }
};

const onSaveEdit = async () => {
  try {
    await updateUser(editingId.value, {
      role: editForm.role,
      is_active: editForm.is_active,
    });
    ElMessage.success('用户信息已更新');
    editVisible.value = false;
    fetchList();
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '更新用户失败');
  }
};

const onDelete = async (row: { id: string; username?: string }) => {
  try {
    await ElMessageBox.confirm(
      `确认删除用户 ${row.username || row.id} 吗？此操作不可恢复`,
      '删除确认',
      { type: 'warning' }
    );
    await deleteUser(row.id);
    ElMessage.success('已删除用户');
    fetchList();
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e?.response?.data?.message || e?.message || '删除失败');
    }
  }
};

onMounted(fetchList);
</script>

<style lang="scss" scoped>
.admin-user-view {
  max-width: 1280px;
  margin: 20px auto;
  padding: 0 24px;
  box-sizing: border-box;

  .page-header {
    margin-bottom: 20px;
  }

  .title {
    margin: 0;
    font-size: 25px;
    font-weight: 700;
    color: $text-primary;
  }

  .subtitle {
    margin: 6px 0 0;
    font-size: 13px;
    color: $text-tertiary;
  }

  .toolbar {
    margin-bottom: 16px;
    border: 1px solid $border-card;
    border-radius: $border-radius-card-large;
    box-shadow: $shadow-default;

    .toolbar-grid {
      display: grid;
      grid-template-columns: 1fr 180px 160px auto;
      gap: 16px;
      align-items: center;
    }

    .w-full {
      width: 100%;
    }

    .toolbar-actions {
      display: inline-flex;
      gap: 10px;
    }
  }

  .table-card {
    border: 1px solid $border-card;
    border-radius: $border-radius-card-large;
    padding: 12px 12px 10px;
    box-shadow: $shadow-heavy;
    background: $bg-card;
  }

  .op-row {
    display: inline-flex;
    gap: 6px;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    padding: 16px 16px 10px;
  }
}
</style>
