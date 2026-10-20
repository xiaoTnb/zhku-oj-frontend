<template>
  <section class="related">
    <div class="section-header">
      <h2 class="section-title">关联习题</h2>
      <el-button type="primary" class="primary-btn" @click="handleAddProblem">
        <el-icon><Plus /></el-icon>
        添加习题
      </el-button>
    </div>

    <el-card class="table-card" shadow="never">
      <div class="table-wrap">
        <table class="plain-table">
          <thead>
            <tr>
              <th>
                <div class="th-inner">
                  <span>题目名称</span>
                  <el-icon><Sort /></el-icon>
                </div>
              </th>
              <th>
                <div class="th-inner">
                  <span>难度</span>
                  <el-icon><Sort /></el-icon>
                </div>
              </th>
              <th>
                <div class="th-inner">
                  <span>类型</span>
                  <el-icon><Sort /></el-icon>
                </div>
              </th>
              <th>
                <div class="th-inner">
                  <span>通过率</span>
                  <el-icon><Sort /></el-icon>
                </div>
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="problem in problems" :key="problem.id">
              <td>
                <div class="problem-cell">
                  <el-icon><Cpu /></el-icon>
                  <div>
                    <div class="problem-title">{{ problem.title }}</div>
                    <div class="muted small">{{ problem.description }}</div>
                  </div>
                </div>
              </td>
              <td><el-tag :type="getDifficultyType(problem.difficulty)" effect="plain" round>{{ getDifficultyLabel(problem.difficulty) }}</el-tag></td>
              <td><el-tag effect="plain" round>{{ problem.type }}</el-tag></td>
              <td>
                <div class="rate-cell">
                  <el-progress :percentage="problem.passRate" :status="getProgressStatus(problem.passRate)" />
                  <span class="muted small">{{ problem.passRate }}%</span>
                </div>
              </td>
              <td class="table-actions">
                <el-button class="ghost-btn" text @click="handlePreview(problem.id)">
                  <el-icon><View /></el-icon>预览
                </el-button>
                <el-button class="ghost-btn text-error" text @click="handleUnlink(problem.id)">
                  <el-icon><Link /></el-icon>取消关联
                </el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <div class="muted small">显示 1-{{ problems.length }} 条，共 {{ problems.length }} 条记录</div>
        <div class="join">
          <button class="join-btn">«</button>
          <button class="join-btn active">1</button>
          <button class="join-btn">»</button>
        </div>
      </div>
    </el-card>

    <!-- 移动端卡片视图 -->
    <div class="mobile-card-list">
      <div v-for="problem in problems" :key="problem.id" class="mobile-problem-card">
        <div class="mobile-card-header">
          <div class="problem-info">
            <el-icon><Cpu /></el-icon>
            <div class="problem-details">
              <div class="problem-title">{{ problem.title }}</div>
              <div class="muted small">{{ problem.description }}</div>
            </div>
          </div>
        </div>
        
        <div class="mobile-card-content">
          <div class="info-row">
            <div class="info-item">
              <div class="info-label">难度</div>
              <el-tag :type="getDifficultyType(problem.difficulty)" effect="plain" round>{{ getDifficultyLabel(problem.difficulty) }}</el-tag>
            </div>
            <div class="info-item">
              <div class="info-label">类型</div>
              <el-tag effect="plain" round>{{ problem.type }}</el-tag>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="info-label">通过率</div>
            <div class="rate-cell">
              <el-progress :percentage="problem.passRate" :status="getProgressStatus(problem.passRate)" />
              <span class="muted small">{{ problem.passRate }}%</span>
            </div>
          </div>
        </div>
        
        <div class="mobile-card-actions">
          <el-button class="ghost-btn" text @click="handlePreview(problem.id)">
            <el-icon><View /></el-icon>预览
          </el-button>
          <el-button class="ghost-btn text-error" text @click="handleUnlink(problem.id)">
            <el-icon><Link /></el-icon>取消关联
          </el-button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Sort, Cpu, View, Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 示例数据，实际应从 API 加载
const problems = ref([
  {
    id: '1',
    title: '两数之和',
    description: '给定一个整数数组，返回两个数的索引...',
    difficulty: 'easy',
    type: '数组',
    passRate: 85
  },
  {
    id: '2',
    title: '反转链表',
    description: '给定一个单链表，反转该链表并返回...',
    difficulty: 'medium',
    type: '链表',
    passRate: 67
  },
  {
    id: '3',
    title: '二叉树的最大深度',
    description: '给定一个二叉树，找出其最大深度...',
    difficulty: 'easy',
    type: '树',
    passRate: 92
  },
])

function getDifficultyType(difficulty: string) {
  switch (difficulty) {
    case 'easy': return 'success'
    case 'medium': return 'warning'
    case 'hard': return 'danger'
    default: return 'info'
  }
}

function getDifficultyLabel(difficulty: string) {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return '未知'
  }
}

function getProgressStatus(rate: number) {
  if (rate >= 80) return 'success'
  if (rate >= 50) return 'warning'
  return 'exception'
}

function handleAddProblem() {
  ElMessage.info('添加习题功能待实现')
}

function handlePreview(id: string) {
  ElMessage.info(`预览题目 ${id}`)
}

function handleUnlink(id: string) {
  ElMessage.info(`取消关联题目 ${id}`)
}
</script>

<style scoped>
.related .section-header { display: flex; justify-content: space-between; align-items: center; margin: 28px 0 14px; }
.section-title { font-size: 22px; font-weight: 300; color: #1f2937; }
.table-card { border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; }
.table-wrap { overflow-x: auto; }
.plain-table { width: 100%; border-collapse: collapse; }
.plain-table thead th { text-align: left; padding: 14px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500; }
.plain-table tbody td { padding: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.th-inner { display: inline-flex; align-items: center; gap: 8px; }
.problem-cell { display: inline-flex; align-items: center; gap: 10px; }
.problem-title { font-weight: 500; color: #111827; }
.rate-cell { display: inline-flex; align-items: center; gap: 10px; }
.table-actions { display: inline-flex; gap: 10px; }
.table-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px; border-top: 1px solid #e5e7eb; }
.join { display: inline-flex; gap: 6px; }
.join-btn { min-width: 34px; height: 34px; padding: 0 10px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; color: #374151; font-size: 13px; }
.join-btn.active { background: #111827; color: #fff; border-color: #111827; }

/* 移动端卡片样式 */
.mobile-card-list {
  display: none;
}

.mobile-problem-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
  padding: 16px;
}

.mobile-card-header {
  margin-bottom: 16px;
}

.problem-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.problem-details {
  flex: 1;
}

.mobile-card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  gap: 16px;
}

.info-item {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 4px;
}

.progress-section .rate-cell {
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
  .related .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin: 16px 0;
  }
  
  .section-title {
    font-size: 20px;
    text-align: center;
  }
  
  .primary-btn {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
  
  .table-card {
    display: none;
  }
  
  .mobile-card-list {
    display: block;
  }
}

@media (max-width: 480px) {
  .related .section-header {
    margin: 12px 0;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .mobile-problem-card {
    padding: 12px;
    margin-bottom: 8px;
  }
  
  .mobile-card-header {
    margin-bottom: 12px;
  }
  
  .problem-info {
    gap: 8px;
  }
  
  .problem-title {
    font-size: 14px;
  }
  
  .muted.small {
    font-size: 11px;
  }
  
  .mobile-card-content {
    gap: 12px;
    margin-bottom: 12px;
  }
  
  .info-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .info-label {
    font-size: 11px;
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
  .table-wrap {
    overflow-x: auto;
  }
  
  .plain-table {
    min-width: 600px;
  }
}
</style>