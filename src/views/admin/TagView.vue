<template>
  <div class="admin-tag-view">
    <!-- 页头 -->
    <div class="page-header">
      <h1 class="title">标签管理</h1>
      <p class="subtitle">管理题目标签分类</p>
    </div>

    <!-- 筛选区 -->
    <el-card class="toolbar" shadow="never">
      <div class="toolbar-grid">
        <el-input
          v-model="filterKeyword"
          placeholder="搜索标签名称"
          clearable
          class="w-full"
          @keyup.enter="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="toolbar-actions">
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button type="primary" @click="onCreate">
            <el-icon><Plus /></el-icon>
            新建标签
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 标签列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="tags"
        :loading="tableLoading"
        border
        stripe
        size="large"
        style="width: 100%"
        :header-cell-style="headerStyle"
        :cell-style="cellStyle"
      >
        <el-table-column prop="id" label="ID" min-width="180" />
        <el-table-column prop="name" label="标签名称" min-width="180" />
        <el-table-column prop="desc" label="描述" min-width="300">
          <template #default="{ row }">
            {{ row.desc || '-' }}
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

    <!-- 创建/编辑弹窗 -->
    <el-dialog
      v-model="editVisible"
      :title="isEditing ? '编辑标签' : '新建标签'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="editForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="标签名称" prop="name">
          <el-input
            v-model="editForm.name"
            placeholder="请输入标签名称"
            clearable
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="editForm.desc"
            type="textarea"
            :rows="4"
            placeholder="请输入标签描述（可选）"
            maxlength="200"
            show-word-limit
          />
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
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import { getTags, createTag, updateTag, deleteTag } from '@/api/tag';
import type { Tag, CreateTagRequest, UpdateTagRequest } from '@/types/tag';
import { formatCreateTime } from '@/utils/getTime';

// 筛选
const filterKeyword = ref('');

// 列表与分页
const tags = ref<Tag[]>([]);
const tableLoading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 编辑弹窗
const editVisible = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref<string>('');
const isEditing = computed(() => !!editingId.value);
const editForm = reactive<CreateTagRequest & { desc?: string }>({
  name: '',
  desc: ''
});

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 50, message: '标签名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
};

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
      'page-size': pageSize.value,
    };
    if (filterKeyword.value) params.keyword = filterKeyword.value;

    const res = await getTags(params as any);
    tags.value = res.tags || [];
    total.value = res.total || 0;
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '获取标签列表失败');
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
  page.value = 1;
  fetchList();
};

const onPageChange = (p: number) => {
  page.value = p;
  fetchList();
};

const onSizeChange = (size: number) => {
  pageSize.value = size;
  page.value = 1;
  fetchList();
};

const onCreate = () => {
  editingId.value = '';
  editForm.name = '';
  editForm.desc = '';
  editVisible.value = true;
};

const onEdit = (row: Tag) => {
  editingId.value = row.id;
  editForm.name = row.name;
  editForm.desc = row.desc || '';
  editVisible.value = true;
};

const onSaveEdit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      if (isEditing.value) {
        // 更新
        await updateTag(editingId.value, {
          name: editForm.name,
          desc: editForm.desc
        } as UpdateTagRequest);
        ElMessage.success('标签已更新');
      } else {
        // 创建
        await createTag({
          name: editForm.name,
          desc: editForm.desc
        } as CreateTagRequest);
        ElMessage.success('标签已创建');
      }
      editVisible.value = false;
      fetchList();
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || e?.message || (isEditing.value ? '更新标签失败' : '创建标签失败'));
    }
  });
};

const onDelete = async (row: Tag) => {
  try {
    await ElMessageBox.confirm(
      `确认删除标签 "${row.name}" 吗？此操作不可恢复`,
      '删除确认',
      { type: 'warning' }
    );
    await deleteTag(row.id);
    ElMessage.success('已删除标签');
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
.admin-tag-view {
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
    color: #1f2937;
  }

  .subtitle {
    margin: 6px 0 0;
    font-size: 13px;
    color: #6b7280;
  }

  .toolbar {
    margin-bottom: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .toolbar-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      align-items: center;
    }

    .w-full {
      width: 100%;
    }

    .toolbar-actions {
      display: inline-flex;
      gap: 10px;
      align-items: center;
    }
  }

  .table-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px 12px 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    background: #ffffff;
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
