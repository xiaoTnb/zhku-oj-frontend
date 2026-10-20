<template>
  <section class="overview">
    <div class="grid">
      <el-card class="info-card" shadow="never">
        <figure class="cover">
          <img
            alt="课程封面图"
            class="cover-img"
            :src="course?.cover_url || 'https://placehold.co/640x240.png?text=Course+Cover'"
          />
        </figure>
        <h3 class="card-title">课程信息</h3>
        <p class="desc">
          {{ course?.description || '暂无课程描述' }}
        </p>
        <div class="info-list">
          <div class="info-row">
            <span class="label">创建人</span>
            <span class="value">{{ course?.teacher_name || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">创建时间</span>
            <span class="value">{{ formatDate(course?.ctime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">状态</span>
            <el-tag :type="getStatusType(course?.status)" size="small">{{ getStatusLabel(course?.status) }}</el-tag>
          </div>
          <div class="info-row">
            <span class="label">学生人数</span>
            <span class="value">{{ course?.students_count || 0 }} 人</span>
          </div>
        </div>
      </el-card>

      <div class="stats-wrap">
        <div class="stats-top">
          <div class="stat-block">
            <div class="radial">
              <el-progress type="circle" :percentage="85" />
            </div>
            <div class="stat-text">
              <div class="stat-title">学生参与度</div>
              <div class="muted small">活跃参与率</div>
            </div>
          </div>
          <div class="stat-block">
            <div class="radial success">
              <el-progress type="circle" :percentage="78" status="success" />
            </div>
            <div class="stat-text">
              <div class="stat-title">平均分数</div>
              <div class="muted small">课程平均分</div>
            </div>
          </div>
        </div>

        <div class="metrics-grid">
          <el-card class="metric" shadow="never">
            <div class="metric-value primary">{{ course?.students_count || 0 }}</div>
            <div class="metric-label">注册学生</div>
          </el-card>
          <el-card class="metric" shadow="never">
            <div class="metric-value secondary">0</div>
            <div class="metric-label">课程章节</div>
          </el-card>
          <el-card class="metric" shadow="never">
            <div class="metric-value accent">0</div>
            <div class="metric-label">关联习题</div>
          </el-card>
          <el-card class="metric" shadow="never">
            <div class="metric-value info">0%</div>
            <div class="metric-label">完成率</div>
          </el-card>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCourseStore } from '@/stores/course'
import type { CourseStatus } from '@/types/course'

const store = useCourseStore()
const course = computed(() => store.currentCourse)

function formatDate(date?: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

function getStatusType(status?: CourseStatus): '' | 'success' | 'info' | 'warning' {
  switch (status) {
    case 1: return 'success'  // 进行中
    case 2: return 'info'     // 已结束
    case 0: return 'warning'  // 未开始
    default: return 'info'
  }
}

function getStatusLabel(status?: CourseStatus): string {
  switch (status) {
    case 1: return '进行中'
    case 2: return '已结束'
    case 0: return '未开始'
    default: return '未知'
  }
}
</script>

<style scoped>
.overview .grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 992px) { .overview .grid { grid-template-columns: 1fr 1.5fr; } }
.info-card { border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; }
.cover-img { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; }
.card-title { margin: 14px 0 8px; font-size: 18px; font-weight: 500; color: #111827; }
.desc { margin-bottom: 12px; color: #4b5563; line-height: 1.7; font-size: 14px; }
.info-list { display: grid; gap: 10px; margin-top: 8px; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eef2f7; }
.info-row:last-child { border-bottom: none; }
.label { color: #6b7280; }
.value { color: #111827; font-weight: 500; }
.stats-wrap { display: grid; gap: 16px; }
.stats-top { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.stat-block { background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 16px; display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 16px; }
.stat-title { font-size: 16px; color: #111827; }
.radial :deep(.el-progress__text) { font-size: 20px; }
.radial.success :deep(.el-progress__text) { color: #22c55e; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.metric { border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 16px; text-align: center; }
.metric-value { font-size: 28px; font-weight: 300; margin-bottom: 6px; }
.metric-label { color: #6b7280; font-size: 13px; }
.metric-value.primary { color: #2563eb; }
.metric-value.secondary { color: #64748b; }
.metric-value.accent { color: #a9b2bf; }
.metric-value.info { color: #3b82f6; }

/* 移动端适配样式 */
@media (max-width: 768px) {
  .overview .grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .info-card {
    padding: 16px;
  }
  
  .cover-img {
    height: 160px;
  }
  
  .card-title {
    font-size: 16px;
    margin: 12px 0 6px;
  }
  
  .desc {
    font-size: 13px;
    margin-bottom: 10px;
  }
  
  .info-list {
    gap: 8px;
  }
  
  .info-row {
    padding: 6px 0;
  }
  
  .label {
    font-size: 13px;
  }
  
  .value {
    font-size: 13px;
  }
  
  .stats-wrap {
    gap: 12px;
  }
  
  .stats-top {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-block {
    grid-template-columns: 80px 1fr;
    gap: 12px;
    padding: 12px;
  }
  
  .stat-title {
    font-size: 14px;
  }
  
  .radial :deep(.el-progress) {
    width: 60px !important;
    height: 60px !important;
  }
  
  .radial :deep(.el-progress__text) {
    font-size: 14px !important;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .metric {
    padding: 12px;
  }
  
  .metric-value {
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .metric-label {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .overview .grid {
    gap: 12px;
  }
  
  .info-card {
    padding: 12px;
  }
  
  .cover-img {
    height: 120px;
  }
  
  .card-title {
    font-size: 15px;
    margin: 10px 0 6px;
  }
  
  .desc {
    font-size: 12px;
  }
  
  .info-list {
    gap: 6px;
  }
  
  .info-row {
    padding: 4px 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .label {
    font-size: 11px;
  }
  
  .value {
    font-size: 12px;
  }
  
  .stats-wrap {
    gap: 10px;
  }
  
  .stat-block {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 8px;
    padding: 10px;
  }
  
  .stat-title {
    font-size: 13px;
  }
  
  .radial :deep(.el-progress) {
    width: 50px !important;
    height: 50px !important;
  }
  
  .radial :deep(.el-progress__text) {
    font-size: 12px !important;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .metric {
    padding: 10px;
  }
  
  .metric-value {
    font-size: 18px;
  }
  
  .metric-label {
    font-size: 11px;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 991px) {
  .overview .grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  
  .stats-top {
    grid-template-columns: 1fr 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>