<template>
  <div class="setting">
    <!-- 资料卡片 -->
    <el-card class="card" shadow="never">
      <div class="header">
        <div class="main">
          <el-avatar :size="80" :src="user.avatar || ''">
            <template #default>
              <el-icon><User /></el-icon>
            </template>
          </el-avatar>
          <div class="meta">
            <div class="name-row">
              <span class="username">{{ user.username }}</span>
              <el-tag type="success" effect="plain" round>{{
                user.role
              }}</el-tag>
              <el-tag
                :type="user.is_active ? 'success' : 'info'"
                effect="plain"
                round
              >
                {{ user.is_active ? "已激活" : "未激活" }}
              </el-tag>
            </div>
            <div class="id-row">学号/工号：{{ user.student_id }}</div>
            <div class="time-row">
              创建时间：{{ formatCreateTime(user.created_at) }}
            </div>
          </div>
        </div>

        <div class="actions">
          <el-button type="primary" @click="openEdit">修改资料</el-button>
          <el-button @click="refresh">刷新</el-button>
        </div>
      </div>

      <el-divider />

      <!-- 资料网格 -->
      <div class="grid">
        <div class="item">
          <div class="label">真实姓名</div>
          <div class="value">{{ user.real_name || "暂未填写" }}</div>
        </div>
        <div class="item">
          <div class="label">邮箱</div>
          <div class="value">{{ user.email || "暂未填写" }}</div>
        </div>
        <div class="item">
          <div class="label">学校</div>
          <div class="value">{{ user.school || "暂未填写" }}</div>
        </div>
        <div class="item">
          <div class="label">专业</div>
          <div class="value">{{ user.major || "暂未填写" }}</div>
        </div>
        <div class="item">
          <div class="label">年级</div>
          <div class="value">{{ user.grade || "暂未填写" }}</div>
        </div>
        <div class="item">
          <div class="label">班级</div>
          <div class="value">{{ user.class || "暂未填写" }}</div>
        </div>
        <div class="item">
          <div class="label">手机号</div>
          <div class="value">{{ user.phone || "暂未填写" }}</div>
        </div>
        <div class="item col-2">
          <div class="label">个人简介</div>
          <div class="value">{{ user.bio || "暂未填写" }}</div>
        </div>
      </div>
    </el-card>

    <!-- 修改资料弹窗（静态，无提交逻辑） -->
    <el-dialog
      v-model="editVisible"
      title="修改资料"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="88px"
        class="edit-form"
      >
        <el-form-item label="真实姓名">
          <el-input v-model="form.real_name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="学校">
          <el-input v-model="form.school" placeholder="请输入学校" />
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="form.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="form.grade" placeholder="请输入年级" />
        </el-form-item>
        <el-form-item label="班级">
          <el-input v-model="form.class" placeholder="请输入班级" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="4"
            placeholder="请输入个人简介"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editVisible = false" type="default"
            >取消</el-button
          >
          <el-button type="primary" :loading="saving" @click="onSave"
            >保存</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { User } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/user";
import { updateUserProfile, getUserProfile } from "@/api/user";
import type { UserProfile } from "@/types/user";
import { formatCreateTime } from "@/utils/getTime";

const store = useUserStore();

// 为了兼容模板中的 user.xxx，提供一个空对象回退
const user = computed(() => store.user || ({} as UserProfile));

const editVisible = ref(false);
const saving = ref(false);
const form = ref<Partial<UserProfile>>({
  real_name: "",
  email: "",
  school: "",
  major: "",
  grade: "",
  class: "",
  phone: "",
  bio: "",
});

const formRef = ref();
const rules = {
  real_name: [{ required: true, message: "请输入真实姓名", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] },
  ],
  school: [{ required: false, message: "请输入学校", trigger: "blur" }],
  major: [{ required: false, message: "请输入专业", trigger: "blur" }],
  grade: [{ required: false, message: "请输入年级", trigger: "blur" }],
  class: [{ required: false, message: "请输入班级", trigger: "blur" }],
  phone: [
    { required: false, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^(\+?\d{7,15})$/,
      message: "手机号格式不正确",
      trigger: "blur",
    },
  ],
  bio: [{ required: false, message: "请输入个人简介", trigger: "blur" }],
};

const openEdit = () => {
  const u = user.value;
  form.value = {
    real_name: u.real_name || "",
    email: u.email || "",
    school: u.school || "",
    major: u.major || "",
    grade: u.grade || "",
    class: u.class || "",
    phone: u.phone || "",
    bio: u.bio || "",
  };
  editVisible.value = true;
};

const refresh = async () => {
  if (typeof (store as any).refreshProfile === "function") {
    await store.refreshProfile();
  } else {
    // 回退：直接获取 profile 并尝试写入仓库或本地
    try {
      const profile = await getUserProfile();
      if (typeof (store as any).setUser === "function") {
        store.setUser(profile as any);
      } else {
        localStorage.setItem("user", JSON.stringify(profile));
      }
    } catch (e) {
      // 保持静默，避免在无 UI 场景抛错
    }
  }
};

const onSave = async () => {
  if (saving.value) return;
  saving.value = true;
  try {
    await new Promise<void>((resolve, reject) => {
      formRef.value?.validate((valid: boolean) => {
        if (valid) resolve();
        else reject(new Error("表单校验未通过"));
      });
    });

    if (typeof (store as any).updateProfile === "function") {
      await store.updateProfile(form.value);
    } else {
      // 回退：直接调用接口并刷新资料
      await updateUserProfile({
        real_name: form.value.real_name,
        email: form.value.email,
        school: form.value.school,
        major: form.value.major,
        grade: form.value.grade,
        class: form.value.class,
        phone: form.value.phone,
        bio: form.value.bio,
      } as any);
      await store.refreshProfile();
    }
    editVisible.value = false;
    ElMessage.success("资料已更新");
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || "更新失败");
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (!store.user) {
    refresh();
  }
});
</script>

<style lang="scss" scoped>
.setting {
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 24px;
  box-sizing: border-box;
  background: $bg-primary;
  min-height: calc(100vh - 120px);

  .card {
    background: $bg-card;
    border: none;
    border-radius: $border-radius-card-large;
    box-shadow: $shadow-default;
    overflow: hidden;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: $color-primary;
    }

    :deep(.el-divider) {
      margin: 0 32px 24px;
      border-color: $border-default;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 32px 32px 24px;
    background: $bg-secondary;
  }

  .main {
    display: flex;
    gap: 24px;
    align-items: flex-start;

    :deep(.el-avatar) {
      border: 4px solid #ffffff;
      box-shadow: $shadow-light;
      transition: all 0.3s ease;
    }
  }

  .meta {
    display: grid;
    gap: 8px;
    flex: 1;
  }

  .name-row {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;

    :deep(.el-tag) {
      border: none;
      font-weight: 600;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      box-shadow: $shadow-light;
    }

    :deep(.el-tag--success) {
      background: $color-success;
      color: #fff;
    }

    :deep(.el-tag--info) {
      background: $bg-secondary;
      color: $text-primary;
    }
  }

  .username {
    font-size: 24px;
    font-weight: 800;
    color: $text-primary;
    letter-spacing: -0.025em;
  }

  .id-row,
  .time-row {
    font-size: 14px;
    color: $text-secondary;
    font-weight: 500;
  }

  .actions {
    display: flex;
    gap: 12px;
    flex-direction: column;

    :deep(.el-button) {
      border-radius: 12px;
      font-weight: 600;
      padding: 12px 24px;
      transition: all 0.3s ease;
      border: none;
      min-width: 120px;
    }

    :deep(.el-button + .el-button) {
      margin-left: 0;
    }

    :deep(.el-button--primary) {
      background: $color-primary;
      box-shadow: $shadow-light;
    }

    :deep(.el-button--default) {
      background: $bg-secondary;
      color: $text-primary;
      box-shadow: $shadow-light;
    }
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px 24px;
    padding: 0 32px 32px;
  }

  .item {
    background: $bg-secondary;
    border-radius: $border-radius-card;
    padding: 20px;
    border: 1px solid $border-default;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &.col-2 {
      grid-column: span 2;
    }
  }

  .label {
    font-size: 13px;
    color: $text-secondary;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .value {
    font-size: 15px;
    color: $text-primary;
    font-weight: 500;
    line-height: 1.5;
  }

  .edit-form {
    padding: 8px;

    :deep(.el-form-item) {
      margin-bottom: 20px;
    }

    :deep(.el-form-item__label) {
      font-weight: 600;
      color: $text-primary;
    }

    :deep(.el-input__wrapper) {
      border-radius: 12px;
      box-shadow: $shadow-light;
      border: 1px solid $border-default;
      transition: all 0.3s ease;
    }

    :deep(.is-focus .el-input__wrapper) {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
    }

    :deep(.el-textarea__inner) {
      border-radius: 12px;
      border: 1px solid $border-default;
      box-shadow: $shadow-light;
      transition: all 0.3s ease;
    }

    :deep(.el-textarea__inner):focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
    }
  }

  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    :deep(.el-button) {
      border-radius: 12px;
      font-weight: 600;
      padding: 12px 24px;
      transition: all 0.3s ease;
    }

    :deep(.el-button--primary) {
      background: $color-primary;
      border: none;
      box-shadow: $shadow-light;
    }

    :deep(.el-button--default) {
      background: $bg-secondary;
      color: $text-primary;
      border: 1px solid $border-default;
      box-shadow: $shadow-light;
    }
  }
}
</style>
