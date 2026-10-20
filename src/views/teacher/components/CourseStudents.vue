<template>
  <section class="students">
    <div class="section-header">
      <h2 class="section-title">学生名单</h2>
      <div class="header-actions">
        <el-button class="ghost-btn" @click="handleBatchAssign">
          <el-icon><Document /></el-icon>
          批量分配作业
        </el-button>
        <el-button type="primary" class="primary-btn" @click="handleAddStudent">
          <el-icon><CirclePlus /></el-icon>
          添加学生
        </el-button>
      </div>
    </div>

    <div class="filters">
      <div class="search-join">
        <input class="input" placeholder="搜索学生姓名或学号..." />
        <button class="join-search">
          <el-icon><Search /></el-icon>
        </button>
      </div>
      <div class="selects">
        <select class="select">
          <option selected>进度筛选</option>
          <option>全部</option>
          <option>未开始</option>
          <option>进行中</option>
          <option>已完成</option>
        </select>
        <select class="select">
          <option selected>成绩筛选</option>
          <option>全部</option>
          <option>优秀(90+)</option>
          <option>良好(80-89)</option>
          <option>及格(60-79)</option>
          <option>不及格(<60)</option>
        </select>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <div class="table-wrap">
        <table class="plain-table">
          <thead>
            <tr>
              <th style="width: 48px;">
                <label><input type="checkbox" class="checkbox" /></label>
              </th>
              <th>
                <div class="th-inner">
                  <span>学生信息</span>
                  <el-icon><Sort /></el-icon>
                </div>
              </th>
              <th>
                <div class="th-inner">
                  <span>学习进度</span>
                  <el-icon><Sort /></el-icon>
                </div>
              </th>
              <th>
                <div class="th-inner">
                  <span>成绩</span>
                  <el-icon><Sort /></el-icon>
                </div>
              </th>
              <th>
                <div class="th-inner">
                  <span>最后活跃</span>
                  <el-icon><Sort /></el-icon>
                </div>
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in students" :key="student.id">
              <td>
                <label><input type="checkbox" class="checkbox" /></label>
              </td>
              <td>
                <div class="user-cell">
                  <div class="avatar" :class="getAvatarClass(index)">{{ student.name.substring(0, 2) }}</div>
                  <div>
                    <div class="user-name">{{ student.name }}</div>
                    <div class="muted small">学号: {{ student.id }}</div>
                    <div class="muted small">{{ student.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="rate-cell">
                  <el-progress :percentage="student.progress" :status="getProgressStatus(student.progress)" />
                  <span class="muted small">{{ student.progress }}%</span>
                </div>
                <div class="muted tiny">{{ student.completedChapters }}/{{ student.totalChapters }} 章节完成</div>
              </td>
              <td>
                <div class="score">
                  <span class="score-num" :class="student.scoreLevel">{{ student.score }}</span>
                  <el-tag :type="getScoreType(student.scoreLevel)" size="small">{{ getScoreLabel(student.scoreLevel) }}</el-tag>
                </div>
              </td>
              <td><span>{{ student.lastActive }}</span></td>
              <td class="table-actions">
                <el-button class="ghost-btn" text @click="handleViewDetail(student.id)">
                  <el-icon><View /></el-icon>查看详情
                </el-button>
                <el-button class="ghost-btn text-error" text @click="handleRemoveStudent(student.id)">
                  <el-icon><Remove /></el-icon>移除
                </el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <div class="muted small">显示 1-{{ students.length }} 条，共 {{ students.length }} 条记录</div>
        <div class="join">
          <button class="join-btn">«</button>
          <button class="join-btn active">1</button>
          <button class="join-btn">»</button>
        </div>
      </div>
    </el-card>

    <!-- 移动端卡片视图 -->
    <div class="mobile-card-list">
      <div v-for="(student, index) in students" :key="student.id" class="mobile-student-card">
        <div class="mobile-card-header">
          <div class="user-info">
            <div class="avatar" :class="getAvatarClass(index)">{{ student.name.substring(0, 2) }}</div>
            <div class="user-details">
              <div class="user-name">{{ student.name }}</div>
              <div class="muted small">学号: {{ student.id }}</div>
              <div class="muted small">{{ student.email }}</div>
            </div>
          </div>
          <label><input type="checkbox" class="checkbox" /></label>
        </div>
        
        <div class="mobile-card-content">
          <div class="progress-section">
            <div class="section-label">学习进度</div>
            <el-progress :percentage="student.progress" :status="getProgressStatus(student.progress)" />
            <div class="progress-text">{{ student.progress }}% ({{ student.completedChapters }}/{{ student.totalChapters }} 章节)</div>
          </div>
          
          <div class="score-section">
            <div class="section-label">成绩</div>
            <div class="score">
              <span class="score-num" :class="student.scoreLevel">{{ student.score }}</span>
              <el-tag :type="getScoreType(student.scoreLevel)" size="small">{{ getScoreLabel(student.scoreLevel) }}</el-tag>
            </div>
          </div>
          
          <div class="activity-section">
            <div class="section-label">最后活跃</div>
            <span>{{ student.lastActive }}</span>
          </div>
        </div>
        
        <div class="mobile-card-actions">
          <el-button class="ghost-btn" text @click="handleViewDetail(student.id)">
            <el-icon><View /></el-icon>查看详情
          </el-button>
          <el-button class="ghost-btn text-error" text @click="handleRemoveStudent(student.id)">
            <el-icon><Remove /></el-icon>移除
          </el-button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Document, CirclePlus, Search, Sort, View, Remove } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 示例数据，实际应从 API 加载
const students = ref([
  {
    id: '2024001',
    name: '张三',
    email: 'zhangsan@example.com',
    progress: 75,
    completedChapters: 9,
    totalChapters: 12,
    score: 85,
    scoreLevel: 'excellent',
    lastActive: '昨天'
  },
  {
    id: '2024002',
    name: '李四',
    email: 'lisi@example.com',
    progress: 45,
    completedChapters: 5,
    totalChapters: 12,
    score: 72,
    scoreLevel: 'good',
    lastActive: '2天前'
  },
  {
    id: '2024003',
    name: '王五',
    email: 'wangwu@example.com',
    progress: 100,
    completedChapters: 12,
    totalChapters: 12,
    score: 95,
    scoreLevel: 'excellent',
    lastActive: '今天'
  },
])

function getAvatarClass(index: number) {
  const classes = ['primary', 'secondary', 'accent']
  return classes[index % classes.length]
}

function getProgressStatus(progress: number) {
  if (progress >= 80) return 'success'
  if (progress >= 50) return ''
  return 'warning'
}

function getScoreType(level: string) {
  switch (level) {
    case 'excellent': return 'success'
    case 'good': return 'warning'
    default: return 'info'
  }
}

function getScoreLabel(level: string) {
  switch (level) {
    case 'excellent': return '优秀'
    case 'good': return '良好'
    case 'pass': return '及格'
    default: return '不及格'
  }
}

function handleBatchAssign() {
  ElMessage.info('批量分配作业功能待实现')
}

function handleAddStudent() {
  ElMessage.info('添加学生功能待实现')
}

function handleViewDetail(id: string) {
  ElMessage.info(`查看学生 ${id} 详情`)
}

function handleRemoveStudent(id: string) {
  ElMessage.info(`移除学生 ${id}`)
}
</script>

<style scoped>
.students .section-header { display: flex; justify-content: space-between; align-items: center; margin: 28px 0 14px; }
.section-title { font-size: 22px; font-weight: 300; color: #1f2937; }
.filters { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin: 12px 0 16px; }
.search-join { display: inline-flex; align-items: center; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.input { border: none; padding: 10px 12px; width: 280px; outline: none; }
.join-search { border: none; background: #fff; padding: 10px 12px; border-left: 1px solid #e5e7eb; }
.selects { display: inline-flex; gap: 10px; }
.select { border: 1px solid #e5e7eb; background: #fff; border-radius: 10px; padding: 8px 10px; }
.table-card { border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; }
.table-wrap { overflow-x: auto; }
.plain-table { width: 100%; border-collapse: collapse; }
.plain-table thead th { text-align: left; padding: 14px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500; }
.plain-table tbody td { padding: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.th-inner { display: inline-flex; align-items: center; gap: 8px; }
.user-cell { display: inline-flex; align-items: center; gap: 12px; }
.avatar { width: 44px; height: 44px; border-radius: 50%; display: inline-flex; justify-content: center; align-items: center; font-size: 12px; font-weight: 600; color: #fff; }
.avatar.primary { background: #2563eb; }
.avatar.secondary { background: #64748b; }
.avatar.accent { background: #a9b2bf; }
.user-name { color: #111827; font-weight: 500; }
.rate-cell { display: inline-flex; align-items: center; gap: 10px; }
.score { display: inline-flex; align-items: center; gap: 8px; }
.score-num { font-size: 18px; font-weight: 600; }
.score-num.success { color: #22c55e; }
.score-num.warning { color: #f59e0b; }
.score-num.excellent { color: #22c55e; }
.score-num.good { color: #f59e0b; }
.table-actions { display: inline-flex; gap: 10px; }
.table-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px; border-top: 1px solid #e5e7eb; }
.join { display: inline-flex; gap: 6px; }
.join-btn { min-width: 34px; height: 34px; padding: 0 10px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; color: #374151; font-size: 13px; }
.join-btn.active { background: #111827; color: #fff; border-color: #111827; }

/* 移动端卡片样式 */
.mobile-card-list {
  display: none;
}

.mobile-student-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
  padding: 16px;
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-details {
  flex: 1;
}

.mobile-card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.section-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 4px;
}

.progress-section .progress-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.mobile-card-actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .students .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin: 16px 0;
  }
  
  .section-title {
    font-size: 20px;
    text-align: center;
  }
  
  .header-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }
  
  .header-actions .el-button {
    flex: 1;
    max-width: 160px;
  }
  
  .filters {
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
  }
  
  .search-join {
    width: 100%;
  }
  
  .input {
    width: 100%;
    min-width: 0;
  }
  
  .selects {
    display: flex;
    gap: 8px;
    width: 100%;
  }
  
  .select {
    flex: 1;
    min-width: 0;
  }
  
  .table-card {
    display: none;
  }
  
  .mobile-card-list {
    display: block;
  }
}

@media (max-width: 480px) {
  .students .section-header {
    margin: 12px 0;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .header-actions .el-button {
    max-width: none;
  }
  
  .filters {
    margin: 12px 0;
  }
  
  .selects {
    flex-direction: column;
    gap: 8px;
  }
  
  .mobile-student-card {
    padding: 12px;
    margin-bottom: 8px;
  }
  
  .mobile-card-header {
    margin-bottom: 12px;
  }
  
  .user-info {
    gap: 8px;
  }
  
  .avatar {
    width: 36px;
    height: 36px;
    font-size: 11px;
  }
  
  .user-name {
    font-size: 14px;
  }
  
  .muted.small {
    font-size: 11px;
  }
  
  .mobile-card-content {
    gap: 12px;
    margin-bottom: 12px;
  }
  
  .mobile-card-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .mobile-card-actions .el-button {
    justify-content: flex-start;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .input {
    width: 240px;
  }
  
  .table-wrap {
    overflow-x: auto;
  }
  
  .plain-table {
    min-width: 700px;
  }
}
</style>