<template>
  <section class="sections">
    <div class="section-header">
      <h2 class="section-title">课程章节</h2>
      <el-button type="primary" class="primary-btn" @click="handleAddSection">
        <el-icon><Plus /></el-icon>
        添加章节
      </el-button>
    </div>

    <div class="space-col">
      <el-card v-for="section in sections" :key="section.id" class="collapse-card" shadow="never">
        <div class="collapse-head">
          <div class="collapse-title">
            <span class="chapter">{{ section.title }}</span>
            <el-tag effect="plain" round>{{ section.materials.length }}个资料</el-tag>
          </div>
          <div class="collapse-actions">
            <el-button class="ghost-btn" text @click="handleEditSection(section.id)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button class="ghost-btn text-error" text @click="handleDeleteSection(section.id)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </div>
        </div>
        <div class="collapse-body">
          <p class="muted">
            {{ section.description }}
          </p>

          <div class="materials">
            <h4 class="materials-title">课程资料</h4>

            <div v-for="material in section.materials" :key="material.id" class="material-row">
              <div class="material-left">
                <el-icon :class="material.type === 'video' ? 'info' : 'error'">
                  <component :is="material.type === 'video' ? VideoCamera : Document" />
                </el-icon>
                <div>
                  <div class="mat-name">{{ material.name }}</div>
                  <div class="mat-meta muted small">{{ material.size }}</div>
                </div>
              </div>
              <div class="material-actions">
                <el-button class="ghost-btn" text @click="handleDownload(material.id)">
                  <el-icon><Download /></el-icon>下载
                </el-button>
                <el-button class="ghost-btn text-error" text @click="handleDeleteMaterial(material.id)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </div>
            </div>
          </div>

          <div class="upload-box" @click="handleUpload(section.id)">
            <el-icon class="upload-icon"><Upload /></el-icon>
            <p class="muted">拖拽文件到此处或点击上传</p>
          </div>
        </div>
      </el-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Edit, Delete, Document, Download, VideoCamera, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 示例数据，实际应从 API 加载
const sections = ref([
  {
    id: '1',
    title: '第1章：数组与字符串',
    description: '介绍数组的基本操作、字符串处理算法，包括双指针技巧和滑动窗口方法。',
    materials: [
      { id: '1', name: '数组基础.pdf', size: '2.3 MB', type: 'document' },
      { id: '2', name: '数组操作演示.mp4', size: '45.2 MB', type: 'video' },
    ]
  },
  {
    id: '2',
    title: '第2章：链表与指针',
    description: '深入学习链表的各种操作，包括单链表、双链表和循环链表的实现与应用。',
    materials: [
      { id: '3', name: '链表详解.pdf', size: '3.1 MB', type: 'document' },
    ]
  },
])

function handleAddSection() {
  ElMessage.info('添加章节功能待实现')
}

function handleEditSection(id: string) {
  ElMessage.info(`编辑章节 ${id}`)
}

function handleDeleteSection(id: string) {
  ElMessage.info(`删除章节 ${id}`)
}

function handleDownload(materialId: string) {
  ElMessage.info(`下载文件 ${materialId}`)
}

function handleDeleteMaterial(materialId: string) {
  ElMessage.info(`删除文件 ${materialId}`)
}

function handleUpload(sectionId: string) {
  ElMessage.info(`上传文件到章节 ${sectionId}`)
}
</script>

<style scoped>
.sections .section-header { display: flex; justify-content: space-between; align-items: center; margin: 28px 0 14px; }
.section-title { font-size: 22px; font-weight: 300; color: #1f2937; }
.space-col { display: grid; gap: 16px; }
.collapse-card { border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; }
.collapse-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 16px 8px 16px; }
.collapse-title { display: inline-flex; align-items: center; gap: 12px; }
.chapter { font-size: 16px; color: #111827; }
.collapse-actions { display: inline-flex; gap: 8px; }
.collapse-body { padding: 0 16px 16px; }
.materials-title { font-size: 15px; color: #111827; margin: 12px 0; }
.material-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 12px; border: 1px solid #eef2f7; border-radius: 12px; background: #fafafa; }
.material-left { display: inline-flex; align-items: center; gap: 10px; }
.mat-name { color: #111827; font-weight: 500; }
.mat-meta { margin-top: 2px; }
.upload-box { border: 2px dashed #e5e7eb; border-radius: 12px; padding: 16px; text-align: center; margin-top: 12px; background: rgba(0,0,0,0.01); }
.upload-icon { font-size: 28px; color: #9aa2af; margin-bottom: 6px; }
.file-input { display: inline-block; margin-top: 6px; }

/* 移动端适配样式 */
@media (max-width: 768px) {
  .sections .section-header {
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
  
  .space-col {
    gap: 12px;
  }
  
  .collapse-head {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }
  
  .collapse-title {
    justify-content: space-between;
    width: 100%;
  }
  
  .chapter {
    font-size: 15px;
    flex: 1;
  }
  
  .collapse-actions {
    justify-content: center;
    width: 100%;
  }
  
  .collapse-body {
    padding: 0 12px 12px;
  }
  
  .materials-title {
    font-size: 14px;
    margin: 8px 0;
  }
  
  .material-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }
  
  .material-left {
    justify-content: flex-start;
    width: 100%;
  }
  
  .material-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    width: 100%;
  }
  
  .upload-box {
    padding: 12px;
    margin-top: 8px;
  }
  
  .upload-icon {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .sections .section-header {
    margin: 12px 0;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .collapse-head {
    padding: 10px;
  }
  
  .chapter {
    font-size: 14px;
  }
  
  .collapse-actions .el-button {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .collapse-body {
    padding: 0 10px 10px;
  }
  
  .materials-title {
    font-size: 13px;
  }
  
  .material-row {
    padding: 10px;
  }
  
  .material-left {
    gap: 8px;
  }
  
  .mat-name {
    font-size: 14px;
  }
  
  .mat-meta {
    font-size: 11px;
  }
  
  .material-actions {
    flex-direction: column;
    gap: 6px;
  }
  
  .material-actions .el-button {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .upload-box {
    padding: 10px;
  }
  
  .upload-icon {
    font-size: 20px;
  }
  
  .upload-box p {
    font-size: 12px;
    margin: 4px 0 0 0;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .collapse-head {
    padding: 14px;
  }
  
  .material-row {
    padding: 10px;
  }
  
  .material-actions {
    gap: 6px;
  }
}
</style>