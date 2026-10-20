<template>
  <div class="page">
    <div class="overlay"></div>

    <div class="container">
      <div class="card">
        <header class="header">
          <div class="logo">
            <span class="ring r1"></span>
            <span class="ring r2"></span>
            <span class="dot"></span>
          </div>
          <h1 class="title">创建账号</h1>
          <p class="subtitle">填写以下信息完成注册</p>
        </header>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="form"
          status-icon
        >
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model.trim="form.username" autocomplete="username" placeholder="请输入用户名" />
          </el-form-item>

          <!-- 学号/工号 -->
          <el-form-item label="学号/工号" prop="student_id">
            <el-input v-model.trim="form.student_id" autocomplete="student_id" placeholder="请输入学号/工号" /> 
          </el-form-item>

          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="form.email" autocomplete="email" placeholder="请输入邮箱" />
          </el-form-item>

          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role" placeholder="请选择角色" class="role-select" @change="onRoleChange">
              <el-option label="学生" value="student" />
              <el-option label="教师" value="teacher" />
              <!-- <el-option label="管理员" value="admin" /> -->
            </el-select>
          </el-form-item>

          <!-- 专业班级（仅学生） -->
          <el-form-item v-if="form.role === 'student'" label="专业班级" prop="major_class_id">
             <el-select v-model="form.major_class_id" placeholder="请选择专业班级" filterable clearable>
               <el-option
                 v-for="item in majorClasses"
                 :key="item.id"
                 :label="item.name"
                 :value="item.id"
               />
             </el-select>
          </el-form-item>

          <!-- 密码 -->
          <el-form-item label="密码" prop="password">
            <el-input v-model.trim="form.password" type="password" autocomplete="new-password" placeholder="请设置密码（至少6位）" show-password />
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model.trim="form.confirmPassword" type="password" autocomplete="new-password" placeholder="请再次输入密码" show-password />
          </el-form-item>

          <el-button class="primary-btn" type="primary" :loading="submitting" @click="onSubmit">
            {{ submitting ? '注册中…' : '注册' }}
          </el-button>

          <div class="footer">
            <span class="muted">已经有账号？</span>
            <span class="link" type="span" @click.prevent="router.push('/login')">返回登录</span>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { registerUser } from '@/api/user';
import { getMajorClasses } from '@/api/class';

const router = useRouter();

const form = reactive({
  username: '',
  student_id: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student' as 'student' | 'teacher' | 'admin',
  major_class_id: '',
});

const formRef = ref<FormInstance>();
const submitting = ref(false);
const majorClasses = ref<any[]>([]);

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'change'] },
    { min: 2, max: 20, message: '用户名长度 2-20 字', trigger: ['blur', 'change'] },
  ],
  student_id: [
    { required: true, message: '请输入学号/工号', trigger: ['blur', 'change'] },
    { min: 2, max: 20, message: '学号/工号长度 2-20 字', trigger: ['blur', 'change'] },
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
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  major_class_id: [
    {
      validator: (_r, v, cb) => {
        if (form.role === 'student' && !v) {
          return cb(new Error('请选择专业班级'));
        }
        cb();
      },
      trigger: 'change'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur', 'change'] },
    { min: 6, message: '密码至少 6 位', trigger: ['blur', 'change'] },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: ['blur', 'change'] },
    {
      validator: (_r, v, cb) => {
        if (!v) return cb(new Error('请再次输入密码'));
        if (v !== form.password) return cb(new Error('两次输入的密码不一致'));
        cb();
      },
      trigger: ['blur', 'change'],
    },
  ],
};

const onRoleChange = () => {
  if (majorClasses.value.length === 0) {
    fetchMajorClasses();
  }
};

const fetchMajorClasses = async () => {
  try {
    const res = await getMajorClasses({ page: 1, page_size: 100 });
    if (Array.isArray(res)) {
      majorClasses.value = res;
    } else if (res && Array.isArray(res.data)) {
      majorClasses.value = res.data;
    } else {
      majorClasses.value = [];
    }
  } catch (e) {
    console.error('获取专业班级失败', e);
  }
};

const onSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请完善必填信息');
      return;
    }
    submitting.value = true;
    try {
      const payload: any = {
        username: form.username.trim(),
        password: form.password,
        email: form.email.trim(),
        role: form.role,
        student_id: form.student_id.trim(),
      };
      
      if (form.role === 'student' && form.major_class_id) {
        payload.major_class_id = form.major_class_id;
      }
      
      console.log('发送的注册数据:', payload);
      const res = await registerUser(payload);
      ElMessage.success(res.message || '注册成功，正在跳转登录页');
      router.push('/login');
    } catch (e: any) {
      console.error('注册失败详细信息:', e);
      console.error('响应数据:', e?.response?.data);
      ElMessage.error(e?.response?.data?.message || e?.message || '注册失败，请稍后重试');
    } finally {
      submitting.value = false;
    }
  });
};

onMounted(() => {
  // 进入注册页面时清除可能存在的过期 token，确保请求不带 Authorization 头
  localStorage.removeItem('token');
  
  fetchMajorClasses();
});
</script>

<style scoped lang="scss">
.page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: $bg-secondary url("/login_bgi.webp") center/cover no-repeat fixed;
  overflow: hidden;

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba($bg-card, 0.6);
    backdrop-filter: saturate(120%) blur(2px);
  }

  .container {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 32px 16px;
  }

  .card {
    width: 100%;
    max-width: 480px;
    padding: 28px 26px;
    border-radius: $border-radius-card-large;
    background: $bg-card;
    border: 1px solid rgba($border-card, 0.6);
    box-shadow: $shadow-default;
    backdrop-filter: blur(12px);
  }

  .header {
    text-align: center;
    margin-bottom: 18px;
    color: $text-primary;

    .logo {
      position: relative;
      width: 64px;
      height: 64px;
      margin: 0 auto 8px;
      filter: drop-shadow(0 2px 10px rgba(59, 130, 246, 0.25));

      .ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 1px solid rgba(55, 162, 143, 0.25);
      }
      .r1 { animation: spin 8s linear infinite; }
      .r2 {
        inset: 6px;
        border-color: rgba(56, 189, 248, 0.22);
        animation: spin 10s linear reverse infinite;
      }
      .dot {
        position: absolute;
        top: 6px; left: 50%;
        width: 6px; height: 6px;
        border-radius: 50%;
        background-color: $color-primary;
        transform: translateX(-50%);
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
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
      color: $text-tertiary;
    }
  }

  .form {
    margin-top: 10px;
    display: grid;
    gap: 14px;

    :deep(.el-form-item__label) {
      font-size: 13px;
      color: $text-primary;
      margin-bottom: 6px;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select .el-input__wrapper) {
      background: $bg-card;
      border: 1px solid rgba($border-default, .8);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .85);
      border-radius: 12px;
      padding: 0 12px;
      transition: border-color .2s ease, box-shadow .2s ease;

      &:hover {
        border-color: rgba(59, 130, 246, .45);
      }
    }
  }

  .primary-btn {
    width: 100%;
    margin-top: 6px;
    height: 46px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    color: #ffffff;
    font-weight: 650;
    letter-spacing: 0.2px;
    background-color: $color-primary;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6);
    transition: transform .06s ease, filter .2s ease, box-shadow .2s ease;

    &:hover {
      background-color: $color-primary-hover;
      box-shadow: 0 10px 26px rgba(37, 99, 235, 0.32), inset 0 1px 0 rgba(255, 255, 255, .65);
    }
    &:active { transform: translateY(1px); }
  }

  .footer {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    gap: 6px;
    font-size: 13px;

    .muted { color: $text-tertiary; }
    .link {
      color: $color-primary-hover;
      text-decoration: none;
      position: relative;
      cursor: pointer;

      &::after {
        content: "";
        position: absolute;
        left: 0; right: 0; bottom: -2px;
        height: 1px;
        background-color: $color-primary;
        opacity: .85;
      }
    }
  }
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
