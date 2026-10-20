<template>
    <div class="task-detail" v-loading="loading">
        <!-- 页头 -->
        <section class="page-header">
            <div class="header-left">
                <div class="header-info">
                    <h1 class="title">{{ taskData?.title || '任务详情' }}</h1>
                    <div class="meta-tags">
                        <el-tag :type="statusType" size="large">{{ statusLabel }}</el-tag>
                        <el-tag :type="typeType" size="large" effect="plain">
                            <el-icon>
                                <component :is="typeIcon" />
                            </el-icon>
                            {{ typeLabel }}
                        </el-tag>
                    </div>
                </div>
            </div>
            <div class="header-actions">
                <el-button @click="goBack" class="back-btn">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    返回班级详情
                </el-button>
                <el-button v-if="isTeacher" @click="handleEdit" :disabled="!canEdit" type="primary">
                    <el-icon>
                        <Edit />
                    </el-icon>
                    编辑任务
                </el-button>
                <el-button v-if="isTeacher" type="danger" @click="handleDelete">
                    <el-icon>
                        <Delete />
                    </el-icon>
                    删除任务
                </el-button>
            </div>
        </section>

        <!-- 任务概览 -->
        <section class="task-overview">
            <el-row :gutter="20">
                <!-- 基本信息卡片 -->
                <el-col :xs="24" :lg="16">
                    <el-card class="info-card" shadow="hover">
                        <template #header>
                            <div class="card-header">
                                <span class="card-title">
                                    <el-icon>
                                        <InfoFilled />
                                    </el-icon>
                                    任务信息
                                </span>
                            </div>
                        </template>

                        <div class="info-content">

                            <div class="info-item description">
                                <div class="info-label">
                                    <el-icon>
                                        <Reading />
                                    </el-icon>
                                    任务描述
                                </div>
                                <div class="info-value description">
                                    {{ taskData?.description || '暂无描述' }}
                                </div>
                            </div>

                            <div class="info-item">
                                <div class="info-label">
                                    <el-icon>
                                        <Calendar />
                                    </el-icon>
                                    开始时间
                                </div>
                                <div class="info-value">{{ formatDate(taskData?.start_time) }}</div>
                            </div>

                            <div class="info-item">
                                <div class="info-label">
                                    <el-icon>
                                        <Timer />
                                    </el-icon>
                                    结束时间
                                </div>
                                <div class="info-value">{{ formatDate(taskData?.end_time) }}</div>
                            </div>

                            <div class="info-item">
                                <div class="info-label">
                                    <el-icon>
                                        <Clock />
                                    </el-icon>
                                    创建时间
                                </div>
                                <div class="info-value">{{ formatDate(taskData?.ctime) }}</div>
                            </div>

                            <div class="info-item">
                                <div class="info-label">
                                    <el-icon>
                                        <Clock />
                                    </el-icon>
                                    更新时间
                                </div>
                                <div class="info-value">{{ formatDate(taskData?.mtime) }}</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>

                <!-- 统计卡片 -->
                <el-col :xs="24" :lg="8">
                    <el-card class="stats-card" shadow="hover">
                        <template #header>
                            <div class="card-header">
                                <span class="card-title">
                                    <el-icon>
                                        <DataAnalysis />
                                    </el-icon>
                                    完成统计
                                </span>
                            </div>
                        </template>

                        <div class="stats-content">
                            <div class="stat-item">
                                <div class="stat-icon resource">
                                    <el-icon>
                                        <Files />
                                    </el-icon>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-label">关联题目</div>
                                    <div class="stat-value">{{ relationCount }}</div>
                                </div>
                            </div>

                            <div class="stat-item">
                                <div class="stat-icon finished">
                                    <el-icon>
                                        <User />
                                    </el-icon>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-label">完成人数</div>
                                    <div class="stat-value">{{ finishCount }} / {{ totalMemberCount }}</div>
                                </div>
                            </div>

                            <div class="stat-item">
                                <div class="stat-icon progress">
                                    <el-icon>
                                        <TrendCharts />
                                    </el-icon>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-label">完成率</div>
                                    <div class="stat-value">{{ completionRate }}%</div>
                                </div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </section>

        <!-- 关联题目列表 -->
        <section class="task-resources">
            <el-card class="resources-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <span class="card-title">
                            <el-icon>
                                <List />
                            </el-icon>
                            关联题目
                            <el-tag size="small" class="count-tag">{{ relationCount }}</el-tag>
                        </span>
                        <el-button v-if="isTeacher" :disabled="!canEdit" type="primary" size="default"
                            @click="handleManageProblems" class="manage-problems-btn">
                            <el-icon>
                                <Setting />
                            </el-icon>
                            管理题目
                        </el-button>
                    </div>
                </template>

                <div class="resources-content">
                    <el-empty v-if="relationCount === 0" description="暂无关联题目" />
                    <div v-else>
                        <!-- 题目列表 -->
                        <div class="resource-list">
                            <div v-for="(question, index) in taskData?.questions" :key="question.id"
                                class="resource-item">
                                <div class="resource-index">{{ index + 1 }}</div>
                                <div class="resource-info">
                                    <div class="problem-header">
                                        <span class="problem-title">
                                            {{ (question?.unique_id != null ? question.unique_id + '.' : '') + question.title }}
                                        </span>
                                        <el-tag v-if="question.difficulty"
                                            :type="getDifficultyType(question.difficulty)"
                                            size="small" class="difficulty-tag">
                                            {{ getDifficultyLabel(question.difficulty) }}
                                        </el-tag>
                                        <el-tag v-if="question.completed" type="success" size="small" class="completed-tag">
                                            <el-icon><Select /></el-icon>
                                            已完成
                                        </el-tag>
                                    </div>
                                </div>
                                <div class="resource-actions">
                                    <el-button text type="primary" size="small" class="action-btn view-btn"
                                        @click="handleViewProblem(question.id)">
                                        <el-icon>
                                            <View />
                                        </el-icon>
                                        查看
                                    </el-button>
                                    <el-button v-if="isTeacher && canEdit" text type="danger" size="small"
                                        class="action-btn remove-btn" @click="handleRemoveProblem(question.id)">
                                        <el-icon>
                                            <Delete />
                                        </el-icon>
                                        移除
                                    </el-button>
                                    <el-button v-if="!isTeacher && !question.completed" text type="success"
                                        size="small" class="action-btn finish-btn"
                                        @click="handleFinishProblem(question.id)">
                                        <el-icon>
                                            <CircleCheck />
                                        </el-icon>
                                        完成
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </el-card>
        </section>

        <!-- 完成情况 (仅教师可见) -->
        <section class="task-completion" v-if="isTeacher">
            <el-card class="completion-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <span class="card-title">
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                            完成情况
                            <el-tag size="small" class="count-tag">{{ taskStore.completionPagination.total }}</el-tag>
                        </span>
                        <div class="header-actions">
                            <div class="search-container">
                                <el-input
                                    v-model="completionSearchKeyword"
                                    placeholder="搜索学生姓名或学号"
                                    clearable
                                    @input="handleCompletionSearch"
                                    class="search-input"
                                    size="default"
                                >
                                    <template #prefix>
                                        <el-icon class="search-icon"><Search /></el-icon>
                                    </template>
                                </el-input>
                            </div>
                        </div>
                    </div>
                </template>

                <div class="completion-content" v-loading="taskStore.completionLoading">
                    <el-empty v-if="taskStore.completionList.length === 0 && !taskStore.completionLoading" 
                              description="暂无学生数据" 
                              :image-size="120">
                        <template #image>
                            <el-icon size="120" color="#d3d3d3">
                                <UserFilled />
                            </el-icon>
                        </template>
                    </el-empty>
                    <div v-else class="completion-table">
                        <el-table 
                            :data="taskStore.completionList" 
                            stripe 
                            :header-cell-style="{ 
                                backgroundColor: '#f8f9fa', 
                                color: '#606266',
                                fontWeight: '600',
                                borderBottom: '2px solid #e4e7ed',
                                textAlign: 'center',
                                padding: '16px 12px'
                            }"
                            :cell-style="{ 
                                textAlign: 'center',
                                padding: '16px 12px',
                                verticalAlign: 'middle'
                            }"
                            class="modern-table">
                            <el-table-column prop="student_id" label="学号" width="270" header-align="center" align="center">
                                <template #default="{ row }">
                                    <div class="student-id">
                                        <el-icon class="id-icon">
                                            <User />
                                        </el-icon>
                                        <span>{{ row.student_id }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="real_name" label="姓名" width="250" header-align="center" align="center">
                                <template #default="{ row }">
                                    <div class="student-name">
                                        <!-- <el-avatar :size="32" class="name-avatar">
                                            {{ row.real_name?.charAt(0) || '学' }}
                                        </el-avatar> -->
                                        <span class="name-text">{{ row.real_name }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="完成状态" width="260" header-align="center" align="center">
                                <template #default="{ row }">
                                    <div class="status-container">
                                        <el-tag 
                                            :type="row.completed ? 'success' : 'warning'" 
                                            size="default"
                                            effect="light"
                                            class="status-tag">
                                            <el-icon class="status-icon">
                                                <component :is="row.completed ? 'CircleCheckFilled' : 'Clock'" />
                                            </el-icon>
                                            {{ row.completed ? '已完成' : '进行中' }}
                                        </el-tag>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="完成进度" width="420" header-align="center" align="center">
                                <template #default="{ row }">
                                    <div class="progress-container">
                                        <div class="progress-text">
                                            <span class="progress-numbers">{{ row.finished_questions }}/{{ row.total_questions }}</span>
                                            <!-- <span class="progress-percentage">{{ Math.round((row.finished_questions / row.total_questions) * 100) }}%</span> -->
                                        </div>
                                        <el-progress 
                                            :percentage="Math.round((row.finished_questions / row.total_questions) * 100)"
                                            :stroke-width="8"
                                            :show-text="false"
                                            :color="getProgressColor(Math.round((row.finished_questions / row.total_questions) * 100))"
                                            class="progress-bar"
                                        />
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>

                        <!-- 移动端卡片列表 -->
                        <div class="mobile-completion-list">
                            <div 
                                v-for="(row, index) in taskStore.completionList" 
                                :key="row.student_id || index"
                                class="completion-card-item">
                                <div class="completion-card-header">
                                    <div class="completion-student-info">
                                        <el-avatar :size="32" class="name-avatar">
                                            {{ row.real_name?.charAt(0) || '学' }}
                                        </el-avatar>
                                        <div class="completion-student-details">
                                            <div class="completion-student-name">{{ row.real_name }}</div>
                                            <div class="completion-student-id">{{ row.student_id }}</div>
                                        </div>
                                    </div>
                                    <el-tag 
                                        :type="row.completed ? 'success' : 'warning'" 
                                        size="small"
                                        effect="light"
                                        class="completion-status-tag">
                                        <el-icon class="status-icon">
                                            <component :is="row.completed ? 'CircleCheckFilled' : 'Clock'" />
                                        </el-icon>
                                        {{ row.completed ? '已完成' : '进行中' }}
                                    </el-tag>
                                </div>
                                <div class="completion-card-body">
                                    <div class="completion-progress-section">
                                        <div class="completion-progress-header">
                                            <span class="completion-progress-label">完成进度</span>
                                            <span class="completion-progress-numbers">{{ row.finished_questions }}/{{ row.total_questions }}</span>
                                        </div>
                                        <el-progress 
                                            :percentage="Math.round((row.finished_questions / row.total_questions) * 100)"
                                            :stroke-width="6"
                                            :show-text="false"
                                            :color="getProgressColor(Math.round((row.finished_questions / row.total_questions) * 100))"
                                            class="completion-progress-bar"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 分页组件 -->
                    <div class="pagination-wrapper" v-if="taskStore.completionList.length > 0">
                        <el-pagination
                            v-model:current-page="taskStore.completionPagination.page"
                            v-model:page-size="taskStore.completionPagination.pageSize"
                            :page-sizes="[10, 20, 50, 100]"
                            :total="taskStore.completionPagination.total"
                            layout="total, sizes, prev, pager, next, jumper"
                            @size-change="handleCompletionPageSizeChange"
                            @current-change="handleCompletionPageChange"
                            background
                        />
                    </div>
                </div>
            </el-card>
        </section>

        <!-- 编辑任务对话框 -->
        <el-dialog v-model="editDialogVisible" title="编辑任务" width="600px" @close="handleEditCancel">
            <el-form :model="editForm" label-width="100px">
                <el-form-item label="任务标题" required>
                    <el-input v-model="editForm.title" placeholder="请输入任务标题" maxlength="100" show-word-limit />
                </el-form-item>

                <el-form-item label="任务类型" required>
                    <el-radio-group v-model="editForm.type">
                        <el-radio :label="1">
                            <el-icon>
                                <DocumentCopy />
                            </el-icon>
                            题单
                        </el-radio>
                        <el-radio :label="2">
                            <el-icon>
                                <VideoCamera />
                            </el-icon>
                            视频
                        </el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="任务描述">
                    <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入任务描述"
                        maxlength="500" show-word-limit />
                </el-form-item>

                <el-form-item label="开始时间" required>
                    <el-date-picker v-model="editForm.start_time" type="datetime" placeholder="选择开始时间"
                        value-format="YYYY-MM-DDTHH:mm:ssZ" style="width: 100%" />
                </el-form-item>

                <el-form-item label="结束时间">
                    <el-date-picker v-model="editForm.end_time" type="datetime" placeholder="选择结束时间"
                        value-format="YYYY-MM-DDTHH:mm:ssZ" style="width: 100%" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="handleEditCancel">取消</el-button>
                <el-button type="primary" @click="handleEditSubmit">保存</el-button>
            </template>
        </el-dialog>

        <!-- 题目选择器对话框 -->
        <el-dialog v-model="problemSelectorVisible" title="选择关联题目" width="80%" :close-on-click-modal="false"
            class="problem-selector-dialog">
            <div class="problem-selector">
                <!-- 搜索栏 -->
                <div class="search-bar">
                    <el-input v-model="problemSearchKeyword" placeholder="搜索题目标题或ID" @keyup.enter="handleProblemSearch"
                        clearable size="large" class="search-input">
                        <template #append>
                            <el-button @click="handleProblemSearch" :loading="problemSelectorLoading" type="primary">
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-input>
                </div>

                <!-- 已选择的题目数量 -->
                <div class="selected-count">
                    <el-tag type="info" size="large" effect="light">
                        已选择 {{ selectedProblems.length }} 个题目
                    </el-tag>
                </div>

                <!-- 题目列表 -->
                <div class="problem-list" v-loading="problemSelectorLoading">
                    <div v-for="problem in problemsStore.tableList" :key="problem.id" class="problem-item"
                        :class="{ selected: selectedProblems.includes(problem.id) }"
                        @click="handleProblemSelect(problem.id)">
                        <div class="problem-info">
                            <div class="problem-title">
                                <el-checkbox :model-value="selectedProblems.includes(problem.id)"
                                    @change="handleProblemSelect(problem.id)" />
                                <span class="title-text">{{ (problem?.unique_id != null ? problem.unique_id + '.' : '') + problem.title }}</span>
                                <el-tag :type="problem.difficultyType" size="small">
                                    {{ problem.difficultyLabel }}
                                </el-tag>
                            </div>
                            <div class="problem-meta">
                                <span>ID: {{ problem.id }}</span>
                                <span>通过率: {{ problem.acRate }}</span>
                                <span>提交数: {{ problem.submitCount }}</span>
                            </div>
                            <div class="problem-tags" v-if="problem.tags && problem.tags.length > 0">
                                <el-tag v-for="tag in problem.tags" :key="tag" size="small" effect="plain">
                                    {{ tag }}
                                </el-tag>
                            </div>
                        </div>
                    </div>

                    <div v-if="problemsStore.tableList.length === 0 && !problemSelectorLoading" class="empty-state">
                        <el-empty description="暂无题目数据" />
                    </div>
                </div>

                <!-- 分页组件 -->
                <div class="pagination-wrapper" v-if="problemsStore.tableList.length > 0">
                    <el-pagination
                        v-model:current-page="problemsStore.page"
                        v-model:page-size="problemsStore.pageSize"
                        :page-sizes="[10, 20, 50, 100]"
                        :total="problemsStore.total"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleProblemPageSizeChange"
                        @current-change="handleProblemPageChange"
                        background
                    />
                </div>
            </div>

            <template #footer>
                <el-button @click="handleProblemSelectorCancel">取消</el-button>
                <el-button type="primary" @click="handleProblemSelectorConfirm">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {
    ArrowLeft, Edit, Delete, InfoFilled, Document, Reading, Calendar, Timer, Clock,
    DataAnalysis, Files, User, TrendCharts, List, Setting, View, CircleCheck, Select,
    UserFilled, DocumentCopy, VideoCamera, Search, CircleCheckFilled
} from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useUserStore } from '@/stores/user'
import { useProblemsStore } from '@/stores/problems'
import { useClassStore } from '@/stores/class'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Task, TaskType } from '@/types/task'
import type { ProblemBrief } from '@/types/problem'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const userStore = useUserStore()
const problemsStore = useProblemsStore()
const classStore = useClassStore()

const loading = ref(false)
const taskData = ref<Task | null>(null)
const editDialogVisible = ref(false)
const editForm = ref({
    title: '',
    description: '',
    type: 1 as TaskType,
    start_time: '',
    end_time: '',
    relation_ids: [] as string[],
})

// 题目选择器相关状态
const problemSelectorVisible = ref(false)
const problemSearchKeyword = ref('')
const selectedProblems = ref<string[]>([])
const problemSelectorLoading = ref(false)

// 完成情况相关状态
const completionSearchKeyword = ref('')

// 本地保存的题目关联关系（因为后端没有正确返回）
const localRelationIds = ref<string[]>([])

// 从 localStorage 恢复本地关联关系
function restoreLocalRelationIds(taskId: string) {
    const storageKey = `task_relation_ids_${taskId}`
    const savedIds = localStorage.getItem(storageKey)
    if (savedIds) {
        try {
            localRelationIds.value = JSON.parse(savedIds)
            console.log('从 localStorage 恢复题目关联关系:', localRelationIds.value)
        } catch (error) {
            console.warn('解析 localStorage 数据失败:', error)
            localStorage.removeItem(storageKey)
        }
    }
}

// 保存本地关联关系到 localStorage
function saveLocalRelationIds(taskId: string) {
    const storageKey = `task_relation_ids_${taskId}`
    localStorage.setItem(storageKey, JSON.stringify(localRelationIds.value))
    console.log('保存题目关联关系到 localStorage:', localRelationIds.value)
}

// 判断是否是教师
const isTeacher = computed(() => {
    return userStore.user?.role === 'teacher' || userStore.user?.role === 'admin'
})

// 判断是否可编辑(未结束的任务)
const canEdit = computed(() => {
    return taskData.value?.status !== 2
})

// 任务类型信息
const typeLabel = computed(() => {
    if (!taskData.value) return '-'
    return taskData.value.type === 1 ? '题单' : '视频'
})

const typeType = computed<'' | 'success' | 'info'>(() => {
    if (!taskData.value) return ''
    return taskData.value.type === 1 ? 'success' : 'info'
})

const typeIcon = computed(() => {
    if (!taskData.value) return 'Document'
    return taskData.value.type === 1 ? 'DocumentCopy' : 'VideoCamera'
})

// 任务状态信息
const statusLabel = computed(() => {
    if (!taskData.value) return '-'
    switch (taskData.value.status) {
        case 0: return '未开始'
        case 1: return '进行中'
        case 2: return '已结束'
        default: return '未知'
    }
})

const statusType = computed<'' | 'success' | 'warning' | 'info'>(() => {
    if (!taskData.value) return ''
    switch (taskData.value.status) {
        case 0: return 'info'
        case 1: return 'warning'
        case 2: return ''
        default: return ''
    }
})

// 统计数据
const relationCount = computed(() => taskData.value?.questions?.length || 0)
const finishCount = computed(() => taskData.value?.finish_ids?.length || 0)

// 总成员数量（多种获取方式的备用方案）
const totalMemberCount = computed(() => {
    console.log('=== 计算 totalMemberCount ===')
    console.log('classStore.currentClass:', classStore.currentClass)
    console.log('classStore.memberTotal:', classStore.memberTotal)
    console.log('classStore.members:', classStore.members)
    console.log('member_count:', classStore.currentClass?.member_count)
    console.log('member_ids 长度:', classStore.currentClass?.member_ids?.length)

    // 优先使用 classStore 的成员总数（通过 fetchMembers 获取）
    const classMemberTotal = classStore.memberTotal
    if (classMemberTotal && classMemberTotal > 0) {
        console.log('使用 classStore.memberTotal:', classMemberTotal)
        return classMemberTotal
    }

    // 其次使用 currentClass 的 member_count
    const memberCount = classStore.currentClass?.member_count
    if (memberCount && memberCount > 0) {
        console.log('使用 currentClass.member_count:', memberCount)
        return memberCount
    }

    // 其次使用 member_ids 的长度
    const memberIdsLength = classStore.currentClass?.member_ids?.length
    if (memberIdsLength && memberIdsLength > 0) {
        console.log('使用 member_ids.length:', memberIdsLength)
        return memberIdsLength
    }

    // 最后使用 members 数组的长度
    const membersLength = classStore.members?.length
    if (membersLength && membersLength > 0) {
        console.log('使用 members.length:', membersLength)
        return membersLength
    }

    console.log('所有方式都无法获取成员数量，返回 0')
    return 0
})

const completionRate = computed(() => {
    const totalMembers = totalMemberCount.value
    if (totalMembers === 0) return 0
    return Math.round((finishCount.value / totalMembers) * 100)
})
const progressPercentage = computed(() => completionRate.value)

// 格式化时间
function formatDate(dateStr?: string): string {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// 根据题目ID列表加载题目详情
async function loadQuestionDetails(problemIds: string[]) {
    if (!taskData.value || problemIds.length === 0) {
        console.log('没有需要加载的题目')
        return
    }

    console.log('开始加载题目详情，题目ID列表:', problemIds)

    try {
        // 获取所有题目的详细信息
        const problemDetailsPromises = problemIds.map(id =>
            import('@/api/problem').then(module => module.getProblemById(id))
        )

        const problemDetails = await Promise.all(problemDetailsPromises)
        console.log('获取到的题目详情:', problemDetails)

        // 将题目详情转换为TaskQuestion格式
        const questions = problemDetails
            .filter(problem => problem)
            .map(problem => ({
                id: problem.id,
                unique_id: (problem as any).unique_id,
                title: problem.title,
                difficulty: problem.difficulty || 'medium',
                completed: false // 这个需要从其他地方获取
            }))

        console.log('转换后的题目列表:', questions)

        // 将题目列表设置到taskData中
        if (taskData.value) {
            taskData.value.questions = questions
        }
    } catch (error) {
        console.error('加载题目详情失败:', error)
        ElMessage.warning('加载题目详情失败，部分题目可能无法显示')
    }
}

// 判断资源是否完成
function isFinished(resourceId: string): boolean {
    return taskData.value?.finish_ids?.includes(resourceId) || false
}

// 获取难度标签类型
function getDifficultyType(difficulty: string): string {
    switch (difficulty) {
        case 'easy': return 'success'
        case 'medium': return 'warning'
        case 'hard': return 'danger'
        default: return 'info'
    }
}

// 获取难度标签文本
function getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
        case 'easy': return '简单'
        case 'medium': return '中等'
        case 'hard': return '困难'
        default: return '未知'
    }
}

// 返回
function goBack() {
    router.back()
}

// 编辑任务
function handleEdit() {
    if (!taskData.value) return

    editForm.value = {
        title: taskData.value.title,
        description: taskData.value.description || '',
        type: taskData.value.type,
        start_time: taskData.value.start_time,
        end_time: taskData.value.end_time || '',
        relation_ids: taskData.value.relation_ids && taskData.value.relation_ids.length > 0
            ? taskData.value.relation_ids
            : localRelationIds.value,
    }
    editDialogVisible.value = true
}

// 取消编辑
function handleEditCancel() {
    editDialogVisible.value = false
}

// 提交编辑
async function handleEditSubmit() {
    if (!taskData.value) return

    if (!editForm.value.title) {
        ElMessage.warning('请输入任务标题')
        return
    }
    if (!editForm.value.start_time) {
        ElMessage.warning('请选择开始时间')
        return
    }

    // 检查必需的字段
    if (!taskData.value.id || !taskData.value.course_id) {
        ElMessage.error('任务信息不完整，无法更新')
        return
    }

    try {
        // 获取正确的班级ID（使用路由参数中的值）
        const routeClazzId = String(route.query.clazzId || '')
        const taskId = String(taskData.value.id)

        await taskStore.update(
            routeClazzId,
            taskId,
            {
                task_id: taskId,
                course_id: String(taskData.value.course_id),
                clazz_id: routeClazzId,
                title: editForm.value.title,
                description: editForm.value.description,
                type: editForm.value.type,
                start_time: editForm.value.start_time,
                end_time: editForm.value.end_time,
                relation_ids: editForm.value.relation_ids,
            }
        )

        editDialogVisible.value = false
        await loadTaskData()
    } catch (error) {
        console.error('更新任务失败:', error)
    }
}

// 删除任务
async function handleDelete() {
    if (!taskData.value || !taskData.value.id) {
        ElMessage.error('任务信息不完整，无法删除')
        return
    }

    try {
        await ElMessageBox.confirm(
            '确定要删除这个任务吗?删除后将无法恢复。',
            '删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )

        // 获取正确的班级ID（使用路由参数中的值）
        const routeClazzId = String(route.query.clazzId || '')
        const taskId = String(taskData.value.id)

        await taskStore.remove(routeClazzId, taskId)
        ElMessage.success('任务已删除')
        router.back()
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除任务失败:', error)
        }
    }
}

// 管理题目
async function handleManageProblems() {
    if (!taskData.value) return

    // 设置当前已选择的题目 - 使用本地保存的关联ID列表
    selectedProblems.value = [...localRelationIds.value]
    console.log('打开题目管理对话框，已选择的题目ID列表:', selectedProblems.value)
    
    // 加载题目列表
    problemSelectorLoading.value = true
    try {
        await problemsStore.fetchProblems({ page: 1, page_size: 50 })
    } catch (error) {
        console.error('加载题目列表失败:', error)
    } finally {
        problemSelectorLoading.value = false
    }
    
    // 显示题目选择器
    problemSelectorVisible.value = true
}

// 查看题目
function handleViewProblem(problemId: string) {
    // 跳转到题目详情页
    router.push(`/problems/${problemId}`)
}

// 完成题目
async function handleFinishProblem(problemId: string) {
    if (!taskData.value || !taskData.value.id) {
        ElMessage.error('任务信息不完整，无法完成题目')
        return
    }

    try {
        // 获取正确的班级ID（使用路由参数中的值）
        const routeClazzId = String(route.query.clazzId || '')
        const taskId = String(taskData.value.id)

        await taskStore.finish(
            routeClazzId,
            taskId,
            {
                clazz_id: routeClazzId,
                task_id: taskId,
                relation_id: problemId
            }
        )

        await loadTaskData()
    } catch (error) {
        console.error('完成任务失败:', error)
    }
}

// 移除题目
async function handleRemoveProblem(problemId: string) {
    if (!taskData.value) {
        ElMessage.error('任务信息不存在')
        return
    }

    // 检查必需字段
    if (!taskData.value.id || !taskData.value.course_id) {
        ElMessage.error('任务信息不完整，无法执行操作')
        return
    }

    try {
        await ElMessageBox.confirm(
            '确定要移除这道题目吗？',
            '确认移除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )

        // 获取正确的班级ID（使用路由参数中的值）
        const routeClazzId = String(route.query.clazzId || '')
        const taskId = String(taskData.value.id)
        const courseId = String(taskData.value.course_id)

        // 获取当前的题目关联列表，移除指定的题目
        const currentRelationIds = localRelationIds.value
        const newRelationIds = currentRelationIds.filter(id => id !== problemId)

        // 保存新的题目关联关系到本地
        localRelationIds.value = newRelationIds
        console.log('移除题目后，本地保存的关联ID列表:', localRelationIds.value)

        // 保存到 localStorage
        saveLocalRelationIds(taskId)

        // 尝试更新任务（即使失败，本地保存的关联关系也会生效）
        try {
            await taskStore.update(
                routeClazzId,
                taskId,
                {
                    task_id: taskId,
                    course_id: courseId,
                    clazz_id: routeClazzId,
                    relation_ids: newRelationIds
                }
            )
        } catch (updateError) {
            console.warn('更新任务失败，但本地关联关系已保存:', updateError)
        }

        // 重新加载任务数据
        await loadTaskData()

    } catch (error: any) {
        if (error !== 'cancel') {
            console.error('移除题目失败:', error)
        }
    }
}

// 加载任务数据
async function loadTaskData() {
    const taskId = String(route.params.id || '')
    const clazzId = String(route.query.clazzId || '')

    if (!taskId) {
        ElMessage.error('任务ID不存在')
        router.back()
        return
    }

    if (!clazzId) {
        ElMessage.error('班级ID不存在')
        router.back()
        return
    }

    // 从 localStorage 恢复本地关联关系
    restoreLocalRelationIds(taskId)

    loading.value = true
    try {
        // 直接调用API获取任务详情，需要传入clazzId
        const task = await taskStore.fetchTaskById(clazzId, taskId)
        if (task) {
            console.log('=== 加载任务数据 ===')
            console.log('任务数据:', task)
            console.log('题目列表 (questions):', task.questions)
            console.log('关联ID列表 (relation_ids):', task.relation_ids)
            console.log('本地保存的关联ID列表:', localRelationIds.value)

            taskData.value = task
            // 将路由参数中的 clazzId 保存到任务数据中，确保后续操作使用正确的班级ID
            taskData.value.clazz_id = clazzId

            // 如果后端没有返回questions，则根据本地保存的relation_ids来获取题目详情
            if (!task.questions || task.questions.length === 0) {
                console.log('后端没有返回题目，使用本地保存的关联ID列表获取题目详情')
                await loadQuestionDetails(localRelationIds.value)
            } else {
                console.log('后端返回了题目，使用后端数据')
            }

            // 获取班级信息
            try {
                console.log('=== 开始获取班级信息 ===')
                console.log('班级ID:', clazzId)
                const classData = await classStore.fetchById(clazzId)
                console.log('班级详情数据:', classData)
                console.log('classStore.currentClass:', classStore.currentClass)
                console.log('成员数量 (member_count):', classStore.currentClass?.member_count)
                console.log('成员ID列表 (member_ids):', classStore.currentClass?.member_ids)
                console.log('成员列表 (members):', classStore.members)
                console.log('成员总数 (memberTotal):', classStore.memberTotal)

                // 如果 member_count 为 0，尝试获取班级成员列表
                if (!classStore.currentClass?.member_count || classStore.currentClass.member_count === 0) {
                    console.log('member_count 为 0，尝试获取班级成员列表')
                    try {
                        await classStore.fetchMembers({ class_id: clazzId })
                        console.log('获取班级成员列表成功，memberTotal:', classStore.memberTotal)
                    } catch (membersError) {
                        console.warn('获取班级成员列表失败:', membersError)
                    }
                }
            } catch (classError) {
                console.warn('获取班级信息失败:', classError)
            }
        } else {
            ElMessage.error('任务不存在')
            setTimeout(() => {
                router.back()
            }, 1500)
        }
    } catch (error) {
        console.error('加载任务详情失败:', error)
        ElMessage.error('加载任务详情失败')
        setTimeout(() => {
            router.back()
        }, 1500)
    } finally {
        loading.value = false
    }
}

// 题目选择器相关函数
async function handleProblemSearch() {
    if (!problemSearchKeyword.value.trim()) {
        await problemsStore.fetchProblems({ page: 1, page_size: 50 })
        return
    }
    
    problemSelectorLoading.value = true
    try {
        await problemsStore.searchProblemList({
            keyword: problemSearchKeyword.value,
            page: 1,
            page_size: 50
        })
    } catch (error) {
        console.error('搜索题目失败:', error)
    } finally {
        problemSelectorLoading.value = false
    }
}

function handleProblemSelect(problemId: string) {
    const index = selectedProblems.value.indexOf(problemId)
    if (index > -1) {
        selectedProblems.value.splice(index, 1)
    } else {
        selectedProblems.value.push(problemId)
    }
}

// 分页处理函数
async function handleProblemPageChange(page: number) {
    problemSelectorLoading.value = true
    try {
        if (problemSearchKeyword.value.trim()) {
            // 如果有搜索关键词，使用搜索接口
            await problemsStore.searchProblemList({
                keyword: problemSearchKeyword.value,
                page: page,
                page_size: problemsStore.pageSize
            })
        } else {
            // 否则使用普通获取接口
            await problemsStore.fetchProblems({
                page: page,
                page_size: problemsStore.pageSize
            })
        }
    } catch (error) {
        console.error('获取题目列表失败:', error)
    } finally {
        problemSelectorLoading.value = false
    }
}

async function handleProblemPageSizeChange(pageSize: number) {
    problemSelectorLoading.value = true
    try {
        if (problemSearchKeyword.value.trim()) {
            // 如果有搜索关键词，使用搜索接口
            await problemsStore.searchProblemList({
                keyword: problemSearchKeyword.value,
                page: 1, // 改变页面大小时重置到第一页
                page_size: pageSize
            })
        } else {
            // 否则使用普通获取接口
            await problemsStore.fetchProblems({
                page: 1, // 改变页面大小时重置到第一页
                page_size: pageSize
            })
        }
    } catch (error) {
        console.error('获取题目列表失败:', error)
    } finally {
        problemSelectorLoading.value = false
    }
}

function handleProblemSelectorCancel() {
    problemSelectorVisible.value = false
    problemSearchKeyword.value = ''
    selectedProblems.value = []
}

// 完成情况相关方法
async function fetchTaskCompletion() {
    if (!taskData.value || !taskData.value.id) return

    try {
        // 获取正确的班级ID（使用路由参数中的值）
        const routeClazzId = String(route.query.clazzId || '')
        const taskId = String(taskData.value.id)

        await taskStore.fetchTaskCompletion(routeClazzId, taskId, {
            class_id: routeClazzId,
            task_id: taskId,
            page_num: taskStore.completionPagination.page,
            page_size: taskStore.completionPagination.pageSize,
            real_name: completionSearchKeyword.value.trim() || undefined,
        })
    } catch (error: any) {
        // 如果 API 失败（404），使用本地数据构建完成情况
        if (error.response?.status === 404) {
            console.log('API 接口不存在 (404)，使用本地数据构建完成情况列表')
            buildCompletionListFromLocalData()
        } else {
            console.error('获取任务完成情况失败:', error)
        }
    }
}

/**
 * 从本地数据（taskData.finish_ids 和 classStore.members）构建完成情况列表
 */
function buildCompletionListFromLocalData() {
    if (!taskData.value || !classStore.members.length) {
        return
    }

    const finishIds = taskData.value.finish_ids || []
    const totalQuestions = taskData.value.questions?.length || taskData.value.relation_ids?.length || 0

    // 将成员列表转换为完成情况格式
    const completionList = classStore.members.map(member => {
        const memberId = member.id || member.student_id || '';
        const isFinished = finishIds.includes(memberId)
        return {
            user_id: member.id || '',
            real_name: member.real_name || member.username || member.name || '未知',
            student_id: member.student_id || member.id || '',
            completed: isFinished,
            completed_at: isFinished ? taskData.value?.mtime : undefined,
            total_questions: totalQuestions,
            finished_questions: isFinished ? totalQuestions : 0,
        }
    })

    // 应用搜索过滤
    let filteredList = completionList
    if (completionSearchKeyword.value.trim()) {
        const keyword = completionSearchKeyword.value.trim().toLowerCase()
        filteredList = completionList.filter(item =>
            item.real_name.toLowerCase().includes(keyword) ||
            item.student_id.toLowerCase().includes(keyword)
        )
    }

    // 计算分页
    const page = taskStore.completionPagination.page
    const pageSize = taskStore.completionPagination.pageSize
    const total = filteredList.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedList = filteredList.slice(start, end)

    // 更新 store 中的完成情况数据
    taskStore.completionList = paginatedList
    taskStore.completionPagination = {
        total,
        page,
        pageSize,
    }
}

async function handleCompletionPageChange(page: number) {
    taskStore.completionPagination.page = page
    await fetchTaskCompletion()
}

async function handleCompletionPageSizeChange(pageSize: number) {
    taskStore.completionPagination.page = 1
    taskStore.completionPagination.pageSize = pageSize
    await fetchTaskCompletion()
}

// 搜索防抖
let searchTimeout: number | null = null
function handleCompletionSearch() {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(async () => {
        taskStore.completionPagination.page = 1
        await fetchTaskCompletion()
    }, 500)
}

async function handleProblemSelectorConfirm() {
    if (!taskData.value) return

    // 检查必需的字段
    if (!taskData.value.id || !taskData.value.course_id) {
        ElMessage.error('任务信息不完整，无法更新')
        return
    }

    try {
        // 获取正确的班级ID（使用路由参数中的值）
        const routeClazzId = String(route.query.clazzId || '')
        const taskId = String(taskData.value.id)
        const courseId = String(taskData.value.course_id)

        console.log('=== 调试信息 ===')
        console.log('路由参数 clazzId:', routeClazzId)
        console.log('任务数据 clazzId:', taskData.value.clazz_id)
        console.log('任务ID:', taskId)
        console.log('课程ID:', courseId)
        console.log('实际使用的 clazzId:', routeClazzId)
        console.log('新选择的题目ID列表:', selectedProblems.value)

        // 保存题目关联关系到本地
        localRelationIds.value = [...selectedProblems.value]
        console.log('保存题目关联关系到本地:', localRelationIds.value)

        // 保存到 localStorage
        saveLocalRelationIds(taskId)

        // 尝试更新任务（即使失败，本地保存的关联关系也会生效）
        try {
            console.log('开始更新任务...')
            const updateResult = await taskStore.update(
                routeClazzId,
                taskId,
                {
                    task_id: taskId,
                    course_id: courseId,
                    clazz_id: routeClazzId,
                    relation_ids: selectedProblems.value
                }
            )
            console.log('更新任务结果:', updateResult)
        } catch (updateError) {
            console.warn('更新任务失败，但本地关联关系已保存:', updateError)
            // 即使更新失败，也继续执行后续操作
        }

        problemSelectorVisible.value = false
        problemSearchKeyword.value = ''

        // 重新加载任务数据
        console.log('开始重新加载任务数据...')
        await loadTaskData()
        console.log('任务数据重新加载完成')
        ElMessage.success('题目关联已更新')
    } catch (error) {
        console.error('更新题目关联失败:', error)
        ElMessage.error('更新题目关联失败')
    }
}

// 根据进度百分比获取进度条颜色
function getProgressColor(percentage: number) {
    if (percentage >= 100) {
        return '#67c23a' // 绿色 - 完成
    } else if (percentage >= 80) {
        return '#409eff' // 蓝色 - 接近完成
    } else if (percentage >= 60) {
        return '#e6a23c' // 橙色 - 进行中
    } else if (percentage >= 40) {
        return '#f56c6c' // 红色 - 进度较慢
    } else {
        return '#909399' // 灰色 - 刚开始
    }
}

onMounted(async () => {
    await loadTaskData()

    // 如果是教师，先加载班级成员数据，再加载完成情况数据
    if (isTeacher.value) {
        // 确保班级成员数据已加载
        const clazzId = String(route.query.clazzId || '')
        if (clazzId && (!classStore.members.length || classStore.currentClass?.id !== clazzId)) {
            try {
                await classStore.fetchMembers({ class_id: clazzId })
                console.log('班级成员数据加载完成')
            } catch (error) {
                console.warn('加载班级成员数据失败:', error)
            }
        }

        // 加载完成情况数据
        await fetchTaskCompletion()
    }
})
</script>

<style lang="scss" scoped>
.task-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px;
    background: $bg-card;
    border-radius: $border-radius-card;
    border: 1px solid $border-card;
    gap: 24px;
    margin-bottom: 24px;
    
    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      flex: 1;

      .header-info {
        flex: 1;

        .title {
          margin: 0 0 16px 0;
          font-size: 28px;
          font-weight: 700;
          color: $text-primary;
          line-height: 1.2;
        }

        .meta-tags {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;

          :deep(.el-tag) {
            background: $bg-secondary;
            border: 1px solid $border-light;
            color: $text-primary;
            font-weight: 600;
          }
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .back-btn {
        background: $bg-secondary;
        border: 1px solid $border-light;
        color: $text-secondary;
      }

      :deep(.el-button) {
        border: 1px solid $border-light;
      }

      :deep(.el-button:not(.back-btn)) {
        background: $bg-secondary;
        color: $text-primary;
      }
    }
  }

  .task-overview {
    margin-bottom: 32px;

    .info-card,
    .stats-card {
      height: 100%;
      border-radius: $border-radius-card;
      border: 1px solid $border-card;
      background: $bg-card;
      box-shadow: $shadow-light;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid $border-light;

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 700;
        color: $text-primary;

        .el-icon {
          color: $color-primary;
          font-size: 20px;
        }
      }
    }

    .info-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        background: $bg-secondary;
        border-radius: 12px;
        border: 1px solid $border-light;

        &.description {
          grid-column: 1 / -1;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: $text-secondary;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;

          .el-icon {
            color: $color-primary;
            font-size: 16px;
          }
        }

        .info-value {
          color: $text-primary;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.5;

          &.description {
            font-size: 15px;
            font-weight: 500;
            line-height: 1.7;
            color: $text-secondary;
            background: $bg-card;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid $border-light;
            margin-top: 4px;
          }
        }
      }
    }

    .stats-content {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: $bg-secondary;
        border-radius: 8px;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.resource {
            background: $bg-hover;
            color: $color-primary;
          }
          &.finished {
            background: $bg-hover;
            color: $color-primary;
          }
          &.progress {
            background: $bg-hover;
            color: $color-success;
          }
        }

        .stat-info {
          flex: 1;

          .stat-label {
            color: $text-tertiary;
            font-size: 13px;
            margin-bottom: 4px;
          }
          .stat-value {
            color: $text-primary;
            font-size: 24px;
            font-weight: 700;
          }
        }
      }
    }
  }

  .task-resources {
    margin-bottom: 32px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid $border-light;

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 700;
        color: $text-primary;
      }

      .manage-problems-btn {
        margin-left: auto;
      }
    }

    .resources-card {
      border-radius: $border-radius-card;
      border: 1px solid $border-card;
      background: $bg-card;
      box-shadow: $shadow-light;
    }

    .resources-content {
      padding: 16px 24px;
    }

    .resource-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .resource-item {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 16px;
        background: $bg-secondary;
        border-radius: 12px;
        border: 1px solid $border-light;

        .resource-index {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: $color-primary;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }

        .resource-info {
          flex: 1;

          .problem-header {
            display: flex;
            align-items: center;
            gap: 8px;

            .problem-title {
              font-size: 16px;
              font-weight: 600;
              color: $text-primary;
              line-height: 1.4;
            }
          }
        }

        .resource-actions {
          display: flex;
          gap: 8px;
          align-items: center;

          .action-btn {
            padding: 6px 12px;
            border-radius: 8px;
            font-weight: 500;
            border: 1px solid transparent;
          }
        }
      }
    }
  }

  .task-completion {
    margin-bottom: 32px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid $border-light;

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 700;
        color: $text-primary;
      }

      .header-actions {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 12px;

        .search-container {
          max-width: 280px;
          width: 100%;
        }
      }
    }

    .completion-card {
      border-radius: $border-radius-card;
      border: 1px solid $border-card;
      background: $bg-card;
      box-shadow: $shadow-light;
    }

    .completion-content {
      padding: 24px;

      .completion-table {
        margin-bottom: 20px;
        overflow-x: auto;

        .modern-table {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: $shadow-light;
          width: 100%;

          :deep(.el-table) {
            min-width: 720px;
          }

          :deep(.el-table__header-wrapper) {
            border-radius: 12px 12px 0 0;
          }

          :deep(.el-table__header th) {
            background-color: $bg-secondary;
            border-bottom: 2px solid $border-light;
            text-align: center;
            vertical-align: middle;
            padding: 16px 12px;
          }

          :deep(.el-table__body tr:hover > td) {
            background-color: $bg-hover;
          }

          :deep(.el-table td) {
            border-bottom: 1px solid $border-light;
            padding: 16px 12px;
            text-align: center;
            vertical-align: middle;
          }

          :deep(.el-table__body tr) {
            height: 70px;
          }

          :deep(.el-table .cell) {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            line-height: 1.4;
          }
        }
      }
    }

    .student-id {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 500;
      color: $text-secondary;
      width: 100%;

      .id-icon {
        color: $text-tertiary;
        font-size: 16px;
      }
    }

    .student-name {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;

      .name-text {
        font-weight: 500;
        color: $text-primary;
      }
    }

    .mobile-completion-list {
      display: none;
    }

    .completion-card-item {
      background: $bg-card;
      border-radius: 12px;
      padding: 16px;
      border: 1px solid $border-card;
    }

    .completion-student-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .name-avatar {
        background: $color-primary;
        color: #fff;
        font-weight: 600;
        font-size: 14px;
      }

      .completion-student-details {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .completion-student-name {
          font-weight: 600;
          color: $text-primary;
          font-size: 14px;
        }

        .completion-student-id {
          font-size: 12px;
          color: $text-tertiary;
          font-family: 'JetBrains Mono', monospace;
        }
      }
    }

    .status-tag {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 500;
      border: none;
      margin: 0 auto;

      .status-icon {
        font-size: 14px;
      }
    }

    .progress-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      align-items: center;

      .progress-text {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;

        .progress-numbers {
          color: $text-secondary;
          font-weight: 500;
        }
        .progress-percentage {
          color: $color-primary;
          font-weight: 600;
        }
      }

      .progress-bar {
        width: 100%;

        :deep(.el-progress-bar__outer) {
          border-radius: 10px;
          background-color: $bg-secondary;
        }

        :deep(.el-progress-bar__inner) {
          border-radius: 10px;
        }
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 24px 0 8px 0;
    margin-top: 16px;
    border-top: 1px solid $border-light;

    :deep(.el-pagination) {
      --el-pagination-bg-color: #{$bg-card};
      --el-pagination-text-color: #{$text-secondary};
      --el-pagination-border-radius: 8px;
    }
  }

  .problem-selector {
    .search-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
      margin-bottom: 16px;


      .search-input {
        width: 50%;
        max-width: 600px;

        :deep(.el-input__wrapper) {
          border-radius: 999px;
          background: $bg-card;
          border: 1px solid $border-default;
          min-height: 44px;
        }

        :deep(.el-input-group__append) {
          background: transparent;
          border: none;
          padding: 0;
          margin-left: 10px;
          box-shadow: none;
        }

        :deep(.el-input-group__append .el-button) {
          border-radius: 999px;
          height: 44px;
          min-width: 48px;
          padding: 0 18px;
        }
      }
    }

    .selected-count {
      margin-bottom: 16px;
      font-size: 14px;
      color: $text-secondary;
    }

    .problem-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid $border-light;
      border-radius: 4px;

      .problem-item {
        padding: 16px;
        border-bottom: 1px solid $border-light;
        cursor: pointer;

        &.selected {
          background-color: $bg-hover;
          border-color: $color-primary;
        }

        &:last-child {
          border-bottom: none;
        }
      }

      .problem-info {
        .problem-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .title-text {
            font-weight: 500;
            flex: 1;
          }
        }

        .problem-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: $text-tertiary;
          margin-bottom: 8px;
        }

        .problem-tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
      }
    }

    .empty-state {
      padding: 40px;
      text-align: center;
    }

    .pagination-wrapper {
      background-color: $bg-secondary;
    }

    .manage-problems-btn {
      border-radius: 8px;
      padding: 8px 16px;
      font-weight: 500;
    }

    .problem-selector-dialog {
      :deep(.el-dialog__header) {
        padding: 20px 24px;
      }
      :deep(.el-dialog__title) {
        font-weight: 600;
        font-size: 18px;
      }
      :deep(.el-dialog__headerbtn .el-dialog__close) {
        font-size: 20px;
      }
      :deep(.el-dialog__body) {
        padding: 24px;
        background-color: $bg-secondary;
      }
      :deep(.el-dialog__footer) {
        border-radius: 0 0 8px 8px;
        padding: 16px 24px;
      }
    }
  }
}
</style>
  
