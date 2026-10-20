import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 定义角色类型
type UserRole = 'admin' | 'teacher' | 'student'

// 扩展路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: UserRole[]
  }
}

const routes: RouteRecordRaw[] = [
  // 认证相关（无需token认证）
  // 登录注册忘记密码
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/LoginView.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/RegisterView.vue'),
    meta: {
      title: '注册',
      requiresAuth: false
    }
  },
  {
    path: '/forget',
    name: 'Forget',
    component: () => import('@/views/user/ForgetView.vue'),
    meta: {
      title: '找回密码',
      requiresAuth: false
    }
  },

  // 主框架父路由 + 子路由（保留原有路径）
  {
    path: '/',
    component: () => import('@/views/common/AppLayout.vue'),
    redirect: '/problems',
    meta: {
      title: '首页框架',
      requiresAuth: true
    },
    children: [
      // 题库模块 - 所有角色都可以访问
      {
        path: 'problems',
        name: 'Problems',
        component: () => import('@/views/problems/IndexView.vue'),
        meta: {
          title: '题库',
          requiresAuth: true,
          roles: ['admin', 'teacher', 'student']
        }
      },
      {
        path: 'problems/category',
        name: 'ProblemCategory',
        component: () => import('@/views/problems/CategoryView.vue'),
        meta: {
          title: '题库分类',
          requiresAuth: true,
          roles: ['admin', 'teacher', 'student']
        }
      },
      {
        path: 'admin/problems',
        name: 'AdminProblems',
        component: () => import('@/views/admin/ProblemIndex.vue'),
        meta: {
          title: '题库管理',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'admin/major-classes',
        name: 'AdminMajorClasses',
        component: () => import('@/views/admin/MajorClassView.vue'),
        meta: {
          title: '专业班级管理',
          requiresAuth: true,
          roles: ['admin']
        }
      },

      // 独立路由同时服务教师和管理员，学生不能访问出题与保存入口。
      {
        path: 'teacher/ai-generation',
        name: 'AIProblemGeneration',
        component: () => import('@/views/teacher/AIGenerationView.vue'),
        meta: { title: 'AI 出题', requiresAuth: true, roles: ['teacher', 'admin'] }
      },
      // 教师模块 - 仅教师可访问
      {
        path: 'teacher/',
        redirect: 'teacher/course',
        meta: {
          requiresAuth: true,
          roles: ['teacher']
        },
        children: [
          {
            path: 'course',
            name: 'TeacherCourse',
            component: () => import('@/views/teacher/CourseIndex.vue'),
            meta: {
              title: '课程管理',
              requiresAuth: true,
              roles: ['teacher']
            }
          },
          {
            path: 'course/:id',
            name: 'TeacherCourseDetail',
            component: () => import('@/views/teacher/CourseDetail.vue'),
            meta: {
              title: '教师课程详情',
              requiresAuth: true,
              roles: ['teacher']
            }
          },
          {
            path: 'class/:clazzes_id',
            name: 'TeacherClassDetail',
            component: () => import('@/views/teacher/ClassDetail.vue'),
            meta: {
              title: '教师班级详情',
              requiresAuth: true,
              roles: ['teacher']
            }
          },
          // 任务详情
          {
            path: 'task/:id',
            name: 'TeacherTaskDetail',
            component: () => import('@/views/teacher/TaskDetail.vue'),
            meta: {
              title: '任务详情',
              requiresAuth: true,
              roles: ['teacher']
            }
          },
        ]
      },
      
      // 学生模块 - 仅学生可访问
      {
        path: 'student/',
        redirect: 'student/class',
        meta: {
          requiresAuth: true,
          roles: ['student']
        },
        children: [
          {
            path: 'class',
            name: 'StudentClass',
            component: () => import('@/views/student/ClassIndex.vue'),
            meta: {
              title: '我的班级',
              requiresAuth: true,
              roles: ['student']
            }
          },
          {
            path: 'class/:id',
            name: 'StudentClassDetail',
            component: () => import('@/views/student/ClassDetail.vue'),
            meta: {
              title: '学生班级详情',
              requiresAuth: true,
              roles: ['student']
            }
          },
          // 我的任务
          {
            path: 'tasks',
            name: 'StudentTasks',
            component: () => import('@/views/student/MyTasks.vue'),
            meta: {
              title: '我的任务',
              requiresAuth: true,
              roles: ['student']
            }
          },
          // 任务详情
          {
            path: 'task/:id',
            name: 'StudentTaskDetail',
            component: () => import('@/views/student/TaskDetail.vue'),
            meta: {
              title: '任务详情',
              requiresAuth: true,
              roles: ['student']
            }
          }
        ]
      },
      
      // 关于/设置/后台管理
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/common/AboutView.vue'),
        meta: {
          title: '关于',
          requiresAuth: true,
          roles: ['admin', 'teacher', 'student']
        }
      },
      {
        path: 'setting',
        name: 'Setting',
        component: () => import('@/views/user/SettingView.vue'),
        meta: {
          title: '个人设置',
          requiresAuth: true,
          roles: ['admin', 'teacher', 'student']
        }
      },
      {
        path: '/admin',
        name: 'Admin',
        redirect: '/admin/users',
        meta: {
          title: '后台管理',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: '/admin/users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserView.vue'),
        meta: {
          title: '用户管理',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: '/admin/tags',
        name: 'AdminTags',
        component: () => import('@/views/admin/TagView.vue'),
        meta: {
          title: '标签管理',
          requiresAuth: true,
          roles: ['admin']
        }
      },
    ]
  },

  // 题目详情/代码编辑器 - 所有登录用户可访问
  {
    path: '/problems/:id',
    name: 'ProblemDetail',
    component: () => import('@/views/problems/DetailView.vue'),
    meta: {
      title: '题目详情',
      requiresAuth: true,
      roles: ['admin', 'teacher', 'student']
    }
  },
  {
    path: '/editor/:id',
    name: 'CodeEditor',
    component: () => import('@/views/editor/CodeEditorView.vue'),
    meta: {
      title: '代码编辑器',
      requiresAuth: true,
      roles: ['admin', 'teacher', 'student']
    }
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/components/common/NotFoundView.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局守卫：权限检查和标题设置
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${String(to.meta.title)} - 仲恺农业工程学院刷题平台`
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth === false) {
    // 不需要认证的页面直接通过
    next()
    return
  }
  
  // 需要认证但用户未登录
  if (!userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 检查角色权限
  const userRole = userStore.user?.role as UserRole
  const requiredRoles = to.meta.roles
  
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(userRole)) {
      // 用户角色不匹配，跳转到404页面
      next({ name: 'NotFound' })
      return
    }
  }
  
  next()
})

export default router