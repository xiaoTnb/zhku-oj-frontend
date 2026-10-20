<template>
  <div class="course-view">
    <!-- 页头：标题 + 操作按钮 -->
    <section class="page-header">
      <div class="header-left">
        <h1 class="title">课程管理</h1>
        <p class="subtitle">管理您的所有课程，包括创建、编辑和删除操作。</p>
      </div>
      <div class="header-right">
        <el-button
          class="refresh-btn"
          @click="onRefresh"
          :loading="store.loading"
        >
          <el-icon>
            <Refresh />
          </el-icon>
        </el-button>
        <el-button type="primary" round class="create-btn" @click="openCreate">
          <el-icon>
            <Plus />
          </el-icon>
          创建新课程
        </el-button>
      </div>
    </section>

    <!-- 概览统计卡片 -->
    <section class="analytics">
      <div class="grid">
        <el-card
          v-for="(stat, i) in stats"
          :key="i"
          class="stat-card"
          shadow="never"
        >
          <div class="stat-inner">
            <div class="stat-icon" :class="stat.type">
              <el-icon>
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </section>

    <!-- 筛选栏：搜索 / 筛选 -->
    <section class="filters">
      <div class="filters-left">
        <el-input
          v-model="keyword"
          placeholder="搜索课程名称..."
          clearable
          class="search-input"
          @keyup.enter="onSearch"
          @clear="onSearch"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button
          class="search-btn"
          @click="onSearch"
          :loading="store.loading"
        >
          <el-icon>
            <Search />
          </el-icon>
          搜索
        </el-button>
      </div>

      <div class="filters-right">
        <el-dropdown @command="handleStatusFilter">
          <el-button class="dropdown-btn">
            <el-icon>
              <Filter />
            </el-icon>
            {{ getStatusFilterLabel() }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">所有课程</el-dropdown-item>
              <el-dropdown-item command="0">未开始</el-dropdown-item>
              <el-dropdown-item command="1">进行中</el-dropdown-item>
              <el-dropdown-item command="2">已结束</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </section>

    <!-- 课程网格卡片（来自后端） -->
    <section class="course-grid" v-loading="store.loading">
      <div class="grid-cards" v-if="courses.length > 0">
        <el-card
          v-for="item in courses"
          :key="item.id"
          class="course-card"
          shadow="hover"
          @click="goDetail(item.id)"
        >
          <figure class="cover">
            <img
              :alt="item.title + '封面'"
              class="cover-img"
              :src="item.cover"
            />
          </figure>
          <div class="card-body">
            <div class="card-header">
              <h2 class="course-title">{{ item.title }}</h2>
              <el-tag
                :type="getStatusType(item.statusLabel)"
                effect="plain"
                round
                >{{ item.statusLabel }}</el-tag
              >
            </div>
            <p class="course-desc">{{ item.desc }}</p>
            <!-- <div class="meta">
              <div class="meta-left">
                <el-icon>
                  <UserFilled />
                </el-icon>
                <span>{{ item.teacher }}</span>
              </div>
              <div class="meta-right">
                <el-icon>
                  <User />
                </el-icon>
                <span>{{ item.students }} 学生</span>
              </div>
            </div> -->
            <!-- 创建时间 -->
            <div class="meta-right" v-if="item.ctime">
              <el-icon>
                <Clock />
              </el-icon>
              <span>{{ item.ctime }}</span>
            </div>
            <div class="card-actions">
              <el-button
                type="default"
                text
                class="action-btn"
                @click.stop="openEdit(item)"
              >
                <el-icon> <Edit /> </el-icon>编辑
              </el-button>
              <el-button
                type="danger"
                text
                class="action-btn"
                @click.stop="onDelete(item)"
              >
                <el-icon> <Delete /> </el-icon>删除
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="courses.length === 0 && !store.loading">
        <div class="empty-icon">📚</div>
        <h3 class="empty-title">暂无课程</h3>
        <p class="empty-desc">点击右上角按钮创建您的第一个课程吧。</p>
        <el-button type="primary" round @click="openCreate">
          <el-icon>
            <Plus />
          </el-icon>
          创建新课程
        </el-button>
      </div>

      <!-- 课程总数提示 -->
      <div class="course-count" v-if="courses.length > 0 && !store.loading">
        <span class="count-text" style="font-weight: 600">
          - - - - - - - - - - - - - - {{ getFilteredCountText() }}- - - - - - -
          - - - - - - -
        </span>
      </div>
    </section>

    <!-- 创建/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑课程' : '创建课程'"
      width="560px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入课程名称"></el-input>
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input
            type="textarea"
            v-model="form.description"
            placeholder="请输入课程描述"
            :rows="4"
          ></el-input>
        </el-form-item>
        <el-form-item label="课程状态" prop="status" v-if="isEdit">
          <el-select
            v-model="form.status"
            placeholder="请选择课程状态"
            style="width: 100%"
          >
            <el-option label="未开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已结束" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="store.loading" @click="onSubmit"
          >保存</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import {
  Search,
  Plus,
  Reading,
  CircleCheck,
  Edit,
  Delete,
  User,
  UserFilled,
  Filter,
  Refresh,
  Clock,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useCourseStore } from "@/stores/course";
import type {
  CourseStatus,
  CreateCoursePayload,
  UpdateCoursePayload,
  CourseCardItem,
} from "@/types/course";

// 修复：确保所有图标组件都已导入
const stats = ref([
  { value: 0, label: "总课程数", type: "info", icon: Reading },
  { value: 0, label: "进行中", type: "success", icon: CircleCheck },
  { value: 0, label: "未开始", type: "warning", icon: Edit },
  { value: 0, label: "已完结", type: "danger", icon: Reading },
]);

const store = useCourseStore();
const router = useRouter();
const keyword = ref("");
const status = ref<CourseStatus | undefined>(undefined);
const courses = computed(() => store.cardList);

/** 获取筛选状态标签 */
function getStatusFilterLabel() {
  if (status.value === undefined) return "筛选";
  const labels: Record<number, string> = {
    0: "未开始",
    1: "进行中",
    2: "已结束",
  };
  return labels[status.value] || "筛选";
}

/** 处理状态筛选 */
function handleStatusFilter(command: string) {
  if (command === "all") {
    status.value = undefined;
  } else {
    const numValue = parseInt(command);
    if (
      !isNaN(numValue) &&
      (numValue === 0 || numValue === 1 || numValue === 2)
    ) {
      status.value = numValue as CourseStatus;
    }
  }
  onSearch();
}

/** 刷新课程列表 */
async function onRefresh() {
  console.log("User clicked refresh");
  keyword.value = "";
  status.value = undefined;
  await store.fetchTeachingList({ page_num: 1, page_size: 999 });
  updateStats();
  ElMessage.success("刷新成功");
}

/** 获取过滤后的课程数量文本 */
function getFilteredCountText() {
  const total = store.total;
  const filtered = courses.value.length;

  if (keyword.value || status.value) {
    return `共找到 ${filtered} 个课程（总计 ${total} 个）`;
  }
  return `共 ${total} 个课程`;
}

async function onSearch() {
  await store.fetchTeachingList({
    page_num: 1,
    page_size: 999, // 一次性获取所有课程
    name: keyword.value || undefined,
    status: status.value,
  });
  updateStats();
}

function updateStats() {
  stats.value[0].value = store.total;
  // 统计进行中的课程
  stats.value[1].value = store.rawCourses.filter((c) => c.status === 1).length;
  // 统计未开始的课程
  stats.value[2].value = store.rawCourses.filter((c) => c.status === 0).length;
  // 统计已完结的课程
  stats.value[3].value = store.rawCourses.filter((c) => c.status === 2).length;
}

// 删除了 mapStatusToNumber 函数，直接使用数字状态

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref<string | null>(null);
const formRef = ref();
const form = ref({
  name: "",
  description: "",
  cover_url: "",
  status: 0 as CourseStatus, // 0-未开始
});

const rules = {
  name: [{ required: true, message: "请输入课程名称", trigger: "blur" }],
  description: [
    { min: 0, max: 500, message: "描述不超过500字", trigger: "blur" },
  ],
  cover_url: [{ type: "url", message: "请输入合法的URL", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

// 修复：添加状态类型映射函数
function getStatusType(statusLabel: string) {
  switch (statusLabel) {
    case "进行中":
      return "success";
    case "已完成":
      return "info";
    case "草稿":
      return "warning";
    default:
      return "info";
  }
}

function openCreate() {
  isEdit.value = false;
  currentId.value = null;
  form.value = { name: "", description: "", cover_url: "", status: 0 };
  dialogVisible.value = true;
}

async function openEdit(item: CourseCardItem) {
  isEdit.value = true;
  currentId.value = item.id;

  // 从 store.rawCourses 中获取原始课程数据
  const rawCourse = store.rawCourses.find((c) => c.id === item.id);

  if (!rawCourse) {
    ElMessage.error("未找到课程数据");
    return;
  }

  // 先打开对话框
  dialogVisible.value = true;

  // 等待 DOM 更新后再赋值，确保表单组件已渲染
  await nextTick();

  // 兼容 title 和 name 字段
  const courseName = rawCourse.title || rawCourse.name || "";

  // 使用原始数据填充表单
  form.value = {
    name: courseName,
    description: rawCourse.description || "",
    cover_url: rawCourse.cover_url || "",
    status: rawCourse.status ?? 0,
  };

  // 强制清除表单验证状态
  await nextTick();
  formRef.value?.clearValidate();
}

function mapLabelToStatus(label: string): CourseStatus {
  switch (label) {
    case "进行中":
      return 1;
    case "已结束":
      return 2;
    case "未开始":
      return 0;
    default:
      return 0;
  }
}

function goDetail(id: string) {
  router.push({ name: "TeacherCourseDetail", params: { id } });
}

async function onSubmit() {
  const formEl: any = formRef.value;
  if (!formEl) return;
  try {
    await formEl.validate();
    if (isEdit.value && currentId.value) {
      const payload: UpdateCoursePayload = {
        id: currentId.value,
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
      };
      await store.update(currentId.value, payload);
      dialogVisible.value = false;
    } else {
      const payload: CreateCoursePayload = {
        name: form.value.name,
        description: form.value.description,
      };
      await store.create(payload);
      dialogVisible.value = false;
    }
  } catch (e: any) {
    console.error("表单提交错误:", e);
  }
}

async function onDelete(item: { id: string; title: string }) {
  try {
    await ElMessageBox.confirm(
      `确认删除课程「${item.title}」吗？该操作不可恢复。`,
      "删除确认",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
    await store.remove(item.id);
  } catch {
    // 用户取消
  }
}

onMounted(async () => {
  await store.fetchTeachingList({ page_num: 1, page_size: 999 });
  updateStats();
});
</script>

<style lang="scss" scoped>
.course-view {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;

    .header-left {
      flex: 1;
    }

    .header-right {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .title {
      margin: 0 0 6px 0;
      font-size: 28px;
      font-weight: 800;
      color: $text-primary;
      letter-spacing: -0.02em;
    }

    .subtitle {
      margin: 0;
      color: $text-secondary;
      font-size: 14px;
      line-height: 1.5;
    }

    .refresh-btn {
      width: 40px;
      height: 40px;
      padding: 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .create-btn {
      :deep(.el-icon) {
        margin-right: 6px;
      }
    }
  }

  .analytics {
    margin-bottom: 24px;

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin: 24px 0;

    .filters-left {
      display: inline-flex;
      gap: 8px;
      align-items: center;
    }

    .filters-right {
      display: inline-flex;
      gap: 8px;
    }

    .search-input {
      width: 320px;
    }

    .search-btn {
      :deep(.el-icon) {
        margin-right: 6px;
      }
    }

    .dropdown-btn {
      :deep(.el-icon) {
        margin-right: 6px;
      }
    }
  }

  .course-grid {
    min-height: 400px;

    .grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
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

    .course-card {
      border: 1px solid $border-card;
      border-radius: $border-radius-card-large;
      overflow: hidden;
      cursor: pointer;
      /* 移除卡片悬停抬升与阴影变化：不需要 transition */

      .cover {
        position: relative;
        margin: 0;
        overflow: hidden;

        .cover-img {
          width: 100%;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
      }

      /* 移除封面悬停缩放 */

      .card-body {
        padding: 16px;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;

          .course-title {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: $text-primary;
            cursor: default;
            flex: 1;
          }
        }

        .course-desc {
          margin: 10px 0 16px;
          color: $text-secondary;
          font-size: 13px;
          line-height: 1.6;
          min-height: 42px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: $text-secondary;
          font-size: 13px;
          margin-bottom: 12px;

          .meta-left,
          .meta-right {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
        }

        .card-actions {
          display: flex;
          gap: 8px;
          border-top: 1px solid $border-light;
          padding-top: 12px;

          .action-btn {
            :deep(.el-icon) {
              margin-right: 6px;
            }
          }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 80px 20px;

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .empty-title {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
    }

    .empty-desc {
      margin: 0 0 24px 0;
      color: $text-secondary;
      font-size: 14px;
    }
  }

  .course-count {
    text-align: center;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid $border-light;
    animation: slideUp 0.3s ease-out;

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .count-text {
      color: $text-secondary;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

/* 统计卡片的类型颜色使用全局变量 */
.stat-card {
  border: 1px solid $border-card;
  border-radius: $border-radius-card-large;
  transition: all 0.3s ease;
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

  &.info {
    background: rgba($color-primary, 0.12);
    color: $color-primary;
  }

  &.success {
    background: rgba($color-success, 0.12);
    color: $color-success;
  }

  &.warning {
    background: rgba($color-warning, 0.12);
    color: $color-warning;
  }

  &.danger {
    background: rgba($color-danger, 0.12);
    color: $color-danger;
  }
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: $text-primary;
  line-height: 1.2;
  transition: transform 0.3s ease;
}

/* 移除统计值悬停缩放：删除空规则 */

.stat-label {
  margin-top: 4px;
  color: $text-secondary;
  font-size: 13px;
}
</style>
