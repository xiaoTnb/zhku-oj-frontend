<template>
  <el-header class="app-header">
    <div class="header-content">
      <div class="logo-section">
        <el-icon size="28" color="#00af9b">
          <Trophy />
        </el-icon>
        <h1 class="logo-text">仲恺刷题平台</h1>
      </div>

      <el-menu mode="horizontal" :ellipsis="false" :default-active="route.path"
        @select="(key: string) => router.push(key)" class="nav-menu" background-color="transparent" text-color="#262626"
        active-text-color="#00af9b">
        <!-- 题库 - 所有角色都可以看到 -->
        <el-menu-item index="/problems">题库</el-menu-item>
        
        <!-- 课程管理 - 仅教师可见 -->
        <el-menu-item v-if="userRole === 'teacher'" index="/teacher/course">课程管理</el-menu-item>
        
        <!-- 出题权限与后端保存接口保持一致，仅教师和管理员可见。 -->
        <el-menu-item v-if="userRole === 'teacher' || userRole === 'admin'" index="/teacher/ai-generation">AI 出题</el-menu-item>
        <!-- 我的班级 - 仅学生可见 -->
        <el-menu-item v-if="userRole === 'student'" index="/student/class">我的班级</el-menu-item>

        <!-- 我的任务 - 仅学生可见 -->
        <el-menu-item v-if="userRole === 'student'" index="/student/tasks">我的任务</el-menu-item>

        <!-- 用户管理 - 仅管理员可见 -->
        <el-menu-item v-if="userRole === 'admin'" index="/admin/users">用户管理</el-menu-item>

        <!-- 标签管理 - 仅管理员可见 -->
        <el-menu-item v-if="userRole === 'admin'" index="/admin/tags">标签管理</el-menu-item>

        <!-- 题库管理 - 仅管理员可见 -->
        <el-menu-item v-if="userRole === 'admin'" index="/admin/problems">题库管理</el-menu-item>

        <!-- 专业班级管理 - 仅管理员可见 -->
        <el-menu-item v-if="userRole === 'admin'" index="/admin/major-classes">专业班级管理</el-menu-item>
      </el-menu>

      <!-- <div class="header-search">
        <el-input 
          v-model="searchKeyword"
          class="search-input-header" 
          placeholder="搜索题目 / 标签 " 
          clearable
          @keydown="handleSearchKeydown"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button class="search-btn-header" type="primary" @click="handleSearch">搜索</el-button>
      </div> -->

      <div class="header-actions">
        <template v-if="isLoggedIn">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link user-entry">
              <span class="avatar">
                <template v-if="avatar">
                  <img :src="avatar" alt="avatar" />
                </template>
                <template v-else>
                  <el-icon>
                    <User />
                  </el-icon>
                </template>
              </span>
              <span class="name">{{ displayName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/setting')">个人设置</el-dropdown-item>
                <el-dropdown-item @click="router.push('/about')">关于</el-dropdown-item>
                <el-dropdown-item divided @click="onLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" round @click="router.push('/login')">
            <el-icon>
              <User />
            </el-icon>
            登录
          </el-button>
        </template>
      </div>
    </div>
  </el-header>

  <main class="app-main">
    <router-view />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Trophy, User, Search } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 搜索相关状态
const searchKeyword = ref('');

const isLoggedIn = computed(() => userStore.isLoggedIn);
const displayName = computed(() => userStore.displayName);
const avatar = computed(() => userStore.avatar);
const userRole = computed(() => userStore.user?.role);

const onLogout = () => {
  userStore.logout();
  router.push('/login');
};

// 搜索功能
const handleSearch = () => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    return;
  }
  
  // 跳转到题库页面并传递搜索关键词
  router.push({
    path: '/problems',
    query: {
      keyword: keyword
    }
  });
};

// 处理回车键搜索
const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
};

/* 顶部菜单已改为路径索引，使用 route.path 作为默认激活，
   并在模板中直接通过 router.push(key) 跳转，故无需额外计算或选择处理函数。 */
</script>

<style scoped lang="scss">
.app-header {
  background: $bg-card;
  border-bottom: 1px solid $border-default;
  --el-header-height: 64px;
  padding: 0;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 24px;
    position: relative;

    .logo-section {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-shrink: 0;

      .logo-text {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: $text-primary;
      }
    }

    .nav-menu {
      border: none;
      background: transparent;
      margin-left: 60px;
      flex: 1;
      min-width: 0;

      :deep(.el-menu-item) {
        border: none;
        font-weight: 500;
      }
    }

    .header-search {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-left: auto;
      margin-right: 16px;
      flex-shrink: 0;

      .search-input-header {
        :deep(.el-input__wrapper) {
          height: 36px;
          border-radius: $border-radius-card;
          box-shadow: none;
          border: 1px solid $border-default;
        }
        :deep(.el-input__inner) {
          font-size: 14px;
        }
      }

      .search-btn-header {
        height: 36px;
        border-radius: $border-radius-card;
        font-weight: 600;
        letter-spacing: 0.2px;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;

      .user-entry {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: $bg-secondary;
          border: 1px solid $border-default;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .name {
          font-weight: 600;
          color: $text-primary;
        }
      }
    }
  }
}

.app-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
}

.search-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid $border-default;
  border-radius: $border-radius-card;
  font-size: 14px;
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.search-input:focus {
  border-color: $color-primary;
  box-shadow: 0 0 0 3px rgba($color-primary, 0.15);
}
.search-btn {
  height: 40px;
  padding: 0 16px;
  border: 1px solid $color-primary;
  border-radius: $border-radius-card;
  background: $color-primary;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: filter .15s ease, box-shadow .15s ease;
}
.search-btn:hover {
  filter: brightness(1.05);
  box-shadow: 0 6px 18px rgba($color-primary, 0.2);
}
</style>
