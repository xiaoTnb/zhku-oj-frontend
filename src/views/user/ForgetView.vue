<template>
  <div class="auth-page">
    <div class="bgi-overlay" />
    <div class="auth-container">
      <div class="auth-card">
        <header class="auth-header">
          <div class="logo-ring">
            <span class="ring r1"></span>
            <span class="ring r2"></span>
            <span class="dot"></span>
          </div>
          <h1 class="title">找回密码</h1>
          <p class="subtitle">输入学号/工号与邮箱以找回密码</p>
        </header>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="auth-form el-reset" status-icon>
          <el-form-item label="学号/工号" prop="student_id">
            <el-input v-model.trim="form.student_id" placeholder="请输入学号/工号" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="form.email" placeholder="请输入绑定邮箱" />
          </el-form-item>

          <el-button class="primary-btn el-reset-btn" type="primary" :loading="submitting" @click="onSubmit">
            {{ submitting ? '提交中…' : '提交' }}
          </el-button>

          <div class="footer-row">
            <a class="link" @click.prevent="router.push('/login')">返回登录</a>
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

const router = useRouter();

const formRef = ref<FormInstance>();
const form = reactive({ student_id: '', email: '' });
const submitting = ref(false);

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const rules: FormRules = {
  student_id: [
    { required: true, message: '请输入学号/工号', trigger: ['blur', 'change'] },
    { min: 6, message: '学号/工号至少 6 位', trigger: ['blur', 'change'] },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: ['blur', 'change'] },
    {
      validator: (_r, v, cb) => {
        if (!v) return cb(new Error('请输入邮箱'));
        if (!emailRegex.test(v)) return cb(new Error('邮箱格式不正确'));
        cb();
      },
      trigger: ['blur', 'change'],
    },
  ],
};

const onSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      // 暂无接口文档，先做提示。如后端提供 /user/forgot 或 /user/reset，我会接入。
      ElMessage.info('暂未开放找回密码接口，请联系管理员或稍后再试');
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || e?.message || '提交失败');
    } finally {
      submitting.value = false;
    }
  });
};
</script>

<style scoped lang="scss">
@use "sass:color";
.auth-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: $bg-primary url('/login_bgi.png') center/cover no-repeat fixed;
  overflow: hidden;

  .bgi-overlay {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(60% 60% at 80% 20%, rgba($color-primary, .18) 0%, rgba($color-primary, 0) 60%),
      radial-gradient(50% 50% at 10% 80%, rgba(color.adjust($color-primary, $lightness: 15%, $space: hsl), .10) 0%, rgba(color.adjust($color-primary, $lightness: 15%, $space: hsl), 0) 55%),
      linear-gradient(180deg, rgba(255, 255, 255, .55), rgba(255, 255, 255, .72));
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
    max-width: 480px;
    padding: 28px 26px;
    border-radius: $border-radius-card-large;
    background: linear-gradient(180deg, $bg-card, rgba($bg-card, .72));
    border: 1px solid $border-card;
    box-shadow: $shadow-default, inset 0 1px 0 rgba(255, 255, 255, .6);
    backdrop-filter: blur(12px);
  }

  .auth-header {
    text-align: center;
    margin-bottom: 18px;
    color: $text-primary;

    .logo-ring {
      position: relative;
      width: 64px;
      height: 64px;
      margin: 0 auto 8px;
      filter: drop-shadow(0 2px 10px rgba($color-primary, .25));

      .ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 1px solid rgba($color-primary, .25);
      }
      .r1 {
        animation: spin 8s linear infinite;
      }
      .r2 {
        inset: 6px;
        border-color: rgba(color.adjust($color-primary, $lightness: 20%, $space: hsl), .22);
        animation: spin 10s linear reverse infinite;
      }
      .dot {
        position: absolute;
        top: 6px;
        left: 50%;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: linear-gradient(180deg, color.adjust($color-primary, $lightness: 30%, $space: hsl), $color-primary);
        transform: translateX(-50%);
        box-shadow: 0 0 10px rgba($color-primary, .7);
      }
    }

    .title {
      font-size: 22px;
      font-weight: 650;
      letter-spacing: .3px;
      margin: 0;
      color: $text-primary;
    }
    .subtitle {
      margin-top: 6px;
      font-size: 13px;
      color: $text-secondary;
    }
  }

  .auth-form {
    margin-top: 10px;
    display: grid;
    gap: 14px;

    &.el-reset {
      :deep(.el-input__wrapper) {
        background: linear-gradient(180deg, rgba(255, 255, 255, .92), rgba(255, 255, 255, .86));
        border: 1px solid $border-light;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .85);
        border-radius: 12px;
        padding: 0 12px;
        transition: border-color .2s ease, box-shadow .2s ease;
      }
      :deep(.el-input__wrapper:hover) {
        border-color: rgba($color-primary, .45);
      }
      :deep(.is-focus .el-input__wrapper),
      :deep(.el-input__wrapper.is-focus) {
        border-color: $color-primary;
        box-shadow: 0 0 22px rgba($color-primary, .28);
      }
      :deep(.el-form-item__label) {
        font-size: 13px;
        color: $text-primary;
        margin-bottom: 6px;
      }
    }
  }

  .el-reset-btn {
    width: 100%;
  }

  .primary-btn {
    margin-top: 6px;
    height: 46px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    color: #fff;
    font-weight: 650;
    letter-spacing: .2px;
    background: linear-gradient(180deg, $color-primary, color.adjust($color-primary, $lightness: -6%, $space: hsl));
    box-shadow: 0 8px 20px rgba($color-primary, .25), inset 0 1px 0 rgba(255, 255, 255, .6);
    transition: transform .06s ease, filter .2s ease, box-shadow .2s ease;

    &:hover {
      filter: brightness(1.04);
      box-shadow: 0 10px 26px rgba($color-primary, .32), inset 0 1px 0 rgba(255, 255, 255, .65);
    }
    &:active {
      transform: translateY(1px);
    }
  }

  .footer-row {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    gap: 6px;
    font-size: 13px;

    .link {
      color: $color-primary;
      text-decoration: none;
      position: relative;
      cursor: pointer;

      &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -2px;
        height: 1px;
        background: linear-gradient(90deg, transparent, $color-primary, transparent);
        opacity: .85;
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
