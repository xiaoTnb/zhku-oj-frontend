# 仲恺农业工程学院刷题平台

一个基于 Vue 3 + TypeScript + Vite 构建的现代化在线刷题平台，为仲恺农业工程学院学生提供专业的编程练习环境。

## ✨ 功能特性

### 📚 题库系统

- **题目列表**: 支持分页、搜索、筛选的题目展示
- **难度分类**: 简单、中等、困难三个难度等级
- **分类浏览**: 按算法类型（数组、链表、树、图等）分类
- **状态跟踪**: 已解决、未解决、已尝试状态管理
- **统计展示**: 题目数量统计和通过率展示

### 💻 代码编辑器

- **Monaco Editor**: 集成 VS Code 同款编辑器
- **多语言支持**: JavaScript、Python、Java、C++、C、TypeScript
- **智能切换**: 语言切换时保护用户代码
- **主题切换**: 支持浅色/深色主题
- **代码模板**: 每种语言的标准函数模板

### 🔧 在线执行

- **代码运行**: 模拟在线代码执行
- **结果展示**: 详细的运行结果和错误信息
- **提交系统**: 完整的代码提交和测试用例验证
- **性能统计**: 执行时间、内存消耗等指标

### 👥 多角色支持

- **学生端**: 班级管理、课程学习、任务完成
- **教师端**: 课程管理、班级管理、学习数据统计
- **管理员**: 用户管理、题库管理

### 🎨 用户界面

- **现代化设计**: 参考 LeetCode 的专业界面
- **响应式布局**: 完美适配桌面端和移动端
- **流畅交互**: Element Plus 组件库提供的丰富交互

## 🛠️ 技术栈

### 核心框架

- **Vue 3.5+**: 渐进式 JavaScript 框架
- **TypeScript 5.8+**: 类型安全的 JavaScript 超集
- **Vite 7.1+**: 下一代前端构建工具

### 第三方依赖

- **Element Plus 2.10+**: Vue 3 UI 组件库
- **Monaco Editor 0.53+**: VS Code 核心编辑器
- **Vue Router 4.5+**: 官方路由管理器
- **Pinia 3.0+**: Vue 3 状态管理库
- **Axios 1.12+**: HTTP 请求库
- **@zxing/library**: 二维码扫描库

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm (推荐) 或 npm

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

启动后访问 [http://localhost:5173](http://localhost:5173) 查看应用。

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 📁 项目结构

```
src/
├── api/              # 各模块API接口定义
├── components/       # 组件库
│   └── common/       # 通用组件
├── router/           # 路由配置
├── stores/           # Pinia状态管理模块
├── types/            # TypeScript类型定义
├── utils/            # 工具函数
├── views/            # 页面视图
│   ├── admin/        # 管理员功能模块
│   ├── common/       # 通用页面
│   ├── editor/       # 代码编辑器模块
│   ├── problems/     # 题库模块
│   ├── student/      # 学生功能模块
│   ├── teacher/      # 教师功能模块
│   └── user/         # 用户认证模块
├── App.vue           # 应用根组件
├── main.ts           # 应用入口
└── style.css         # 全局样式
```

## 页面路由

| 路由路径 | 页面组件 | 功能描述 |
| -------- | -------- | -------- |
| `/` | 重定向到`/problems` | 首页重定向 |
| `/problems` | `views/problems/IndexView.vue` | 题库首页，显示题目列表 |
| `/problems/category` | `views/problems/CategoryView.vue` | 题库分类页面 |
| `/problems/:id` | `views/problems/DetailView.vue` | 题目详情页面 |
| `/editor/:id` | `views/editor/CodeEditorView.vue` | 代码编辑器页面 |
| `/about` | `views/common/AboutView.vue` | 关于页面 |
| `/login` | `views/user/LoginView.vue` | 登录页面 |
| `/register` | `views/user/RegisterView.vue` | 注册页面 |
| `/forget` | `views/user/ForgetView.vue` | 忘记密码页面 |
| `/student/*` | `views/student/*` | 学生功能模块 |
| `/teacher/*` | `views/teacher/*` | 教师功能模块 |
| `/admin/*` | `views/admin/*` | 管理员功能模块 |

## 核心功能

### 🏠 题库首页 (`/problems`)

- 📊 题目统计数据展示（总题数、难度分布）
- 🔍 题目搜索和筛选功能
- 📋 题目列表展示（包含难度、分类、通过率）
- 🎯 快速开始刷题功能

### 📂 题库分类 (`/problems/category`)

- 🗂️ 按算法类型分类展示
- 📈 每个分类的题目数量统计
- 🎨 卡片式分类布局

### 📝 题目详情 (`/problems/:id`)

- 📖 完整的题目描述
- 💡 输入输出示例
- ⚠️ 约束条件说明
- 🏷️ 题目标签和相关公司
- 💡 解题提示和算法建议

### 💻 代码编辑器 (`/editor/:id`)

- 🖥️ Monaco Editor 代码编辑器（VS Code 同款）
- 🌐 多语言支持（JavaScript、Python、Java、C++）
- ▶️ 代码运行和测试
- 📤 代码提交和结果展示
- 📊 执行统计（用时、内存消耗等）

### 👨‍🎓 学生功能

- 📚 班级管理：查看已加入的班级列表
- 📱 扫码加入：支持通过二维码加入班级
- 📖 课程学习：查看班级关联的课程详情
- 🎯 任务跟踪：跟踪学习进度和任务完成情况

### 👩‍🏫 教师功能

- 📚 课程管理：创建、编辑、删除课程
- 👥 班级管理：创建、管理班级和学生
- 📊 数据统计：查看班级学习统计数据
- 📝 题目关联：管理课程章节和相关题目

### 👨‍💼 管理员功能

- 👥 用户管理：查看、编辑、删除用户账号
- 📚 题库管理：创建、编辑、删除题目
- 🏷️ 标签管理：管理题目分类和标签
- 🔍 内容审核：审核题目内容和测试用例

## 技术架构

### 前端技术栈

- **Vue 3**: 渐进式 JavaScript 框架
- **TypeScript**: 类型安全的 JavaScript 超集
- **Vite**: 快速的前端构建工具
- **Vue Router 4**: 官方路由管理器
- **Pinia**: Vue 3 状态管理库
- **Element Plus**: Vue 3 UI 组件库
- **Monaco Editor**: 代码编辑器核心

### 状态管理

使用Pinia进行全局状态管理，按功能模块拆分store：
- user store: 管理用户认证状态和资料
- problems store: 管理题目相关数据
- course store: 管理课程相关数据
- class store: 管理班级相关数据
- submit store: 管理代码提交相关数据

### 项目特色

- 🎯 **模块化架构**: 按功能模块组织代码结构
- 📱 **响应式设计**: 适配不同屏幕尺寸
- 🎨 **现代化 UI**: 基于 Element Plus 的美观界面
- ⚡ **高性能**: Vite 构建，开发体验优秀
- 🔧 **类型安全**: 完整的 TypeScript 类型定义
- 📦 **组件化**: 可复用的 Vue 组件设计

## 开发说明

本项目使用 Vue 3 的 Composition API 和 `<script setup>` 语法，相关文档：

- [Vue 3 官方文档](https://vuejs.org/)
- [Script Setup 文档](https://vuejs.org/api/sfc-script-setup.html)
- [TypeScript 支持](https://vuejs.org/guide/typescript/overview.html)
- [Vite 文档](https://vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [Monaco Editor 文档](https://microsoft.github.io/monaco-editor/)

### 开发环境要求

- Node.js >= 20.19+ (推荐 22.12+)
- pnpm >= 8.0.0

### 代码规范

- 使用 ESLint + TypeScript 进行代码检查
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case
- 严格的 TypeScript 类型检查
- 每个组件控制在 300 行以内，保持代码可读性

## 🏗️ 设计理念

### 模块化架构

- **按功能分类**: 按照用户角色和功能模块组织代码结构
- **组件复用**: 高度可复用的组件设计
- **职责分离**: 每个组件职责单一，便于维护

### 用户体验

- **专业界面**: 参考 LeetCode 的成熟设计
- **流畅交互**: 丰富的动画和即时反馈
- **响应式布局**: 完美适配各种设备

### 技术选型

- **现代化栈**: Vue 3 + TypeScript + Vite 的最佳实践
- **类型安全**: 完整的 TypeScript 类型定义
- **开发体验**: HMR、自动导入、智能提示

## 📦 项目特色

### 🎨 UI/UX 设计

- **Element Plus 深度定制**: 统一的设计语言和品牌色彩
- **LeetCode 风格**: 专业的刷题平台界面
- **暗色模式**: 支持浅色/深色主题切换
- **响应式设计**: 桌面端、平板端、移动端完美适配

### 💡 技术亮点

- **Monaco Editor 集成**: 完整的 VS Code 编辑体验
- **智能语言切换**: 保护用户代码，避免意外丢失
- **组件化架构**: 高度模块化，易于扩展和维护
- **类型安全**: 完整的 TypeScript 支持
- **多角色权限控制**: 基于JWT的用户认证和角色权限管理

### 🚀 性能优化

- **按需加载**: 路由级别的代码分割
- **组件懒加载**: 提升首屏加载速度
- **构建优化**: Vite 提供的极速开发体验



## 🚀 部署指南

### 构建生产版本

```bash
pnpm build
```

### 本地预览

```bash
pnpm preview
```

### Docker 部署

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
  
    location / {
        root /var/www/dist;
        try_files $uri $uri/ /index.html;
    }
  
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📈 未来规划

### 功能扩展
- [ ]  **编程竞赛模块**: 增加在线编程竞赛功能
- [ ]  **代码版本控制**: 实现代码版本控制功能
- [ ]  **学习路径推荐**: 添加个性化学习路径推荐系统
- [ ]  **第三方评测集成**: 集成第三方代码评测服务

### 技术优化
- [ ]  **微前端架构**: 实施微前端架构
- [ ]  **服务端渲染**: 引入服务端渲染(SSR)
- [ ]  **移动端优化**: 优化移动端用户体验
- [ ]  **系统监控**: 增强系统监控和日志分析能力

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 贡献步骤

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发指南

- 遵循现有的代码风格和命名规范
- 为新功能添加适当的类型定义
- 确保组件代码不超过 300 行
- 添加必要的注释和文档

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 👥 团队

**仲恺农业工程学院** - 人工智能学院

如有问题或建议，请联系项目维护者。

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！
