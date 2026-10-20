<template>
  <div class="auth-page">
    <div class="bgi-overlay"></div>

    <div class="auth-container">
      <div class="auth-card">
        <header class="auth-header">
          <div class="logo-ring">
            <span class="ring r1"></span>
            <span class="ring r2"></span>
            <span class="dot"></span>
          </div>
          <h1 class="title">欢迎登录</h1>
          <p class="subtitle">使用用户名和密码登录您的账号</p>
        </header>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="auth-form el-reset"
          status-icon
        >
          <!-- 学号/工号 -->
          <el-form-item label="学号/工号" prop="student_id">
            <el-input v-model.trim="form.student_id" autocomplete="student_id" placeholder="请输入学号/工号" @keyup.enter="onSubmit" />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item label="密码" prop="password">
            <el-input v-model.trim="form.password" type="password" autocomplete="new-password" placeholder="请输入密码" show-password @keyup.enter="onSubmit" />
          </el-form-item>

          <el-button class="primary-btn el-reset-btn" type="primary" :loading="loading" @click="onSubmit">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>

          <div class="footer-row">
            <span class="muted">还没有账号？</span>
            <span class="link" @click="router.push('/register')">立即注册</span>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref<FormInstance>();

const form = reactive({
  student_id: '',
  password: '',
});

const rules = reactive<FormRules>({
  student_id: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 1, message: '用户名不能为空', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
});

const loading = ref(false);

const onSubmit = async () => {
  if (!formRef.value || loading.value) return;
  
  try {
    // 使用 Element Plus 表单验证
    await formRef.value.validate();
    
    loading.value = true;
    const payload = {
      student_id: form.student_id.trim(),
      password: form.password,
    };
    const { user } = await userStore.login(payload);
    if (!user) {
      throw new Error('登录失败,未返回用户信息');
    }

    // 登录成功提示与跳转(可按角色跳转)
    ElMessage.success('登录成功');
    // if (user?.role === 'admin') router.push('/admin');
    // else if (user?.role === 'teacher') router.push('/teacher');
    // else router.push('/');
    router.push('/');
  } catch (error: any) {
    // 区分表单验证错误和接口错误
    if (error?.response || error?.message) {
      ElMessage.error(error?.response?.data?.message || error?.message || '登录失败');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
@use "sass:color";
.auth-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: $bg-primary url("/login_bgi.webp") center/cover no-repeat fixed;
  overflow: hidden;

  .bgi-overlay {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(60% 60% at 80% 20%, rgba($color-primary, 0.18) 0%, rgba($color-primary, 0) 60%),
      radial-gradient(50% 50% at 10% 80%, rgba($color-primary-hover, 0.10) 0%, rgba($color-primary-hover, 0) 55%),
      linear-gradient(180deg, rgba(#ffffff, 0.55), rgba(#ffffff, 0.72));
    backdrop-filter: saturate(120%) blur(2px);
  }

  .auth-container {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 32px 16px;
  }

  .auth-card {
    width: 100%;
    max-width: 450px;
    padding: 28px 26px;
    border-radius: $border-radius-card-large;
    background: linear-gradient(180deg, rgba($bg-card, 0.92), rgba($bg-card, 0.86));
    border: 1px solid $border-card;
    box-shadow:
      $shadow-default,
      inset 0 1px 0 rgba(#ffffff, 0.6);
    backdrop-filter: blur(12px);

    .auth-header {
      text-align: center;
      margin-bottom: 18px;
      color: $text-primary;

      .logo-ring {
        position: relative;
        width: 64px;
        height: 64px;
        margin: 0 auto 8px;
        filter: drop-shadow(0 2px 10px rgba($color-primary, 0.25));

        .ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba($color-primary, 0.25);
        }
        .r1 { animation: spin 8s linear infinite; }
        .r2 {
          inset: 6px;
          border-color: rgba($color-primary-hover, 0.22);
          animation: spin 10s linear reverse infinite;
        }
        .dot {
          position: absolute;
          top: 6px; left: 50%;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: linear-gradient(180deg, color.adjust($color-primary, $lightness: 25%, $space: hsl), $color-primary-hover);
          transform: translateX(-50%);
          box-shadow: 0 0 10px rgba($color-primary, 0.7);
        }
      }

      .title {
        font-size: 22px;
        font-weight: 650;
        letter-spacing: 0.3px;
        margin: 0;
        color: $text-primary;
      }
      .subtitle {
        margin-top: 6px;
        font-size: 13px;
        color: $text-secondary;
      }
    }
  }

  .auth-form {
    margin-top: 10px;
    display: grid;
    gap: 14px;
  }
}

@keyframes spin { to { transform: rotate(360deg); } }

.el-reset {
  :deep(.el-input__wrapper) {
    background: linear-gradient(180deg, rgba($bg-card, .92), rgba($bg-card, .86));
    border: 1px solid $border-default;
    box-shadow: inset 0 1px 0 rgba(#ffffff, .85);
    border-radius: 12px;
    padding: 0 12px;
    transition: border-color .2s ease, box-shadow .2s ease;
  }
  :deep(.el-input__wrapper:hover) {
    border-color: rgba($color-primary, 0.45);
  }
  :deep(.is-focus .el-input__wrapper),
  :deep(.el-input__wrapper.is-focus) {
    border-color: $color-primary-hover;
    box-shadow: $shadow-light;
  }
  :deep(.el-form-item__label) {
    font-size: 13px;
    color: $text-primary;
    margin-bottom: 6px;
  }
}

.el-reset-btn { width: 100%; }

.primary-btn {
  margin-top: 6px;
  height: 46px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: #ffffff;
  font-weight: 650;
  letter-spacing: 0.2px;
  background: $color-primary;
  box-shadow: $shadow-default, inset 0 1px 0 rgba(#ffffff, 0.6);
  transition: transform .06s ease, filter .2s ease, box-shadow .2s ease;
}
.primary-btn:hover {
  filter: brightness(1.04);
  box-shadow: $shadow-heavy, inset 0 1px 0 rgba(#ffffff, .65);
}
.primary-btn:active { transform: translateY(1px); }

:deep(.el-button.is-loading) {
  opacity: 0.8;
}

.footer-row {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 6px;
  font-size: 13px;

  .muted { color: $text-secondary; }
  .link {
    color: $color-primary;
    text-decoration: none;
    position: relative;
    cursor: pointer;
  }
  .link::after {
    content: "";
    position: absolute;
    left: 0; right: 0; bottom: -2px;
    height: 1px;
    background: linear-gradient(90deg, transparent, $color-primary, transparent);
    opacity: 0.85;
  }
}
</style>
