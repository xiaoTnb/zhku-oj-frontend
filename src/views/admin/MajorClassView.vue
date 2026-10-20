<template>
  <div class="admin-major-class-view">
    <!-- 页头 -->
    <div class="page-header">
      <h1 class="title">专业班级管理</h1>
    </div>

    <!-- 筛选区 -->
    <el-card class="toolbar" shadow="never">
      <div class="toolbar-grid">
        <div class="toolbar-actions">
          <el-button type="primary" @click="onCreate">创建专业班级</el-button>
          <el-button @click="fetchList">刷新</el-button>
        </div>
      </div>
    </el-card>

    <!-- 班级列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="classes"
        :loading="tableLoading"
        border
        stripe
        size="large"
        style="width: 100%"
        :header-cell-style="headerStyle"
        :cell-style="cellStyle"
      >
        <el-table-column prop="id" label="ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="name" label="班级名称" min-width="140" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="teacher_ids" label="教师ID列表" min-width="150">
           <template #default="{ row }">
            {{ row.teacher_ids?.join(', ') }}
          </template>
        </el-table-column>
        <el-table-column prop="max_members" label="最大成员数" min-width="100" />
        <el-table-column prop="require_invite" label="需邀请码" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.require_invite ? 'warning' : 'success'">
              {{ row.require_invite ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ctime" label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatCreateTime(row.ctime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建弹窗 -->
    <el-dialog v-model="createVisible" title="创建专业班级" width="500px" :close-on-click-modal="false">
      <el-form :model="createForm" ref="createFormRef" label-width="100px" :rules="rules">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="createForm.description" type="textarea" placeholder="请输入班级描述" />
        </el-form-item>
        <el-form-item label="教师ID" prop="teacher_ids">
             <el-input v-model="teacherIdInput" placeholder="请输入教师ID" />
             <div class="form-tip">暂仅支持输入单个教师ID</div>
        </el-form-item>
        <el-form-item label="最大成员数" prop="max_members">
          <el-input-number v-model="createForm.max_members" :min="0" :step="10" />
        </el-form-item>
        <el-form-item label="需要邀请码" prop="require_invite">
          <el-switch v-model="createForm.require_invite" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createVisible = false">取消</el-button>
          <el-button type="primary" @click="onSaveCreate" :loading="creating">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getMajorClasses, createMajorClass } from '@/api/class';
import { formatCreateTime } from '@/utils/getTime';

const classes = ref<any[]>([]);
const tableLoading = ref(false);

// 创建弹窗
const createVisible = ref(false);
const creating = ref(false);
const teacherIdInput = ref('');
const createForm = reactive({
  name: '',
  description: '',
  teacher_ids: [] as string[],
  max_members: 50,
  require_invite: true
});

const rules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
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
    const res = await getMajorClasses();
    // request.ts 会自动解包 data 字段，所以 res 直接就是数组
    classes.value = Array.isArray(res) ? res : (res.data || []);
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '获取班级列表失败');
  } finally {
    tableLoading.value = false;
  }
};

const onCreate = () => {
  createForm.name = '';
  createForm.description = '';
  createForm.teacher_ids = [];
  createForm.max_members = 50;
  createForm.require_invite = true;
  teacherIdInput.value = '';
  createVisible.value = true;
};

const onSaveCreate = async () => {
  if (!createForm.name || !createForm.description) {
      ElMessage.warning('请填写完整信息');
      return;
  }
  
  if (teacherIdInput.value) {
      createForm.teacher_ids = [teacherIdInput.value];
  } else {
      ElMessage.warning('请输入教师ID');
      return;
  }

  creating.value = true;
  try {
    await createMajorClass({
        name: createForm.name,
        description: createForm.description,
        teacher_ids: createForm.teacher_ids,
        student_ids: [],
        max_members: createForm.max_members,
        require_invite: createForm.require_invite
    });
    ElMessage.success('创建成功');
    createVisible.value = false;
    fetchList();
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '创建失败');
  } finally {
    creating.value = false;
  }
};

onMounted(fetchList);
</script>

<style lang="scss" scoped>
.admin-major-class-view {
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

  .toolbar {
    margin-bottom: 16px;
    border: 1px solid $border-card;
    border-radius: $border-radius-card-large;
    box-shadow: $shadow-default;

    .toolbar-grid {
      display: flex;
      justify-content: flex-start;
      align-items: center;
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
  
  .form-tip {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
  }
}
</style>