<template>
  <div class="problem-index">
    <!-- 标题与说明 -->
    <section class="page-header">
      <h1 class="title">题库管理</h1>
      <p class="subtitle">
        （管理员专用）管理所有题目，包括创建、编辑、删除题目以及设置难度、标签和测试用例。
      </p>
    </section>

    <!-- 统计卡片 -->
    <section class="stats">
      <div class="grid">
        <el-card class="stat-card" shadow="never">
          <div class="stat-inner">
            <div class="stat-icon info">
              <el-icon>
                <Reading />
              </el-icon>
            </div>
            <div>
              <div class="stat-value">{{ store.totalProblems }}</div>
              <div class="stat-label">题目总数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card" shadow="never">
          <div class="stat-inner">
            <div class="stat-icon success">
              <el-icon>
                <CircleCheck />
              </el-icon>
            </div>
            <div>
              <div class="stat-value">{{ store.problemsByDifficulty.easy }}</div>
              <div class="stat-label">简单题目</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card" shadow="never">
          <div class="stat-inner">
            <div class="stat-icon warning">
              <el-icon>
                <WarningFilled />
              </el-icon>
            </div>
            <div>
              <div class="stat-value">{{ store.problemsByDifficulty.medium }}</div>
              <div class="stat-label">中等题目</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card" shadow="never">
          <div class="stat-inner">
            <div class="stat-icon danger">
              <el-icon>
                <CircleClose />
              </el-icon>
            </div>
            <div>
              <div class="stat-value">{{ store.problemsByDifficulty.hard }}</div>
              <div class="stat-label">困难题目</div>
            </div>
          </div>
        </el-card>
      </div>
    </section>

    <!-- 操作栏 -->
    <section class="actions">
      <div class="left">
        <div class="search-join">
          <input class="input" placeholder="搜索题目标题、描述或标签" v-model="keyword" @keyup.enter="onSearch" />
          <button class="join-search" @click="onSearch">
            <el-icon>
              <Search />
            </el-icon>
          </button>
          <button v-if="keyword" class="clear-search" @click="onClearSearch">
            <el-icon>
              <Close />
            </el-icon>
          </button>
        </div>

        <!-- <el-select 
          v-model="selectedTags" 
          multiple 
          filterable 
          allow-create 
          collapse-tags 
          collapse-tags-tooltip
          placeholder="按标签筛选"
          class="tag-select"
          clearable
        >
          <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
        </el-select> -->

        <el-dropdown @command="handleDifficultyFilter">
          <el-button class="dropdown-btn">
            {{ getDifficultyFilterLabel() }}
            <el-icon>
              <Filter />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">全部难度</el-dropdown-item>
              <el-dropdown-item command="easy">简单</el-dropdown-item>
              <el-dropdown-item command="medium">中等</el-dropdown-item>
              <el-dropdown-item command="hard">困难</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown>
          <el-button class="dropdown-btn">
            批量操作
            <el-icon>
              <Operation />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleBatchExport">批量导出</el-dropdown-item>
              <el-dropdown-item @click="handleBatchSetPrivate">批量设为私有</el-dropdown-item>
              <el-dropdown-item class="text-error" @click="handleBatchDelete">批量删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="right">
        <el-button type="warning" round :disabled="selectedIds.length === 0" @click="onManageTestCases"
          style="margin-right: 10px;">
          <el-icon>
            <Document />
          </el-icon>
          补充测试用例
        </el-button>
        <el-button type="primary" round @click="onCreate">
          <el-icon>
            <Plus />
          </el-icon>
          新建题目
        </el-button>
      </div>
    </section>

    <!-- 题目列表 -->
    <section class="table-section">
      <el-card class="table-card" shadow="never" v-loading="store.loading">
        <div class="table-container">
          <table class="plain-table">
            <thead>
              <tr>
                <th class="fixed-column checkbox-column">
                  <label><input type="checkbox" class="checkbox" v-model="selectAll"
                      @change="handleSelectAll" /></label>
                </th>
                <th class="fixed-column title-column">题目标题</th>
                <th>难度等级</th>
                <th class="tag-column">标签</th>
                <th>提交数</th>
                <th>通过率</th>
                <th>是否公有</th>
                <th>状态</th>
                <th>创建时间</th>
                <th class="action-column">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover-row" v-for="problem in problems" :key="problem.id">
                <td class="fixed-column checkbox-column">
                  <label><input type="checkbox" class="checkbox" v-model="selectedIds" :value="problem.id" /></label>
                </td>
                <td class="fixed-column title-column link-cell" @click="goDetail(problem.id)">{{ (problem.unique_id != null ? problem.unique_id + '.' : '') + problem.title }}</td>
                <td>
                  <el-tag :type="problem.difficultyType" effect="plain" round size="small">
                    {{ problem.difficultyLabel }}
                  </el-tag>
                </td>
                <td class="tag-column">
                  <div class="tags-cell">
                    <el-tag v-for="tag in problem.tags?.slice(0, 2)" :key="tag" size="small" effect="plain">
                      {{ tag }}
                    </el-tag>
                    <el-tag v-if="(problem.tags?.length || 0) > 2" size="small" effect="plain">
                      +{{ (problem.tags?.length || 0) - 2 }}
                    </el-tag>
                  </div>
                </td>
                <td>{{ problem.submitCount || 0 }}</td>
                <td>
                  <div class="rate-cell">
                    <el-progress :percentage="problem.ac_rate || 0" :stroke-width="6" :show-text="false" />
                    <span class="muted small">{{ problem.acRate }}</span>
                  </div>
                </td>
                <td>
                  <el-tag :type="problem.is_public ? 'success' : 'info'" effect="plain" size="small">
                    {{ problem.is_public ? '是' : '否' }}
                  </el-tag>
                </td>
                <td>
                  <el-tag :type="getStatusType(problem.status)" effect="plain" size="small">
                    {{ getStatusLabel(problem.status) }}
                  </el-tag>
                </td>
                <td class="muted small">{{ formatDate(problem.created_at) }}</td>
                <td class="table-actions action-column">
                  <el-button class="ghost-btn" text size="small" @click.stop="goDetail(problem.id)">
                    <el-icon>
                      <View />
                    </el-icon>查看
                  </el-button>
                  <el-button class="ghost-btn" text size="small" @click.stop="onEdit(problem)">
                    <el-icon>
                      <Edit />
                    </el-icon>编辑
                  </el-button>
                  <el-button class="ghost-btn text-error" text size="small" @click.stop="onDelete(problem)">
                    <el-icon>
                      <Delete />
                    </el-icon>删除
                  </el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="problems.length === 0 && !store.loading">
          <div class="empty-icon">📝</div>
          <h3 class="empty-title">暂无题目</h3>
          <p class="empty-desc">开始创建您的第一道题目吧。</p>
          <el-button type="primary" round @click="onCreate">
            <el-icon>
              <Plus />
            </el-icon>
            新建题目
          </el-button>
        </div>

        <!-- 分页 -->
        <div class="table-footer" v-if="store.total > 0">
          <el-pagination background layout="total, prev, pager, next, jumper" :current-page="currentPage"
            :page-size="store.pageSize" :total="store.total" @current-change="onPageChange" />
        </div>
      </el-card>
    </section>

    <!-- 创建/编辑对话框 -->
    <el-dialog :title="dialogMode === 'create' ? '新建题目' : '编辑题目'" v-model="dialogVisible" width="800px"
      :close-on-click-modal="false" @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="题目标题" prop="title">
          <el-input v-model="formData.title" placeholder="例如：两数之和 (Two Sum)" />
        </el-form-item>

        <el-form-item label="难度" prop="difficulty">
          <el-radio-group v-model="formData.difficulty">
            <el-radio value="easy">简单</el-radio>
            <el-radio value="medium">中等</el-radio>
            <el-radio value="hard">困难</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="draft">草稿</el-radio>
            <el-radio value="published">已发布</el-radio>
            <el-radio value="archived">已归档</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="标签">
          <el-select v-model="formData.tags" multiple filterable allow-create placeholder="例如：数组、哈希表、双指针"
            style="width: 100%;">
            <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>

        <el-form-item label="题目描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4"
            placeholder="例如：给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回他们的数组下标。你可以假设每种输入只会对应一个答案。但是，数组中同一个元素不能使用两遍。" />
        </el-form-item>

        <el-form-item label="输入说明" prop="input">
          <el-input v-model="formData.input" type="textarea" :rows="2"
            placeholder="例如：第一行为整数数组 nums 的长度 n (2 <= n <= 10^4)，第二行为 n 个整数，表示数组 nums 中的元素，第三行为目标值 target。" />
        </el-form-item>

        <el-form-item label="输出说明" prop="output">
          <el-input v-model="formData.output" type="textarea" :rows="2"
            placeholder="例如：输出两个整数，表示和为 target 的两个元素在数组中的下标（从0开始）。输出顺序不限，但两个下标必须不同。" />
        </el-form-item>

        <el-form-item label="提示">
          <el-input v-model="formData.hint" type="textarea" :rows="2"
            placeholder="例如：可以考虑使用哈希表来优化时间复杂度，将查找时间从 O(n) 降低到 O(1)。" />
        </el-form-item>

        <el-form-item label="样例输入">
          <el-input v-model="formData.sample_input" type="textarea" :rows="3" placeholder="例如：
4
2 7 11 15
9" />
        </el-form-item>

        <el-form-item label="样例输出">
          <el-input v-model="formData.sample_output" type="textarea" :rows="3" placeholder="例如：
0 1" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时间限制(ms)">
              <el-input-number v-model="formData.time_limit" :min="100" :max="10000" :step="100" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内存限制(MB)">
              <el-input-number v-model="formData.memory_limit" :min="32" :max="512" :step="32" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="是否公有">
          <el-switch v-model="formData.is_public" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ dialogMode === 'create' ? '创建' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
    <!-- 测试用例管理对话框 -->
    <el-dialog :title="`管理测试用例 - ${selectedProblemTitle}`" v-model="testCaseDialogVisible" width="1200px"
      :close-on-click-modal="false">
      <div v-loading="testCaseStore.loading">
        <div class="test-case-header"
          style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="test-case-count">共 {{ testCaseStore.rawTestCases.length }} 个测试用例</span>
            <span class="test-case-sample-count" style="margin-left: 15px;">
              其中 {{ testCaseStore.sampleTestCases.length }} 个样例
            </span>
          </div>
          <div>
            <el-button type="primary" @click="addNewTestCase">
              <el-icon>
                <Plus />
              </el-icon> 新增测试用例
            </el-button>
          </div>
        </div>

        <!-- 测试用例列表 -->
        <el-table :data="testCaseStore.rawTestCases" style="width: 100%" border height="400" :max-height="400">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="input" label="输入" width="280" show-overflow-tooltip>
            <template #default="scope">
              <pre style="white-space: pre-wrap; max-height: 100px; overflow-y: auto;">{{ scope.row.input }}</pre>
            </template>
          </el-table-column>
          <el-table-column prop="output" label="输出" width="280" show-overflow-tooltip>
            <template #default="scope">
              <pre style="white-space: pre-wrap; max-height: 100px; overflow-y: auto;">{{ scope.row.output }}</pre>
            </template>
          </el-table-column>
          <el-table-column prop="is_sample" label="是否样例" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.is_sample ? 'success' : 'info'" effect="plain">
                {{ scope.row.is_sample ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="分数" width="80" />
          <el-table-column prop="time_limit" label="时间限制(ms)" width="130" />
          <el-table-column prop="memory_limit" label="内存限制(MB)" width="130" />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="editTestCase(scope.row)">编辑</el-button>
              <el-button type="danger" size="small" @click="deleteTestCase(scope.row)" style="margin-left: 8px;">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 编辑测试用例表单 -->
        <el-dialog v-model="testCaseEditMode" :title="currentTestCase && currentTestCase.id ? '编辑测试用例' : '新增测试用例'"
          width="600px" :close-on-click-modal="false" center>
          <el-form v-if="currentTestCase" ref="testCaseFormRef" :model="currentTestCase" :rules="testCaseFormRules" label-width="120px"
            style="padding: 0 20px;">
            <el-form-item label="输入" prop="input">
              <el-input v-model="currentTestCase.input" type="textarea" :rows="4" placeholder="请输入测试用例的输入数据" />
            </el-form-item>
            <el-form-item label="输出" prop="output">
              <el-input v-model="currentTestCase.output" type="textarea" :rows="4" placeholder="请输入测试用例的期望输出" />
            </el-form-item>
            <el-form-item label="是否为样例" prop="is_sample">
              <el-switch v-model="currentTestCase.is_sample" />
            </el-form-item>
            <el-form-item label="分数" prop="score">
              <el-input-number v-model="currentTestCase.score" :min="0" :max="100" />
            </el-form-item>
            <el-form-item label="时间限制(ms)" prop="time_limit">
              <el-input-number v-model="currentTestCase.time_limit" :min="100" :max="10000" :step="100" />
            </el-form-item>
            <el-form-item label="内存限制(MB)" prop="memory_limit">
              <el-input-number v-model="currentTestCase.memory_limit" :min="32" :max="512" :step="32" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveTestCase" :loading="submitting">保存</el-button>
              <el-button @click="testCaseEditMode = false">取消</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Reading, CircleCheck, WarningFilled, CircleClose, Search, Filter,
  Operation, Plus, View, Edit, Delete, Close, Document
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { useProblemsStore } from '@/stores/problems';
import { useTestCaseStore } from '@/stores/test';
import { getPublicTags } from '@/api/tag';
import type { Tag } from '@/types/tag';
import type {
  ProblemTableRow,
  Difficulty,
  CreateProblemRequest,
  UpdateProblemRequest,
  AdminProblemListQuery
} from '@/types/problem';
import type { TestCase, UpdateTestCase, CreateTestCase } from '@/types/test';

const router = useRouter();
const store = useProblemsStore();
const testCaseStore = useTestCaseStore();

const keyword = ref('');
const difficulty = ref<Difficulty | undefined>(undefined);
const selectedTags = ref<string[]>([]);
const currentPage = ref(1);
const selectAll = ref(false);
const selectedIds = ref<string[]>([]);
const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const submitting = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref('');

// 测试用例相关
const testCaseDialogVisible = ref(false);
const currentTestCase = ref<TestCase | null>(null);
const testCaseEditMode = ref(false);
const testCaseFormRef = ref<FormInstance>();
const selectedProblemId = ref('');
const selectedProblemTitle = ref('');
const formData = ref<CreateProblemRequest>({
  title: '',
  description: '',
  difficulty: 'easy',
  tags: [],
  input: '',
  output: '',
  hint: '',
  sample_input: '',
  sample_output: '',
  time_limit: 1000,
  memory_limit: 256,
  examples: [{ input: '', output: '', explanation: '' }],
  is_public: true,
  status: 'draft', // 默认为草稿状态
});

// 状态映射函数
const getStatusLabel = (status: string | undefined) => {
  switch (status) {
    case 'draft': return '草稿';
    case 'published': return '已发布';
    case 'archived': return '已归档';
    default: return '未知状态';
  }
};

// 状态标签类型映射
const getStatusType = (status: string | undefined) => {
  switch (status) {
    case 'draft': return 'info';
    case 'published': return 'success';
    case 'archived': return 'warning';
    default: return 'info';
  }
};

// 标签列表（从后端获取）
const commonTags = ref<string[]>([]);

// 获取公共标签列表
const fetchTags = async () => {
  try {
    const res = await getPublicTags();

    // 兼容两种响应格式：
    // 1. { tags: [...] }
    // 2. [...] 直接返回数组
    let tags: Tag[] = [];
    if (Array.isArray(res)) {
      tags = res;
    } else if (res.tags && Array.isArray(res.tags)) {
      tags = res.tags;
    }

    commonTags.value = tags.map((tag: Tag) => tag.name);
  } catch (e: any) {
    console.error('获取标签列表失败:', e);
    // 失败时使用默认标签
    commonTags.value = [
      '数组', '字符串', '链表', '树', '图', '哈希表',
      '动态规划', '贪心', '回溯', '分治', '排序', '搜索'
    ];
  }
};

const formRules: FormRules = {
  title: [
    { required: true, message: '请输入题目标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度应在1-200字符之间', trigger: 'blur' }
  ],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  description: [
    { required: true, message: '请输入题目描述', trigger: 'blur' },
    { min: 10, message: '题目描述至少需要10个字符', trigger: 'blur' }
  ],
  input: [
    { required: true, message: '请输入输入说明', trigger: 'blur' },
    { min: 5, message: '输入说明至少需要5个字符', trigger: 'blur' }
  ],
  output: [
    { required: true, message: '请输入输出说明', trigger: 'blur' },
    { min: 5, message: '输出说明至少需要5个字符', trigger: 'blur' }
  ],
};

// 测试用例表单验证规则
const testCaseFormRules: FormRules = {
  input: [
    { required: true, message: '请输入测试用例的输入数据', trigger: 'blur' }
  ],
  output: [
    { required: true, message: '请输入测试用例的期望输出', trigger: 'blur' }
  ],
  score: [
    { required: true, message: '请设置测试用例分数', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '分数应在0-100之间', trigger: 'blur' }
  ],
  time_limit: [
    { required: true, message: '请设置时间限制', trigger: 'blur' },
    { type: 'number', min: 100, max: 10000, message: '时间限制应在100-10000ms之间', trigger: 'blur' }
  ],
  memory_limit: [
    { required: true, message: '请设置内存限制', trigger: 'blur' },
    { type: 'number', min: 32, max: 512, message: '内存限制应在32-512MB之间', trigger: 'blur' }
  ]
};

const problems = computed(() => store.tableList);

function getDifficultyFilterLabel() {
  if (!difficulty.value) return '难度筛选';
  const labels = { easy: '简单', medium: '中等', hard: '困难' };
  return `筛选：${labels[difficulty.value]}`;
}

function handleDifficultyFilter(command: string) {
  difficulty.value = command === 'all' ? undefined : command as Difficulty;
  onSearch();
}

async function onSearch() {
  currentPage.value = 1;
  
  if (keyword.value.trim()) {
    // 如果有关键词，使用搜索接口
    await store.searchProblemList({
      keyword: keyword.value.trim(),
      difficulty: difficulty.value,
      tags: selectedTags.value.length ? selectedTags.value : undefined,
      page: 1,
      page_size: store.pageSize,
    });
  } else {
    // 如果没有关键词，使用管理员端接口
    await store.fetchAdminProblems({
      page: 1,
      page_size: store.pageSize,
      difficulty: difficulty.value,
      tags: selectedTags.value.length ? selectedTags.value : undefined,
    });
  }
}

function onClearSearch() {
  keyword.value = '';
  selectedTags.value = [];
  onSearch();
}



async function onPageChange(page: number) {
  currentPage.value = page;
  
  if (keyword.value.trim()) {
    // 如果有关键词，使用搜索接口
    await store.searchProblemList({
      keyword: keyword.value.trim(),
      difficulty: difficulty.value,
      tags: selectedTags.value.length ? selectedTags.value : undefined,
      page: page,
      page_size: store.pageSize,
    });
  } else {
    // 如果没有关键词，使用管理员端接口
    await store.fetchAdminProblems({
      page: page,
      page_size: store.pageSize,
      difficulty: difficulty.value,
      tags: selectedTags.value.length ? selectedTags.value : undefined,
    });
  }
}

function formatDate(date?: string) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN');
}

function handleSelectAll() {
  selectedIds.value = selectAll.value ? problems.value.map(p => p.id) : [];
}

function goDetail(id: string) {
  // 使用 router.resolve 生成带 base URL 的完整路径
  const routeData = router.resolve({
    path: `/problems/${id}`
  });
  window.open(routeData.href, '_blank');
}

function onCreate() {
  dialogMode.value = 'create';
  resetFormData();
  dialogVisible.value = true;
}

async function onEdit(problem: ProblemTableRow) {
  dialogMode.value = 'edit';
  editingId.value = problem.id;
  
  try {
    // 获取题目详情
    const problemDetail = await store.fetchProblemDetailAggregate(problem.id);
    
    // 回显题目数据
    formData.value = {
      title: problemDetail.title,
      description: problemDetail.description || '',
      difficulty: problemDetail.difficulty || 'easy',
      tags: problemDetail.tags || [],
      input: problemDetail.input || '',
      output: problemDetail.output || '',
      hint: problemDetail.hint || '',
      sample_input: problemDetail.sample_input || '',
      sample_output: problemDetail.sample_output || '',
      time_limit: problemDetail.time_limit || 1000,
      memory_limit: problemDetail.memory_limit || 256,
      examples: problemDetail.examples || [{ input: '', output: '', explanation: '' }],
      is_public: problemDetail.is_public !== undefined ? problemDetail.is_public : true,
      status: problemDetail.status || 'published',
    };
    
    dialogVisible.value = true;
  } catch (error) {
    console.error('获取题目详情失败:', error);
    ElMessage.error('获取题目详情失败');
  }
}

async function onDelete(problem: ProblemTableRow) {
  try {
    await ElMessageBox.confirm(
      `确定要删除题目 "${problem.title}" 吗？`,
      '删除确认',
      { type: 'warning', confirmButtonClass: 'el-button--danger' }
    );
    await store.remove(problem.id);
    // 删除后对齐进入组件时的刷新方式：使用管理员端列表接口
    await store.fetchAdminProblems({
      page: currentPage.value,
      page_size: store.pageSize,
      difficulty: difficulty.value,
      tags: selectedTags.value.length ? selectedTags.value : undefined,
    });
  } catch {}
}

function handleBatchExport() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要导出的题目');
    return;
  }
  ElMessage.info(`批量导出 ${selectedIds.value.length} 道题目`);
}

function handleBatchSetPrivate() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要设置的题目');
    return;
  }
  ElMessage.info(`批量设为私有 ${selectedIds.value.length} 道题目`);
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的题目');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedIds.value.length} 道题目吗？`,
      '批量删除',
      { type: 'warning', confirmButtonClass: 'el-button--danger' }
    );
    ElMessage.info('批量删除功能开发中');
  } catch {}
}

function resetFormData() {
  formData.value = {
    title: '',
    description: '',
    difficulty: 'easy',
    tags: [],
    input: '',
    output: '',
    hint: '',
    sample_input: '',
    sample_output: '',
    time_limit: 1000,
    memory_limit: 256,
    examples: [{ input: '', output: '', explanation: '' }],
    is_public: true,
    status: 'published',
  };
  editingId.value = '';
  formRef.value?.resetFields();
}

function handleDialogClose() {
  resetFormData();
}

/**
 * 打开测试用例管理对话框
 */
async function onManageTestCases() {
  if (selectedIds.value.length > 1) {
    ElMessage.warning('一次只能管理一个题目的测试用例，请只选择一个题目');
    return;
  }
  
  selectedProblemId.value = selectedIds.value[0];
  // 获取选中题目的标题
  const selectedProblem = problems.value.find(p => p.id === selectedProblemId.value);
  if (selectedProblem) {
    selectedProblemTitle.value = selectedProblem.title;
  }
  
  testCaseDialogVisible.value = true;
  
  try {
    await testCaseStore.fetchTestCasesByProblemId(selectedProblemId.value);
  } catch (error) {
    ElMessage.error('获取测试用例失败');
    console.error(error);
  }
}

/**
 * 删除测试用例
 */
async function deleteTestCase(testCase: TestCase) {
  try {
    await ElMessageBox.confirm(
      `确定要删除这个测试用例吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );
    
    await testCaseStore.remove(testCase.id);
    ElMessage.success('测试用例删除成功');
    
    // 重新获取测试用例列表
    await testCaseStore.fetchTestCasesByProblemId(selectedProblemId.value);
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除测试用例失败');
      console.error(error);
    }
  }
}

/**
 * 编辑测试用例
 */
// 添加新测试用例方法
function addNewTestCase() {
  // 创建一个完整的 TestCase 对象，确保所有必需字段都有值
  currentTestCase.value = {
    id: '', // 新建时ID为空
    problem_id: selectedProblemId.value,
    input: '',
    output: '',
    is_sample: false,
    score: 10,
    time_limit: formData.value.time_limit || 1000,
    memory_limit: formData.value.memory_limit || 256,
    created_at: new Date().toISOString() // 确保有创建时间
  };
  testCaseEditMode.value = true;
}

// 修改编辑测试用例方法
function editTestCase(testCase: TestCase) {
  currentTestCase.value = { ...testCase };
  testCaseEditMode.value = true;
}

// 修改保存测试用例方法
async function saveTestCase() {
  if (!currentTestCase.value || !testCaseFormRef.value) return;
  
  // 表单验证
  const valid = await testCaseFormRef.value.validate().catch(() => false);
  if (!valid) return;
  
  try {
    submitting.value = true;
    
    if (currentTestCase.value.id) {
      // 更新已有测试用例
      const updateData: UpdateTestCase = {
        input: currentTestCase.value.input,
        output: currentTestCase.value.output,
        is_sample: currentTestCase.value.is_sample,
        score: currentTestCase.value.score,
        time_limit: currentTestCase.value.time_limit,
        memory_limit: currentTestCase.value.memory_limit
      };
      
      await testCaseStore.update(currentTestCase.value.id, updateData);
      ElMessage.success('测试用例更新成功');
    } else {
      // 创建新测试用例
      const createData: CreateTestCase = {
        problem_id: selectedProblemId.value,
        input: currentTestCase.value.input,
        output: currentTestCase.value.output,
        is_sample: currentTestCase.value.is_sample,
        score: currentTestCase.value.score,
        time_limit: currentTestCase.value.time_limit,
        memory_limit: currentTestCase.value.memory_limit
      };
      
      await testCaseStore.create(createData);
      ElMessage.success('测试用例创建成功');
    }
    
    testCaseEditMode.value = false;
    
    // 重新获取测试用例列表
    await testCaseStore.fetchTestCasesByProblemId(selectedProblemId.value);
  } catch (error) {
    ElMessage.error(currentTestCase.value.id ? '更新测试用例失败' : '创建测试用例失败');
    console.error(error);
  } finally {
    submitting.value = false;
  }
}

async function handleSubmit() {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    submitting.value = true;
    try {
      if (dialogMode.value === 'create') {
        await store.create(formData.value);
      } else {
        // 对于更新操作，我们需要构建一个 UpdateProblemRequest 对象
        const updateData: UpdateProblemRequest = {
          title: formData.value.title,
          description: formData.value.description,
          difficulty: formData.value.difficulty,
          tags: formData.value.tags,
          input: formData.value.input,
          output: formData.value.output,
          hint: formData.value.hint,
          sample_input: formData.value.sample_input,
          sample_output: formData.value.sample_output,
          time_limit: formData.value.time_limit,
          memory_limit: formData.value.memory_limit,
          is_public: formData.value.is_public,
        };
        await store.update(editingId.value, updateData);
      }
      dialogVisible.value = false;
      // 重新加载题目列表（管理员端），保留当前筛选
      await store.fetchAdminProblems({
        page: currentPage.value,
        page_size: store.pageSize,
        difficulty: difficulty.value,
        tags: selectedTags.value.length ? selectedTags.value : undefined,
      });
    } catch (error) {
      console.error('保存题目失败:', error);
    } finally {
      submitting.value = false;
    }
  });
}

onMounted(() => {
  // 获取标签列表
  fetchTags();
  // 使用管理员端接口获取题目列表
  store.fetchAdminProblems({ page: 1, page_size: store.pageSize });
});
</script>

<style lang="scss" scoped>
.problem-index {
  max-width: 1680px;
  margin: 0 auto;
  padding: 24px;

  .page-header {
    margin-bottom: 24px;

    .title {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      color: $text-primary;
    }

    .subtitle {
      margin-top: 6px;
      color: $text-secondary;
      font-size: 14px;
    }
  }

  .stats {
    margin-bottom: 24px;

    .grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }

    .stat-card {
      border: 1px solid $border-card;
      border-radius: $border-radius-card;
    }

    .stat-inner {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.info { background: rgba(59,130,246,0.12); color: $color-primary; }
      &.success { background: rgba(34,197,94,0.12); color: $color-success; }
      &.warning { background: rgba(245,158,11,0.12); color: $color-warning; }
      &.danger { background: rgba(239,68,68,0.12); color: $color-danger; }
    }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      color: $text-primary;
    }

    .stat-label {
      margin-top: 4px;
      color: $text-secondary;
      font-size: 13px;
    }
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;

    .left {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      flex: 1;
    }

    .right {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-join {
      display: flex;
      border: 1px solid $border-light;
      border-radius: 12px;
      overflow: hidden;

      .input {
        border: none;
        padding: 10px 12px;
        width: 280px;
        outline: none;
      }

      .join-search {
        border: none;
        background: $bg-card;
        padding: 10px 12px;
        border-left: 1px solid $border-light;
        cursor: pointer;

        &:hover {
          background: $bg-hover;
          color: $color-primary;
        }
      }

      .clear-search {
        border: none;
        background: $bg-card;
        padding: 10px 12px;
        border-left: 1px solid $border-light;
        cursor: pointer;
        color: $text-secondary;

        &:hover {
          color: $color-danger;
          background: rgba(239,68,68,0.06);
        }
      }
    }

    .dropdown-btn {
      border: 1px solid $border-light;
      border-radius: 12px;
      padding: 8px 16px;
      background: $bg-card;
      color: $text-primary;
      font-size: 14px;
      height: 40px;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        border-color: $border-light;
        background: $bg-hover;
      }

      :deep(.el-icon) { margin-left: 0; }
    }
  }

  .table-section {
    .table-card {
      border: 1px solid $border-card;
      border-radius: $border-radius-card;
    }

    .table-container {
      overflow-x: auto;
      position: relative;
    }

    .plain-table {
      width: auto;
      border-collapse: collapse;
      table-layout: fixed;
      min-width: 1300px;

      thead th {
        text-align: left;
        padding: 14px 12px;
        border-bottom: 1px solid $border-light;
        color: $text-primary;
        font-weight: 500;
        font-size: 13px;
      }

      tbody td {
        padding: 12px;
        border-bottom: 1px solid $border-light;
        vertical-align: middle;
      }

      .hover-row:hover {
        background: $bg-hover;
      }
    }

    .checkbox-column { width: 56px; }
    .title-column { width: 200px; }
    .tag-column { width: 250px; }

    .mono { font-family: monospace; font-size: 12px; }
    .muted { color: $text-secondary; }
    .small { font-size: 13px; }

    .link-cell {
      color: $color-primary;
      font-weight: 500;
      cursor: pointer;

      &:hover { text-decoration: underline; }
    }

    .tags-cell { display: flex; gap: 6px; flex-wrap: wrap; }
    .rate-cell { display: flex; align-items: center; gap: 8px; }
    .rate-cell :deep(.el-progress) { flex: 1; }
    .table-actions { display: flex; gap: 8px; }

    .fixed-column {
      position: sticky;
      left: 0;
      background: #fff;
      box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
      z-index: 2;
    }
    .checkbox-column { left: 0; }
    .title-column { left: 56px; }

    .action-column {
      position: sticky;
      right: 0;
      background: #fff;
      box-shadow: -2px 0 4px rgba(0, 0, 0, 0.05);
      width: 230px;
      z-index: 2;
    }
    .fixed-column.action-column { position: sticky; right: 0; left: auto; }

    .ghost-btn { color: $text-primary; }
    .text-error { color: $color-danger; }

    .empty-state {
      text-align: center;
      padding: 60px 20px;

      .empty-icon { font-size: 56px; }
      .empty-title { margin-top: 16px; font-size: 18px; font-weight: 600; color: $text-primary; }
      .empty-desc { margin-top: 4px; color: $text-secondary; }
    }

    .table-footer {
      display: flex;
      justify-content: center;
      padding: 16px;
      border-top: 1px solid $border-light;
    }
  }

  .tag-select {
    width: 240px;
    margin-left: 8px;

    :deep(.el-select__wrapper) {
      border: 1px solid $border-light;
      border-radius: 12px;
      padding: 6px 12px;
      min-height: 40px;
    }

    :deep(.el-select__wrapper:hover) {
      border-color: $border-light;
    }

    :deep(.el-select__wrapper.is-focused) {
      border-color: $color-primary;
    }

    :deep(.el-select__placeholder) {
      color: $text-secondary;
      font-size: 14px;
    }

    :deep(.el-tag) {
      background: $bg-hover;
      border-color: $border-light;
      color: $text-primary;
      border-radius: 6px;
      margin: 1px 2px;
      font-size: 12px;
    }

    :deep(.el-tag .el-tag__close) {
      color: $text-secondary;
    }

    :deep(.el-tag .el-tag__close:hover) {
      background: $color-danger;
      color: #fff;
    }
  }
}
</style>
