<template>
  <div class="class-detail" v-loading="loading">
    <!-- 局部页头(非全局 Header,不含面包屑) -->
    <section class="page-header">
      <div class="header-left">
        <h1 class="title">{{ clazz?.name || '班级详情' }}</h1>
        <p class="subtitle">{{ clazz?.description || '班级详情与成员管理、任务概览。' }}</p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回课程详情
        </el-button>
        <el-button type="primary" @click="handleEditClass">
          <el-icon><Edit /></el-icon>
          编辑班级信息
        </el-button>
      </div>
    </section>

    <!-- 班级概况 -->
    <section class="overview">
      <div class="overview-grid">
        <!-- 左侧信息卡片 -->
        <div class="info-section">
          <el-card class="info-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-header-title">班级信息</span>
                <el-tag :type="getStatusType(clazz?.status)">{{ getStatusLabel(clazz?.status) }}</el-tag>
              </div>
            </template>
            <div class="info-content">
              <div class="info-item">
                <div class="info-label">
                  <el-icon><User /></el-icon>
                  班级名称
                </div>
                <div class="info-value">{{ clazz?.name || '-' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <el-icon><Reading /></el-icon>
                  关联课程
                </div>
                <div class="info-value">{{ courseName }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <el-icon><UserFilled /></el-icon>
                  授课教师
                </div>
                <div class="info-value">{{ teacherName }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                    <el-icon><School /></el-icon>
                  关联专业班级
                </div>
                <div class="info-value">{{ majorClassNames }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <el-icon><User /></el-icon>
                  成员人数
                </div>
                <div class="info-value">
                  <span class="member-count">{{ clazz?.member_count || 0 }}</span>
                  <span v-if="clazz?.max_members" class="max-members"> / {{ clazz.max_members }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <el-icon><Clock /></el-icon>
                  上课时间
                </div>
                <div class="info-value">{{ clazz?.schedule || '未设置' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <el-icon><InfoFilled /></el-icon>
                  邀请码要求
                </div>
                <div class="info-value">
                  <el-tag :type="clazz?.require_invite ? 'warning' : 'success'" effect="plain" size="small">
                    {{ clazz?.require_invite ? '需要邀请码' : '无需邀请码' }}
                  </el-tag>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <el-icon><Calendar /></el-icon>
                  创建时间
                </div>
                <div class="info-value">{{ formatDate(clazz?.ctime || clazz?.created_at) }}</div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 右侧二维码卡片 -->
        <div class="qrcode-section">
          <el-card class="qrcode-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-header-title">班级二维码</span>
                <el-button 
                  size="small" 
                  :loading="classStore.qrCodeLoading"
                  @click="handleRefreshQRCode"
                >
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </template>
            <div class="qrcode-content" v-loading="classStore.qrCodeLoading">
              <div class="qrcode-wrapper" v-if="classStore.qrCode" @click="handleQRCodeClick">
                <img :src="classStore.qrCode" alt="班级二维码" class="qrcode-img" />
              </div>
              <el-empty v-else description="暂无二维码" :image-size="100" />
              <div class="invite-code" v-if="classStore.inviteCode">
                <span class="invite-label">邀请码:</span>
                <el-tag class="invite-value" size="large">{{ classStore.inviteCode }}</el-tag>
                <el-button
                  size="small"
                  text
                  class="copy-btn"
                  aria-label="复制邀请码"
                  @click="copyText(classStore.inviteCode)"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </div>
              <!-- 解析自二维码的内容：邀请码 与 班级ID -->
              <div class="invite-code" v-if="decodedInviteCode">
                <span class="invite-label">邀请码:</span>
                <el-tag class="invite-value" size="large">{{ decodedInviteCode }}</el-tag>
                <el-button
                  size="small"
                  text
                  class="copy-btn"
                  aria-label="复制邀请码"
                  @click="copyText(decodedInviteCode)"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </div>
              <div class="invite-code" v-if="decodedClassId">
                <span class="invite-label">班级ID:</span>
                <el-tag class="invite-value" size="large">{{ decodedClassId }}</el-tag>
                <el-button
                  size="small"
                  text
                  class="copy-btn"
                  aria-label="复制班级ID"
                  @click="copyText(decodedClassId)"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </div>
              <div class="invite-code" v-if="decodeError">
                <el-tag type="danger">{{ decodeError }}</el-tag>
              </div>
              <div class="qrcode-tip">
                <el-icon><InfoFilled /></el-icon>
                学生扫码或输入邀请码即可加入班级
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </section>

    <!-- 班级成员 -->
    <section class="members">
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><UserFilled /></el-icon>
              班级成员
              <el-tag size="small" class="member-count-tag">{{ classStore.memberTotal }}</el-tag>
            </h2>
            <div class="section-actions">
              <!-- <el-input
                v-model="memberKeyword"
                placeholder="搜索成员姓名或学号"
                style="width: 240px"
                clearable
                @clear="handleMemberSearch"
                @keyup.enter="handleMemberSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input> -->
              <el-button type="primary" @click="handleAddStudents">
                <el-icon><Plus /></el-icon>
                管理学生
              </el-button>
            </div>
          </div>
        </template>

        <el-table 
          :data="classStore.members" 
          v-loading="classStore.memberLoading"
          stripe
          style="width: 100%"
        >
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="real_name" label="姓名" min-width="120">
            <template #default="{ row }">
              {{ row.real_name || row.username }}
            </template>
          </el-table-column>
          <el-table-column prop="student_id" label="学号" min-width="120" />
          <el-table-column prop="grade" label="年级" min-width="100" />
          <el-table-column prop="major" label="专业" min-width="150" />
          <el-table-column prop="class" label="班级" min-width="120" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column label="操作" width="200" align="right">
            <template #default="{ row }">
              <el-button type="primary" text @click="handleViewStudent(row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-popconfirm
                title="确定要移除该学生吗?"
                @confirm="handleRemoveMember(row.id)"
              >
                <template #reference>
                  <el-button type="danger" text>
                    <el-icon><Delete /></el-icon>
                    移除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="classStore.memberPage"
            v-model:page-size="classStore.memberPageSize"
            :total="classStore.memberTotal"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleMemberPageChange"
            @size-change="handleMemberSizeChange"
          />
        </div>
      </el-card>
    </section>

    <!-- 关联教师列表 (v1.1.0已注释) 关联教师功能移到课程详情页
    <section class="course-teachers">
      <el-card class="teachers-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div>
              <span class="card-title">关联教师</span>
              <span class="card-subtitle">共 {{ classTeachers.length }} 位教师</span>
              <span v-if="selectedClassTeachers.length > 0" class="card-subtitle selected-count">
                已选择 {{ selectedClassTeachers.length }} 位
              </span>
            </div>
            <div style="display: flex; gap: 10px;">
              <el-button type="primary" @click="openAddTeacherDialog">
                <el-icon>
                  <Plus />
                </el-icon>
                新增教师
              </el-button>
              <el-button 
                type="danger" 
                plain 
                @click="handleRemoveSelectedTeachers"
                :disabled="selectedClassTeachers.length === 0"
              >
                <el-icon>
                  <Delete />
                </el-icon>
                批量移除
              </el-button>
            </div>
          </div>
        </template>

        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="classTeachers.length > 0" class="teachers-list">
          <div v-for="teacher in classTeachers" :key="teacher.id" class="teacher-item">
            <div class="teacher-selection" style="margin-right: 12px;">
                <el-checkbox
                  :model-value="Boolean(selectedClassTeachers.includes(teacher.id))"
                  @change="toggleClassTeacherSelection(teacher.id)"
                  :disabled="false"
                  :show-label="false"
                  style="display: inline-block;"
                >
                </el-checkbox>
              </div>
            <div class="teacher-avatar">
              <el-avatar :size="60" :src="teacher.avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
            </div>
            <div class="teacher-info">
              <h4 class="teacher-name">{{ teacher.real_name || teacher.username }}</h4>
              <p class="teacher-email">{{ teacher.email }}</p>
              <div class="teacher-meta">
                <span v-if="teacher.school" class="meta-item">{{ teacher.school }}</span>
                <span v-if="teacher.major" class="meta-item">{{ teacher.major }}</span>
              </div>
            </div>
            <div class="teacher-actions">
              <el-button 
                size="small" 
                type="danger" 
                plain 
                @click="handleRemoveTeacher(teacher)"
                :loading="removingTeacher === teacher.id"
              >
                <el-icon>
                  <Delete />
                </el-icon>
                移除
              </el-button>
            </div>
          </div>
        </div>

        <el-empty v-else description="暂无关联教师" :image-size="120">
          <el-button type="primary" @click="openAddTeacherDialog">
            添加教师
          </el-button>
        </el-empty>
      </el-card>
    </section>
    -->

    <!-- 班级任务 -->
    <section class="tasks">
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Document /></el-icon>
              班级任务
              <el-tag size="small" class="task-count-tag">{{ taskStore.cardList.length }}</el-tag>
            </h2>
            <div class="section-actions">
              <el-button-group>
                <el-button :type="taskFilter === 'all' ? 'primary' : ''" @click="taskFilter = 'all'">全部</el-button>
                <el-button :type="taskFilter === 'not_started' ? 'primary' : ''" @click="taskFilter = 'not_started'">未开始</el-button>
                <el-button :type="taskFilter === 'ongoing' ? 'primary' : ''" @click="taskFilter = 'ongoing'">进行中</el-button>
                <el-button :type="taskFilter === 'completed' ? 'primary' : ''" @click="taskFilter = 'completed'">已结束</el-button>
              </el-button-group>
              
              <!--
              <el-button type="primary" @click="handleCreateTask">
                <el-icon><Plus /></el-icon>
                创建任务
              </el-button>
              -->
            </div>
          </div>
        </template>

        <div class="task-list">
          <el-empty v-if="filteredTasks.length === 0" description="暂无任务" />
          <div v-else class="task-grid">
            <el-card 
              v-for="task in filteredTasks" 
              :key="task.id" 
              class="task-card" 
              shadow="never"
            >
              <div class="task-header">
                <div class="task-title-row">
                  <h3 class="task-title">{{ task.title }}</h3>
                  <el-tag :type="task.statusType" size="small">{{ task.statusLabel }}</el-tag>
                </div>
                <el-tag :type="task.typeType" size="small" effect="plain">
                  <el-icon><component :is="task.typeIcon" /></el-icon>
                  {{ task.typeLabel }}
                </el-tag>
              </div>
              
              <div class="task-description" v-if="task.description">
                {{ task.description }}
              </div>

              <div class="task-meta">
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>开始: {{ formatDate(task.startTime) }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>截止: {{ task.endTime ? formatDate(task.endTime) : '无截止日期' }}</span>
                </div>
              </div>

              <div class="task-progress">
                <div class="progress-info">
                  <span class="progress-label">完成进度</span>
                  <span class="progress-value">{{ task.finishCount }} / {{ clazz?.member_count || 0 }}</span>
                </div>
              </div>

              <div class="task-actions">
                <el-button text @click="handleViewTask(task.id)">
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
                <!--
                <el-button text @click="handleEditTask(task.id)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-popconfirm
                  title="确定要删除该任务吗?"
                  @confirm="handleDeleteTask(task.id)"
                >
                  <template #reference>
                    <el-button text type="danger">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
                -->
              </div>
            </el-card>
          </div>
        </div>
      </el-card>
    </section>

    <!-- 创建任务对话框 -->
    <el-dialog 
      v-if="false"
      v-model="createTaskDialogVisible"
      title="创建任务"
      width="600px"
    >
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务标题" required>
          <el-input 
            v-model="taskForm.title"
            placeholder="请输入任务标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="任务类型" required>
          <el-radio-group v-model="taskForm.type">
            <el-radio :label="1">
              <el-icon><DocumentCopy /></el-icon>
              题单
            </el-radio>
            <el-radio :label="2">
              <el-icon><VideoCamera /></el-icon>
              视频
            </el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="任务描述">
          <el-input 
            v-model="taskForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="开始时间" required>
          <el-date-picker
            v-model="taskForm.start_time"
            type="datetime"
            placeholder="选择开始时间"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="taskForm.end_time"
            type="datetime"
            placeholder="选择结束时间"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            style="width: 100%"
          />
        </el-form-item>
        
        <!-- 关联题目 -->
        <el-form-item label="关联题目" required>
            <el-select
                v-model="taskForm.relation_ids"
                multiple
                filterable
                remote
                reserve-keyword
                placeholder="请输入关键词搜索题目"
                :remote-method="handleProblemSearch"
                :loading="searchingProblems"
                style="width: 100%"
            >
                <el-option
                    v-for="item in availableProblems"
                    :key="item.id"
                    :label="item.title"
                    :value="item.id"
                >
                    <span style="float: left">{{ item.title }}</span>
                    <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">{{ item.difficulty }}</span>
                </el-option>
            </el-select>
        </el-form-item>
 
        <!-- 发布对象：专业班级 -->
        <el-form-item label="专业班级">
             <el-select
                v-model="taskForm.major_class_ids"
                multiple
                filterable
                placeholder="请选择关联的专业班级（可选）"
                style="width: 100%"
            >
                <el-option
                    v-for="item in classStore.majorClasses"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                />
            </el-select>
        </el-form-item>
        
 
      </el-form>
      
      <template #footer>
        <el-button @click="createTaskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitTask">创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog 
      v-model="editTaskDialogVisible"
      title="编辑任务"
      width="600px"
      @close="handleEditTaskDialogClose"
    >
      <el-form :model="editTaskForm" label-width="100px">
        <el-form-item label="任务标题" required>
          <el-input 
            v-model="editTaskForm.title"
            placeholder="请输入任务标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="任务类型" required>
          <el-radio-group v-model="editTaskForm.type">
            <el-radio :label="1">
              <el-icon><DocumentCopy /></el-icon>
              题单
            </el-radio>
            <el-radio :label="2">
              <el-icon><VideoCamera /></el-icon>
              视频
            </el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="任务描述">
          <el-input 
            v-model="editTaskForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="开始时间" required>
          <el-date-picker
            v-model="editTaskForm.start_time"
            type="datetime"
            placeholder="选择开始时间"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="editTaskForm.end_time"
            type="datetime"
            placeholder="选择结束时间"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            style="width: 100%"
          />
        </el-form-item>
        

      </el-form>
      
      <template #footer>
        <el-button @click="editTaskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateTask" :loading="updatingTask">更新</el-button>
      </template>
    </el-dialog>

    <!-- 编辑班级对话框 -->
    <el-dialog v-model="editClassDialogVisible" title="编辑班级" width="600px" @close="handleEditClassDialogClose">
      <el-form ref="editClassFormRef" :model="editClassForm" :rules="editClassFormRules" label-width="120px" label-position="left">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="editClassForm.name" placeholder="请输入班级名称" clearable maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="班级描述" prop="description">
          <el-input v-model="editClassForm.description" type="textarea" :rows="4" placeholder="请输入班级描述（可选）" maxlength="500"
            show-word-limit />
        </el-form-item>

        <el-form-item label="最大人数" prop="max_members">
          <el-input-number v-model="editClassForm.max_members" :min="1" :max="9999" :step="1" controls-position="right"
            placeholder="限制人数" style="width: 30%;" />
        </el-form-item>

        <el-form-item label="上课时间安排" prop="schedule">
          <el-input v-model="editClassForm.schedule" type="textarea" :rows="3" placeholder="例：每周一、三、五 14:00-16:00（可选）"
            maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item label="需要邀请码" prop="require_invite" required>
          <el-switch v-model="editClassForm.require_invite" active-text="开启" inactive-text="关闭" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editClassDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleEditClassSubmit" :loading="submittingEditClass">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 管理学生对话框 -->
    <el-dialog v-model="addStudentsDialogVisible" title="管理学生" width="660px" class="manage-students-dialog" @close="handleAddStudentsDialogClose">
      
      <!-- 模式选择 -->
      <div class="option-list">
        <div class="option-card" :class="{ active: enableManualInput }" @click="enableManualInput = !enableManualInput">
          <el-checkbox v-model="enableManualInput" size="large">
            <span class="option-label">
              <el-icon class="option-icon"><Edit /></el-icon>
              手动输入学生ID
            </span>
          </el-checkbox>
        </div>
        <div class="option-card" :class="{ active: enableBatchOperation }" @click="enableBatchOperation = !enableBatchOperation">
          <el-checkbox v-model="enableBatchOperation" size="large">
            <span class="option-label">
              <el-icon class="option-icon"><Operation /></el-icon>
              通过专业班级批量操作
            </span>
          </el-checkbox>
        </div>
      </div>

      <el-form ref="addStudentsFormRef" :model="addStudentsForm" label-width="0">
        
        <!-- 手动输入区 -->
        <div v-if="enableManualInput" class="operation-section">
          <div class="section-title">📌 手动添加/移除学生</div>
          <el-form-item prop="studentIds">
            <el-input 
              v-model="addStudentsForm.studentIds" 
              type="textarea" 
              :rows="6" 
              placeholder="请输入学生ID，每行一个或用逗号分隔&#10;例如：&#10;student001&#10;student002&#10;或：student001,student002,student003"
              maxlength="2000"
              show-word-limit
            />
            <div class="input-tip">
              提示：支持多种格式输入，系统会自动识别并分割学生ID
            </div>
          </el-form-item>
          <div class="section-actions">
            <el-button type="primary" @click="handleManualAdd" :loading="addStudentsSubmitting" :disabled="addStudentsSubmitting">
              添加学生
            </el-button>
            <el-button type="primary" @click="handleManualRemove" :loading="addStudentsSubmitting" :disabled="addStudentsSubmitting">
              移除学生
            </el-button>
          </div>
        </div>

        <!-- 批量操作区 -->
        <div v-if="enableBatchOperation" class="operation-section">
          <div class="section-title">📤 批量导入/导出学生</div>
          <el-form-item prop="majorClassIds">
            <el-select
              v-model="addStudentsForm.majorClassIds"
              multiple
              filterable
              placeholder="请选择专业班级"
              style="width: 100%"
            >
              <el-option
                v-for="item in classStore.majorClasses"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <div class="section-actions">
            <el-button type="primary" @click="handleBatchLink" :loading="addStudentsSubmitting" :disabled="addStudentsSubmitting">
              关联并导入
            </el-button>
            <el-button type="primary" @click="handleBatchUnlink" :loading="addStudentsSubmitting" :disabled="addStudentsSubmitting">
              解除关联
            </el-button>
          </div>
        </div>

      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addStudentsDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看学生详情对话框 -->
    <el-dialog
      v-model="showStudentDetailDialog"
      title="学生详情"
      width="600px"
      @close="handleStudentDetailDialogClose"
    >
      <template #default>
        <el-form
          :model="selectedStudent"
          label-width="120px"
          label-position="left"
          v-if="selectedStudent"
        >
          <!-- 头像和账户状态 - 第一行 -->
          <el-form-item label="头像">
            <div class="avatar-display">
              <div class="avatar-container">
                <el-avatar :size="60" :src="selectedStudent.avatar">
                  {{ getInitials(selectedStudent.real_name || selectedStudent.username) }}
                </el-avatar>
                <div class="avatar-info">
                  <div class="account-status">
                    <el-tag 
                      :type="selectedStudent.is_active ? 'success' : 'danger'"
                      size="small"
                      effect="dark"
                    >
                      <el-icon style="margin-right: 4px;">
                        <component :is="selectedStudent.is_active ? 'CircleCheck' : 'CircleClose'" />
                      </el-icon>
                      {{ selectedStudent.is_active ? '账户已激活' : '账户未激活' }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名">
                <el-input v-model="selectedStudent.username" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="真实姓名">
                <el-input v-model="selectedStudent.real_name" readonly />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学号">
                <el-input v-model="selectedStudent.student_id" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱">
                <el-input v-model="selectedStudent.email" readonly />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学校">
                <el-input v-model="selectedStudent.school" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="专业">
                <el-input v-model="selectedStudent.major" readonly />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="年级">
                <el-input v-model="selectedStudent.grade" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="班级">
                <el-input v-model="selectedStudent.class" readonly />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="个人简介">
            <el-input
              v-model="selectedStudent.bio"
              type="textarea"
              :rows="3"
              readonly
            />
          </el-form-item>
          
          <el-form-item label="创建时间">
            <el-input :value="formatDate(selectedStudent.created_at)" readonly />
          </el-form-item>
        </el-form>
      </template>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleStudentDetailDialogClose">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增教师对话框 -->
    <el-dialog 
      v-model="addTeacherDialogVisible" 
      title="新增教师" 
      width="650px" 
      @close="handleAddTeacherDialogClose"
      :close-on-click-modal="false"
      class="add-teacher-dialog"
    >
      <div class="dialog-content">
        <div class="search-section">
          <div class="search-header">
            <h4 class="search-title">
              <el-icon><Search /></el-icon>
              搜索教师
            </h4>
            <p class="search-description">输入教师姓名、用户名或邮箱进行搜索</p>
          </div>
          
          <div class="teacher-search">
            <el-input
              v-model="teacherSearchKeyword"
              placeholder="请输入关键词..."
              clearable
              @input="handleTeacherSearch"
              size="large"
              class="search-input"
            >
              <template #prefix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
              <template #suffix v-if="searchingTeachers">
                <el-icon class="loading-icon"><Loading /></el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <!-- 搜索结果区域 -->
        <div class="results-section">
          <!-- 加载状态 -->
          <div v-if="searchingTeachers" class="search-loading">
            <el-skeleton :rows="3" animated />
            <p class="loading-text">正在搜索教师...</p>
          </div>
          
          <!-- 搜索结果 -->
          <div v-else-if="availableTeachers.length > 0" class="available-teachers">
            <div class="results-header">
              <h5 class="results-title">
                搜索结果 
                <el-tag size="small" type="info">{{ availableTeachers.length }}</el-tag>
              </h5>
              <div v-if="selectedTeachers.length > 0" class="selected-info">
                已选择 <span class="selected-count">{{ selectedTeachers.length }}</span> 位教师
              </div>
            </div>
            
            <div class="teachers-grid">
              <div 
                v-for="teacher in availableTeachers" 
                :key="teacher.id" 
                class="teacher-card"
                :class="{ 'selected': selectedTeachers.includes(teacher.id) }"
                @click="toggleTeacherSelection(teacher.id)"
              >
                <el-avatar :size="50" :src="teacher.avatar" class="teacher-avatar">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
                <div class="teacher-card-info">
                  <h5>{{ teacher.real_name || teacher.username }}</h5>
                  <p>{{ teacher.email }}</p>
                  <span v-if="teacher.school">{{ teacher.school }}</span>
                </div>
                <el-checkbox 
                  :model-value="Boolean(selectedTeachers.includes(teacher.id))"
                  @change="toggleTeacherSelection(teacher.id)"
                  @click.stop
                />
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else-if="teacherSearchKeyword" class="empty-state">
            <el-empty description="未找到匹配的教师" :image-size="120">
              <template #image>
                <el-icon size="120" color="#d1d5db"><UserFilled /></el-icon>
              </template>
              <template #description>
                <p>未找到匹配 "<strong>{{ teacherSearchKeyword }}</strong>" 的教师</p>
                <p class="empty-tip">请尝试其他关键词</p>
              </template>
            </el-empty>
          </div>
          
          <div v-else class="welcome-state">
            <el-empty description="请输入关键词搜索教师" :image-size="120">
              <template #image>
                <el-icon size="120" color="#d1d5db"><Search /></el-icon>
              </template>
              <template #description>
                <p>在上方搜索框中输入教师信息</p>
                <p class="welcome-tip">支持姓名、用户名或邮箱搜索</p>
              </template>
            </el-empty>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <div class="footer-info">
            <span v-if="selectedTeachers.length > 0" class="selection-summary">
              已选择 {{ selectedTeachers.length }} 位教师
            </span>
          </div>
          <div class="footer-actions">
            <el-button @click="addTeacherDialogVisible = false" size="large">
              取消
            </el-button>
            <el-button 
              type="primary" 
              @click="handleAddTeachers" 
              :loading="addingTeachers"
              :disabled="selectedTeachers.length === 0"
              size="large"
            >
              <el-icon v-if="!addingTeachers"><Plus /></el-icon>
              添加教师{{ selectedTeachers.length > 0 ? ` (${selectedTeachers.length})` : '' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 二维码放大显示弹窗 -->
    <el-dialog
      v-model="qrCodeModalVisible"
      title="班级二维码"
      width="500px"
      align-center
      @close="handleQRCodeModalClose"
    >
      <div class="qr-modal-content">
        <div class="qr-modal-wrapper">
          <img :src="classStore.qrCode" alt="班级二维码" class="qr-modal-img" />
        </div>
        <div class="qr-modal-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>学生可扫描此二维码加入班级</span>
        </div>
      </div>
      
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft, User, Reading, UserFilled, Clock, Calendar, Refresh, InfoFilled,
  Search, Plus, Delete, Document, View, Edit, DocumentCopy, VideoCamera,
  CircleCheck, CircleClose, QuestionFilled, Loading, School
} from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useClassStore } from '@/stores/class'
import { useTaskStore } from '@/stores/task'
import { useUserStore } from '@/stores/user'
import { useCourseStore } from '@/stores/course'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { ClassItem, ClassStatus, UpdateClassRequest } from '@/types/class'
import type { TaskType, TaskCardItem } from '@/types/task'
import type { UserProfile } from '@/types/user'
import { getUsers } from '@/api/user'
import { searchTeachers } from '@/api/course'
import { searchProblems } from '@/api/problem'
import type { SearchTeachersPayload, SearchTeachersResponse } from '@/types/course'
import { decodeQRFromDataURL, parseClassInvitePayload } from '@/utils/qrcode'

const route = useRoute()
const router = useRouter()
const classStore = useClassStore()
const taskStore = useTaskStore()
const userStore = useUserStore()
const courseStore = useCourseStore()
const loading = ref(false)

// 使用 store 中的 currentClass 作为班级数据源
const clazz = computed(() => classStore.currentClass)

// 从路由查询参数获取课程名称和授课老师信息
const courseName = computed(() => route.query.courseName as string || clazz.value?.course_name || '未关联')
// 优先从班级详情的teachers数组中获取教师名称，多个教师用逗号分隔
const teacherName = computed(() => {
  // 优先从班级详情的teachers数组中获取教师名称
  const clazzWithTeachers = clazz.value
  if (clazzWithTeachers?.teachers && Array.isArray(clazzWithTeachers.teachers) && clazzWithTeachers.teachers.length > 0) {
    return clazzWithTeachers.teachers
      .map((teacher: any) => teacher.real_name || teacher.username)
      .join('、')
  }

  // 其次尝试从路由参数获取
  if (route.query.teacherName) {
    return route.query.teacherName as string
  }
  
  // 最后使用默认的teacher_name字段
  return clazz.value?.teacher_name || '-'
})

  // 计算关联的专业班级名称
    const majorClassNames = computed(() => {
      const current = clazz.value as any
      if (!current) return '暂无'
      
      // Helper to find field in an object
      const findFieldData = (obj: any) => {
        if (!obj || typeof obj !== 'object') return null
        
        const possibleFields = [
          'major_class_ids',
          'major_classes',
          'major_clazz_ids',
          'major_clazzes',
          'majors'
        ]
        
        for (const field of possibleFields) {
          if (obj[field] && Array.isArray(obj[field]) && obj[field].length > 0) {
             return obj[field]
          }
        }
        return null
      }

      // 优先查找根对象 (支持 optimistic updates 和扁平化结构)
      let data = findFieldData(current)
      
      // 如果根对象没有，且存在 nested data，则查找 nested data
      if (!data && current.data && typeof current.data === 'object') {
        data = findFieldData(current.data)
      }

      if (!data) return '暂无'

      // Extract IDs
      const ids = data.map((m: any) =>
        typeof m === 'object' ? String(m?.id ?? '') : String(m)
      ).filter(Boolean)
      
      if (ids.length === 0) return '暂无'

      // If data contains names directly (objects), use them
      if (typeof data[0] === 'object' && data[0]?.name) {
        return data.map((m: any) => m.name).join('、')
      }
      
      // 从 classStore.majorClasses 中匹配名称（统一转字符串比较）
      if (classStore.majorClasses && classStore.majorClasses.length > 0) {
        const names = ids.map((id: string) => {
          const found = classStore.majorClasses.find((m: any) => String(m?.id) === String(id))
          return found ? (found.name || id) : id
        })
        return names.join('、')
      }

      return `${ids.length} 个关联班级`
    })

const memberKeyword = ref('')
const taskFilter = ref<'all' | 'not_started' | 'ongoing' | 'completed'>('all')
const createTaskDialogVisible = ref(false)
const taskForm = ref({
  title: '',
  description: '',
  type: 1 as TaskType,
  start_time: '',
  end_time: '',
  relation_ids: [] as string[],
  major_class_ids: [] as string[],
})

const availableProblems = ref<any[]>([])
const searchingProblems = ref(false)

async function handleProblemSearch(query: string) {
  if (query) {
    searchingProblems.value = true
    try {
      const res = await searchProblems({ keyword: query, page: 1, page_size: 20 })
      const list = (res as any)?.data?.list 
        ?? (res as any)?.list 
        ?? (res as any)?.items 
        ?? (res as any)?.problems 
        ?? []
      availableProblems.value = Array.isArray(list) ? list : []
    } catch (e) {
      console.error(e)
    } finally {
      searchingProblems.value = false
    }
  } else {
    availableProblems.value = []
  }
}

// 编辑任务相关
const editTaskDialogVisible = ref(false)
const updatingTask = ref(false)
const editTaskForm = ref({
  id: '',
  title: '',
  description: '',
  type: 1 as TaskType,
  start_time: '',
  end_time: '',
  relation_ids: [] as string[],
})

// 编辑班级相关
const editClassDialogVisible = ref(false)
const editClassFormRef = ref<FormInstance>()
const submittingEditClass = ref(false)
const editClassForm = ref({
  name: '',
  description: '',
  max_members: undefined as number | undefined,
  schedule: '',
  require_invite: true
})

const editClassFormRules: FormRules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 50, message: '班级名称长度为 2-50 个字符', trigger: 'blur' },
  ],
  require_invite: [
    { required: true, message: '请选择是否需要邀请码', trigger: 'change' },
  ],
}

// 添加学生相关
const addStudentsDialogVisible = ref(false)
const addStudentsFormRef = ref<FormInstance>()
// 新增状态控制
const enableManualInput = ref(false)
const enableBatchOperation = ref(false)
const submittingManualAdd = ref(false)
const submittingManualRemove = ref(false)
const submittingBatchLink = ref(false)
const submittingBatchUnlink = ref(false)
const addStudentsSubmitting = ref(false)

const addStudentsForm = ref({
  studentIds: '',
  majorClassIds: [] as string[]
})

const addStudentsFormRules: FormRules = {
  studentIds: [
    { required: false, message: '请输入学生ID', trigger: 'blur' },
  ],
}


// 查看学生详情相关
const showStudentDetailDialog = ref(false)
const selectedStudent = ref<any>(null)

// 二维码弹窗相关
const qrCodeModalVisible = ref(false)

// 解析二维码得到的班级邀请码与班级ID
const decodedInviteCode = ref('')
const decodedClassId = ref('')
const decodingQR = ref(false)
const decodeError = ref('')

// 教师管理相关
const classTeachers = ref<UserProfile[]>([])
const addTeacherDialogVisible = ref(false)
const teacherSearchKeyword = ref('')
const searchingTeachers = ref(false)
const availableTeachers = ref<UserProfile[]>([])
const selectedTeachers = ref<string[]>([])
const addingTeachers = ref(false)
const removingTeacher = ref<string | null>(null)
// 新增：存储选中的班级教师ID
const selectedClassTeachers = ref<string[]>([])

// 监听selectedClassTeachers变化

watch(selectedClassTeachers, (newVal: string[]) => {
  // 选中的教师ID已移除console.log
}, { deep: true });

// 监听二维码图片变更并尝试解析其中的文本
watch(() => classStore.qrCode, async (dataUrl) => {
  decodedInviteCode.value = ''
  decodedClassId.value = ''
  decodeError.value = ''
  if (!dataUrl) return
  decodingQR.value = true
  try {
    const text = await decodeQRFromDataURL(dataUrl)
    if (!text) {
      decodeError.value = '无法识别二维码内容'
      return
    }
    const payload = parseClassInvitePayload(text)
    if (!payload) {
      // 如果格式不符合预期，也显示原始文本以便排查
      decodeError.value = '二维码内容格式不符合预期'
      console.warn('未能按预期解析二维码文本:', text)
      return
    }
    decodedInviteCode.value = payload.inviteCode
    decodedClassId.value = payload.classId
  } catch (err: any) {
    console.error('二维码解析失败:', err)
    decodeError.value = err?.message || '二维码解析失败'
  } finally {
    decodingQR.value = false
  }
}, { immediate: true })

// 筛选后的任务列表
const filteredTasks = computed((): TaskCardItem[] => {
  const allCards = taskStore.cardList || [];
  if (taskFilter.value === 'all') return allCards;
  
  // 目标状态值映射
  const targetStatus: number | null =
    taskFilter.value === 'not_started' ? 0 :
    taskFilter.value === 'ongoing' ? 1 :
    taskFilter.value === 'completed' ? 2 : null;

  if (targetStatus === null) return allCards;

  // 直接根据 card 的 statusLabel 进行过滤，因为 store 中已经修正了状态显示逻辑
  return allCards.filter(card => {
    const label = card.statusLabel;
    if (targetStatus === 0) return label === '未开始';
    if (targetStatus === 1) return label === '进行中';
    if (targetStatus === 2) return label === '已结束';
    return true;
  });
})

function goBack() { 
  // 返回上一页
  router.back()
}

function getStatusType(status?: ClassStatus): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case 0: return 'info'      // 未开始 - 蓝色
    case 1: return 'success'   // 进行中 - 绿色
    case 2: return 'warning'   // 已结束 - 橙色
    default: return 'info'     // 未知 - 灰色
  }
}

function getStatusLabel(status?: ClassStatus): string {
  switch (status) {
    case 0: return '未开始'
    case 1: return '进行中'
    case 2: return '已结束'
    default: return '未知'
  }
}

function calculateTaskProgress(finishCount: number): number {
  const totalMembers = clazz.value?.member_count || 0
  if (totalMembers === 0) return 0
  return Math.round((finishCount / totalMembers) * 100)
}

function getInitials(name: string): string {
  if (!name) return '?'
  return name.substring(0, 2)
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

async function handleRefreshQRCode() {
  const classId = String(route.params.clazzes_id || '')
  const courseId = clazz.value?.course_id
  console.log('刷新二维码参数:', { classId, courseId, routeParams: route.params.clazzes_id })
  if (!classId) {
    ElMessage.error('班级ID缺失')
    return
  }
  try {
    // 尝试不传递courseId，因为后端可能只需要clazzId
    await classStore.refreshQRCode(classId)
  } catch (error) {
    console.error('刷新二维码失败:', error)
    // 如果失败，尝试传递courseId
    try {
      await classStore.refreshQRCode(classId, courseId)
    } catch (retryError) {
      console.error('重试刷新二维码失败:', retryError)
    }
  }
}

// 处理二维码点击事件
function handleQRCodeClick() {
  if (classStore.qrCode) {
    qrCodeModalVisible.value = true
  }
}

// 关闭二维码弹窗
function handleQRCodeModalClose() {
  qrCodeModalVisible.value = false
}

// 复制到剪贴板（兼容回退）
async function copyText(text?: string) {
  if (!text) return
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(String(text))
    } else {
      const ta = document.createElement('textarea')
      ta.value = String(text)
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    ElMessage.success('已复制到剪贴板')
  } catch (err: any) {
    console.error('复制失败:', err)
    ElMessage.error(err?.message || '复制失败，请手动选择文本复制')
  }
}

async function handleMemberSearch() {
  const classId = String(route.params.clazzes_id || '')
  if (!classId) return
  await classStore.fetchMembers({
    class_id: classId,
    keyword: memberKeyword.value,
    page: 1,
  })
}

async function handleMemberPageChange(page: number) {
  const classId = String(route.params.clazzes_id || '')
  if (!classId) return
  await classStore.fetchMembers({
    class_id: classId,
    keyword: memberKeyword.value,
    page,
  })
}

async function handleMemberSizeChange(size: number) {
  const classId = String(route.params.clazzes_id || '')
  if (!classId) return
  await classStore.fetchMembers({
    class_id: classId,
    keyword: memberKeyword.value,
    page: 1,
    page_size: size,
  })
}

async function handleAddStudents() {
  addStudentsDialogVisible.value = true
  enableManualInput.value = false
  enableBatchOperation.value = false
  // 加载专业班级
  try {
    await classStore.fetchMajorClasses()
  } catch (error) {
    console.error('加载专业班级失败', error)
  }
}

function handleAddStudentsDialogClose() {
  // 重置表单
  addStudentsForm.value.studentIds = ''
  addStudentsForm.value.majorClassIds = []
  enableManualInput.value = false
  enableBatchOperation.value = false
  addStudentsFormRef.value?.resetFields()
}

async function executeDialogAction(action: () => Promise<void>) {
  const classId = String(route.params.clazzes_id || '')
  if (!classId) return
  addStudentsSubmitting.value = true
  try {
    await action()
    await classStore.fetchMembers({
      class_id: classId,
      keyword: memberKeyword.value,
      page: classStore.memberPage,
    })
    addStudentsDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败，请稍后重试')
    addStudentsDialogVisible.value = true
  } finally {
    addStudentsSubmitting.value = false
  }
}
// 1. 手动添加学生
async function handleManualAdd() {
  const classId = String(route.params.clazzes_id || '')
  if (!classId) return
  
  const studentIdsText = addStudentsForm.value.studentIds.trim()
  if (!studentIdsText) {
    ElMessage.warning('请输入学生ID')
    return
  }
  
  const studentIds = studentIdsText
    .split(/[\n,;，；\s]+/)
    .map(id => id.trim())
    .filter(id => id.length > 0)

  if (studentIds.length === 0) {
    ElMessage.warning('请输入有效的学生ID')
    return
  }

  await executeDialogAction(async () => {
    await classStore.addStudents(classId, studentIds)
  })
}

// 2. 手动移除学生
async function handleManualRemove() {
  const classId = String(route.params.clazzes_id || '')
  if (!classId) return

  const studentIdsText = addStudentsForm.value.studentIds.trim()
  if (!studentIdsText) {
    ElMessage.warning('请输入学生ID')
    return
  }

  try {
    await ElMessageBox.confirm('确定要移除输入的学生吗？', '确认移除', { type: 'warning' })
  } catch {
    return
  }

  const studentIds = studentIdsText
    .split(/[\n,;，；\s]+/)
    .map(id => id.trim())
    .filter(id => id.length > 0)

  if (studentIds.length === 0) {
    ElMessage.warning('请输入有效的学生ID')
    return
  }

  await executeDialogAction(async () => {
    const courseId = clazz.value?.course_id || ''
    for (const sid of studentIds) {
      await classStore.removeStudentFromClassAction(classId, sid, courseId)
    }
    ElMessage.success(`成功移除 ${studentIds.length} 个学生`)
  })
}

// 3. 批量关联专业班级
async function handleBatchLink() {
  const classId = String(route.params.clazzes_id || '')
  if (!classId) return

  const majorClassIds = addStudentsForm.value.majorClassIds
  if (majorClassIds.length === 0) {
    ElMessage.warning('请选择专业班级')
    return
  }

  // 1. 强制刷新专业班级列表，确保获取到最新注册的学生信息
  try {
    await classStore.fetchMajorClasses()
  } catch (e) {
    console.warn('刷新专业班级列表失败', e)
  }

  await executeDialogAction(async () => {
    // 2. 关联专业班级
    try {
      await classStore.linkMajorClasses(classId, majorClassIds)
    } catch (e) {
      console.warn('关联专业班级可能已存在或失败', e)
    }

    // 2. 尝试从选中的专业班级中导入学生
    // 注意：依赖 getMajorClasses 接口返回 student_ids 字段
    const selectedMajorClasses = classStore.majorClasses.filter((mc: any) => majorClassIds.includes(mc.id))
    let allStudentIds: string[] = []
    
    selectedMajorClasses.forEach((mc: any) => {
      if (mc.student_ids && Array.isArray(mc.student_ids)) {
        allStudentIds.push(...mc.student_ids)
      }
    })
    
    // 去重
    allStudentIds = [...new Set(allStudentIds)]
    
    if (allStudentIds.length > 0) {
      try {
        await classStore.addStudents(classId, allStudentIds)
        ElMessage.success(`已同步导入 ${allStudentIds.length} 名学生`)
      } catch (e) {
        console.error('导入学生失败', e)
        ElMessage.warning('关联成功，但导入学生失败，请尝试手动添加')
      }
    } else {
      console.log('选中的专业班级中没有学生信息，跳过导入')
    }

    await classStore.fetchById(classId)
    await classStore.fetchMajorClasses()
  })
}

// 4. 批量解除关联
async function handleBatchUnlink() {
  const classId = String(route.params.clazzes_id || '')
  if (!classId) return

  const majorClassIds = addStudentsForm.value.majorClassIds
  if (majorClassIds.length === 0) {
    ElMessage.warning('请选择专业班级')
    return
  }

  try {
    await ElMessageBox.confirm('确定要解除选中的专业班级关联吗？', '确认解除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  await executeDialogAction(async () => {
    await classStore.unlinkMajorClasses(classId, majorClassIds)
    await classStore.fetchById(classId)
    await classStore.fetchMajorClasses()
  })
}


async function handleRemoveMember(studentId: string) {
  const classId = String(route.params.clazzes_id || '')
  if (!classId) {
    ElMessage.error('班级信息获取失败')
    return
  }
  
  try {
    await classStore.removeStudent(classId, studentId)
    // 刷新成员列表
    await classStore.fetchMembers({
      class_id: classId,
      keyword: memberKeyword.value,
      page: classStore.memberPage,
      page_size: classStore.memberPageSize,
    })
  } catch (error) {
    console.error('移除学生失败:', error)
    // classStore.removeStudent 已经处理了错误消息显示，这里不需要重复显示
  }
}

// 查看学生详情
function handleViewStudent(student: any) {
  selectedStudent.value = { ...student }
  showStudentDetailDialog.value = true
}

// 关闭学生详情对话框
function handleStudentDetailDialogClose() {
  showStudentDetailDialog.value = false
  selectedStudent.value = null
}

function handleCreateTask() {
  taskForm.value = {
    title: '',
    description: '',
    type: 1,
    start_time: '',
    end_time: '',
    relation_ids: [],
    major_class_ids: [],
  }
  createTaskDialogVisible.value = true
  // 加载专业班级列表
  classStore.fetchMajorClasses()
}

async function handleSubmitTask() {
  const classId = String(route.params.clazzes_id || '')
  if (!classId || !clazz.value?.course_id) {
    ElMessage.error('班级或课程信息获取失败')
    return
  }
  
  // 表单验证
  if (!taskForm.value.title.trim()) {
    ElMessage.warning('请输入任务标题')
    return
  }
  if (!taskForm.value.start_time) {
    ElMessage.warning('请选择开始时间')
    return
  }
  if (!taskForm.value.type) {
    ElMessage.warning('请选择任务类型')
    return
  }
  
  // 验证结束时间不能早于开始时间
  if (taskForm.value.end_time && taskForm.value.start_time) {
    const startTime = new Date(taskForm.value.start_time)
    const endTime = new Date(taskForm.value.end_time)
    if (endTime <= startTime) {
      ElMessage.warning('结束时间不能早于或等于开始时间')
      return
    }
  }
  
  try {
    await taskStore.add(classId, {
      course_id: clazz.value.course_id,
      title: taskForm.value.title.trim(),
      description: taskForm.value.description?.trim() || undefined,
      type: taskForm.value.type,
      start_time: taskForm.value.start_time,
      end_time: taskForm.value.end_time || undefined,
      relation_ids: taskForm.value.relation_ids || [],
      major_class_ids: taskForm.value.major_class_ids || [],
      clazz_ids: [classId],
    })
    
    // 关闭对话框并重置表单
    createTaskDialogVisible.value = false
    taskForm.value = {
      title: '',
      description: '',
      type: 1,
      start_time: '',
      end_time: '',
      relation_ids: [],
      major_class_ids: [],
    }

    // taskStore.add() 内部已经调用了 refresh()
  } catch (error) {
    console.error('创建任务失败:', error)
    // taskStore.add 方法已经处理了错误消息显示
  }
}

function handleViewTask(taskId: string) {
  // 获取当前班级ID
  const clazzId = String(route.params.clazzes_id || '')
  
  // 跳转到教师任务详情页面，携带班级ID作为查询参数
  router.push({
    path: `/teacher/task/${taskId}`,
    query: { clazzId }
  })
}

async function handleEditTask(taskId: string) {
  // 从任务列表中找到对应的任务
  const task = taskStore.cardList.find(t => t.id === taskId)
  if (!task) {
    ElMessage.error('任务不存在')
    return
  }
  
  // 从原始任务数据中获取完整信息
  const rawTask = taskStore.rawList.find(t => t.id === taskId)
  if (!rawTask) {
    ElMessage.error('无法获取任务详细信息')
    return
  }
  
  // 填充编辑表单
  editTaskForm.value = {
    id: task.id,
    title: task.title,
    description: task.description || '',
    type: rawTask.type,
    start_time: rawTask.start_time,
    end_time: rawTask.end_time || '',
    relation_ids: rawTask.relation_ids || [],
  }
  
  // 显示编辑对话框
  editTaskDialogVisible.value = true
}

async function handleUpdateTask() {
  try {
    updatingTask.value = true
    
    // 获取班级ID和课程ID
    const classId = String(route.params.clazzes_id || '')
    if (!classId || !clazz.value?.course_id) {
      ElMessage.error('无法获取班级或课程信息')
      return
    }
    
    // 表单验证
    if (!editTaskForm.value.title.trim()) {
      ElMessage.error('请输入任务标题')
      return
    }
    
    if (!editTaskForm.value.start_time) {
      ElMessage.error('请选择开始时间')
      return
    }
    
    if (!editTaskForm.value.type) {
      ElMessage.error('请选择任务类型')
      return
    }
    
    // 验证结束时间不能早于开始时间
    if (editTaskForm.value.end_time && editTaskForm.value.start_time) {
      const startTime = new Date(editTaskForm.value.start_time)
      const endTime = new Date(editTaskForm.value.end_time)
      if (endTime <= startTime) {
        ElMessage.error('结束时间不能早于或等于开始时间')
        return
      }
    }
    
    // 调用更新方法
    await taskStore.update(classId, editTaskForm.value.id, {
      task_id: editTaskForm.value.id,
      clazz_id: classId,
      course_id: clazz.value.course_id,
      title: editTaskForm.value.title.trim(),
      description: editTaskForm.value.description?.trim() || undefined,
      type: editTaskForm.value.type,
      start_time: editTaskForm.value.start_time,
      end_time: editTaskForm.value.end_time || undefined,
      relation_ids: editTaskForm.value.relation_ids,
    })
    
    // 关闭对话框并重置表单
    editTaskDialogVisible.value = false
    editTaskForm.value = {
      id: '',
      title: '',
      description: '',
      type: 1,
      start_time: '',
      end_time: '',
    }

    // taskStore.update() 内部已经处理了刷新和消息显示
  } catch (error) {
    console.error('更新任务失败:', error)
    // taskStore.update 方法已经处理了错误消息显示
  } finally {
    updatingTask.value = false
  }
}

function handleEditTaskDialogClose() {
  // 重置表单
  editTaskForm.value = {
    id: '',
    title: '',
    description: '',
    type: 1,
    start_time: '',
    end_time: '',
    relation_ids: [],
  }
}

async function handleDeleteTask(taskId: string) {
  const classId = String(route.params.clazzes_id || '')
  if (!classId) {
    ElMessage.error('班级ID不存在')
    return
  }
  try {
    await taskStore.remove(classId, taskId)
  } catch (error) {
    console.error('删除任务失败:', error)
  }
}

// 编辑班级相关函数
function handleEditClass() {
  if (!clazz.value?.id) {
    ElMessage.warning('班级信息未加载，无法编辑')
    return
  }

  // 填充表单数据
  editClassForm.value = {
    name: clazz.value.name || '',
    description: clazz.value.description || '',
    max_members: clazz.value.max_members,
    schedule: clazz.value.schedule || '',
    require_invite: clazz.value.require_invite ?? true
  }
  
  editClassDialogVisible.value = true
}

function handleEditClassDialogClose() {
  editClassFormRef.value?.resetFields()
  editClassForm.value = {
    name: '',
    description: '',
    max_members: undefined,
    schedule: '',
    require_invite: true
  }
}

async function handleEditClassSubmit() {
  if (!editClassFormRef.value) return
  
  if (!clazz.value?.id) {
    ElMessage.error('班级信息未加载，无法保存')
    return
  }
  
  await editClassFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submittingEditClass.value = true
    try {
      // 构造更新请求参数
      const updatePayload: UpdateClassRequest = {
        clazz_id: clazz.value!.id,
        name: editClassForm.value.name,
        description: editClassForm.value.description,
        max_members: editClassForm.value.max_members,
        schedule: editClassForm.value.schedule,
        require_invite: editClassForm.value.require_invite
      }
      
      await classStore.update(updatePayload)
      editClassDialogVisible.value = false
      ElMessage.success('班级信息更新成功')
      
      // 重新加载班级详情
      const id = String(route.params.clazzes_id || '')
      if (id) {
        await classStore.fetchById(id)
      }
    } catch (error: any) {
      console.error('编辑班级失败:', error)
      ElMessage.error(error?.message || '编辑班级失败')
    } finally {
      submittingEditClass.value = false
    }
  })
}

async function loadData() {
  const id = String(route.params.clazzes_id || '')
  
  if (!id) {
    ElMessage.error('班级ID不存在')
    return
  }
  
  loading.value = true
  try {
    // 加载班级详情 - fetchById 会自动更新 store 中的 currentClass
    await classStore.fetchById(id)
    
    // 设置课程ID到classStore，用于添加学生等操作
    if (clazz.value?.course_id) {
      classStore.setCourseId(clazz.value.course_id)
    }

    // 并行加载其他数据以提高性能
    await Promise.allSettled([
      // 加载成员列表
      classStore.fetchMembers({ class_id: id }),
      // 加载专业班级列表（用于显示关联班级名称）
      classStore.fetchMajorClasses(),
      // 不在页面加载时自动刷新二维码，由用户手动刷新
      // classStore.refreshQRCode(id, clazz.value?.course_id),
      // 加载任务列表
      taskStore.fetchTaskList(id)
    ])

    // 页面加载完成后，尝试获取一次二维码（不刷新，只是获取）
    try {
      await classStore.fetchQRCode(id, true);
    } catch (error) {
      console.error('获取二维码失败:', error);
      // 不显示错误，保持页面正常
    }

    // 自动同步关联的专业班级学生
    autoSyncStudents(id);

  } catch (error: any) {
    console.error('加载班级详情失败:', error)
    ElMessage.error(error?.message || '加载班级详情失败，请稍后重试')
    // 如果班级不存在，返回班级列表页
    if (error?.status === 404) {
      router.push('/teacher/classes')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDataWithTeachers()
})

// 加载班级关联的教师列表
function loadClassTeachers() {
  console.log('开始加载教师列表，班级数据:', clazz.value);
  // 直接从班级详情数据中获取教师信息
  const clazzWithTeachers = clazz.value as any
  if (clazzWithTeachers?.teachers && Array.isArray(clazzWithTeachers.teachers)) {
    console.log('从班级详情中获取到教师列表，共', clazzWithTeachers.teachers.length, '位教师');
    classTeachers.value = clazzWithTeachers.teachers
  } else {
    console.log('未找到教师列表或格式不正确');
    classTeachers.value = []
  }
  console.log('教师列表加载完成:', classTeachers.value);
}

/** 打开新增教师对话框 */
function openAddTeacherDialog() {
  addTeacherDialogVisible.value = true
  teacherSearchKeyword.value = ''
  availableTeachers.value = []
  selectedTeachers.value = []
}

/** 关闭新增教师对话框 */
function handleAddTeacherDialogClose() {
  teacherSearchKeyword.value = ''
  availableTeachers.value = []
  selectedTeachers.value = []
}

/** 搜索教师 */
async function handleTeacherSearch() {
  const keyword = teacherSearchKeyword.value.trim()
  if (!keyword) {
    availableTeachers.value = []
    return
  }
  
  searchingTeachers.value = true
  try {
    const payload: SearchTeachersPayload = {
      page_num: 1,
      page_size: 50,
      real_name: keyword
    }
    
    const response = await searchTeachers(payload)
    
    // 过滤搜索结果，排除已经关联的教师
    const currentTeacherIds = classTeachers.value.map(t => t.id)
    availableTeachers.value = (response.teachers || []).filter(teacher => 
      !currentTeacherIds.includes(teacher.id)
    )
  } catch (error) {
    console.error('搜索教师失败:', error)
    ElMessage.error('搜索教师失败')
    availableTeachers.value = []
  } finally {
    searchingTeachers.value = false
  }
}

/** 切换教师选择状态 */
function toggleTeacherSelection(teacherId: string) {
  const index = selectedTeachers.value.indexOf(teacherId)
  if (index > -1) {
    selectedTeachers.value.splice(index, 1)
  } else {
    selectedTeachers.value.push(teacherId)
  }
}

/** 添加选中的教师 */
async function handleAddTeachers() {
  if (selectedTeachers.value.length === 0 || !clazz.value?.id) return

  // 过滤掉已经存在的教师
  const existingTeacherIds = classTeachers.value.map(t => t.id)
  const newTeacherIds = selectedTeachers.value.filter(id => !existingTeacherIds.includes(id))

  if (newTeacherIds.length === 0) {
    ElMessage.warning('所选教师已在班级中')
    return
  }

  if (newTeacherIds.length < selectedTeachers.value.length) {
    ElMessage.info(`已跳过 ${selectedTeachers.value.length - newTeacherIds.length} 位已存在的教师`)
  }

  addingTeachers.value = true
  try {
    // 使用班级教师API添加教师
    // 注意：后端接口可能只需要 teacher_ids 列表，或者结构有所不同
    // 根据错误 "target must be an object"，可能是参数包装层级的问题
    // 如果后端期望的是 { teacher_ids: [...] }，那么当前的 payload { clazz_id, teacher_ids } 也是一个 object
    // 但如果后端期望的是直接传数组或其他形式，需要调整
    // 假设后端接口定义为 Post /clazzes/:id/teachers Body: { teacher_ids: [] }
    
    // 尝试直接传递 payload 对象，确保其结构正确
    const payload = {
      clazz_id: String(clazz.value.id),
      teacher_ids: [...newTeacherIds]
    };
    
    await classStore.addClazzTeachersAction(
      clazz.value.id,
      payload
    )

    ElMessage.success(`成功添加 ${newTeacherIds.length} 位教师`)
    addTeacherDialogVisible.value = false

    // 重新加载班级详情以获取最新的教师列表
    await classStore.fetchById(clazz.value.id)
    // 重新加载教师列表
    loadClassTeachers()
  } catch (error: any) {
    console.error('添加教师失败:', error)
    // store 已处理错误提示，此处不再重复提示
  } finally {
    addingTeachers.value = false
  }
}

/** 移除教师 */
async function handleRemoveTeacher(teacher: UserProfile) {
  if (!clazz.value?.id) return
  
  // 校验：如果只剩一位教师，不允许移除
  if (classTeachers.value.length <= 1) {
    ElMessage.warning('班级至少需要保留一位教师，无法移除最后一位教师')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要移除教师 "${teacher.real_name || teacher.username}" 吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    removingTeacher.value = teacher.id
    
    // 使用班级教师API移除教师
    await classStore.removeClazzTeacherAction(clazz.value.id, teacher.id)
    
    // ElMessage.success('教师移除成功') // store中已提示

    // 重新加载班级详情以获取最新的教师列表
    await classStore.fetchById(clazz.value.id)
    // 重新加载教师列表
    loadClassTeachers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除教师失败:', error)
      // store 已处理错误提示，此处不再重复提示
    }
  } finally {
    removingTeacher.value = null
  }
}

// 切换班级教师选择状态
function toggleClassTeacherSelection(teacherId: string) {
  const index = selectedClassTeachers.value.indexOf(teacherId)
  if (index === -1) {
    selectedClassTeachers.value.push(teacherId)
  } else {
    selectedClassTeachers.value.splice(index, 1)
  }
}

// 批量移除选中的教师
async function handleRemoveSelectedTeachers() {
  if (selectedClassTeachers.value.length === 0 || !clazz.value?.id) return;
  
  // 校验：移除后是否至少保留一位教师
  if (classTeachers.value.length - selectedClassTeachers.value.length < 1) {
    ElMessage.warning('班级至少需要保留一位教师，无法移除所有教师')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要移除选中的 ${selectedClassTeachers.value.length} 位教师吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 使用班级教师API批量移除教师
    if (clazz.value) {
      const clazzId = clazz.value.id;
      await Promise.all(selectedClassTeachers.value.map(teacherId => 
        classStore.removeClazzTeacherAction(clazzId, teacherId)
      ));
    }
    
    ElMessage.success(`成功移除 ${selectedClassTeachers.value.length} 位教师`);

    // 清空选中状态
    selectedClassTeachers.value = [];

    // 重新加载班级详情以获取最新的教师列表
    await classStore.fetchById(clazz.value.id)
    // 重新加载教师列表
    loadClassTeachers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除教师失败:', error);
      // store 已处理错误提示，此处不再重复提示
    }
  } finally {
    removingTeacher.value = null;
  }
}

// 自动同步关联的专业班级学生
async function autoSyncStudents(classId: string) {
  try {
    // 1. 获取当前班级关联的专业班级ID
    // 注意：从接口返回的 clazz 对象中获取，或者从 majorClasses 中反查
    // 这里的逻辑依赖于 loadData 中已经加载了 fetchMajorClasses 和 fetchById
    
    // 从班级详情中获取关联的 major_class_ids
    const currentClass = classStore.currentClass as any;
    if (!currentClass) return;
    
    let majorClassIds: string[] = [];
    if (currentClass.major_class_ids && Array.isArray(currentClass.major_class_ids)) {
      majorClassIds = currentClass.major_class_ids;
    } else if (currentClass.major_classes && Array.isArray(currentClass.major_classes)) {
      majorClassIds = currentClass.major_classes.map((m: any) => m.id);
    }
    
    if (majorClassIds.length === 0) return;

    // 2. 从所有专业班级列表中，找到关联的专业班级，并收集其中的 student_ids
    // 确保 majorClasses 是最新的（loadData 中已经调用了 fetchMajorClasses）
    const relatedMajorClasses = classStore.majorClasses.filter((mc: any) => 
      majorClassIds.includes(String(mc.id))
    );
    
    let allMajorStudentIds: string[] = [];
    relatedMajorClasses.forEach((mc: any) => {
      if (mc.student_ids && Array.isArray(mc.student_ids)) {
        allMajorStudentIds.push(...mc.student_ids);
      }
    });
    
    // 去重
    allMajorStudentIds = [...new Set(allMajorStudentIds)];
    
    if (allMajorStudentIds.length === 0) return;

    // 3. 获取当前班级已有的成员ID
    // 确保 members 是最新的（loadData 中已经调用了 fetchMembers）
    const currentMemberIds = classStore.members.map(m => m.id || m.student_id).filter(Boolean);
    
    // 4. 计算差异：在专业班级中但不在当前班级中的学生
    const studentsToAdd = allMajorStudentIds.filter(sid => !currentMemberIds.includes(sid));
    
    if (studentsToAdd.length > 0) {
      console.log(`检测到有 ${studentsToAdd.length} 名新学生需要同步到班级 ${classId}`, studentsToAdd);
      
      // 5. 自动添加这些学生
      // 使用静默方式添加，或者提示用户
      await classStore.addStudents(classId, studentsToAdd);
      ElMessage.success(`已自动同步 ${studentsToAdd.length} 名新学生到班级`);
      
      // 重新加载成员列表
      await classStore.fetchMembers({ class_id: classId });
    }
  } catch (error) {
    console.error('自动同步学生失败:', error);
    // 自动同步失败不应打断用户流程，仅记录日志
  }
}

// 在loadData函数中添加加载教师列表
async function loadDataWithTeachers() {
  await loadData()
  // 在班级数据加载完成后，从班级数据中获取教师信息
  loadClassTeachers()
}

// 组件卸载时清理状态
onUnmounted(() => {
  // 清理 class store 的当前班级状态
  classStore.currentClass = null
})

defineExpose({
  handleManualAdd,
  handleManualRemove,
  handleBatchLink,
  handleBatchUnlink,
  addStudentsDialogVisible,
  enableManualInput,
  enableBatchOperation,
  addStudentsForm,
  addStudentsSubmitting,
})
</script>

<style lang="scss" scoped>
.class-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;

  :deep(.el-card),
  :deep(.el-card:hover),
  :deep(.el-card.is-hover-shadow:hover),
  :deep(.el-card.is-always-shadow) {
    box-shadow: none;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .header-left {
      flex: 1;
    }

    .title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: $text-primary;
    }

    .subtitle {
      margin-top: 8px;
      color: $text-tertiary;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .overview {
    margin-bottom: 24px;

    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 20px;
    }

    .info-card {
      height: 100%;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-header-title {
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;
      }
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid $border-light;

      &:last-child {
        border-bottom: none;
      }
    }

    .info-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: $text-secondary;
      font-size: 14px;

      .el-icon {
        color: $color-primary;
      }
    }

    .info-value {
      color: $text-primary;
      font-size: 14px;
      font-weight: 500;
    }

    .member-count {
      font-size: 18px;
      font-weight: 700;
      color: $color-primary;
    }

    .max-members {
      color: $text-tertiary;
    }
  }

  .qrcode-section {
    .qrcode-card {
      height: 100%;
    }

    .qrcode-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 16px 0;
    }

    .qrcode-wrapper {
      width: 260px;
      height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $bg-card;
      border-radius: $border-radius-card;
      border: 1px solid $border-default;
      margin: 0 auto;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .qrcode-img {
      width: calc(100% - 16px);
      height: calc(100% - 16px);
      object-fit: contain;
      border-radius: $border-radius-card;
    }

    .invite-code {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 8px;

      .invite-label {
        color: $text-secondary;
        font-size: 13px;
      }

      .invite-value {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .copy-btn {
        padding: 0;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;

        .el-icon {
          font-size: 14px;
        }
      }
    }

    .qrcode-tip {
      display: flex;
      align-items: center;
      gap: 6px;
      color: $text-tertiary;
      font-size: 12px;
      text-align: center;
    }
  }

  .qr-modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .qr-modal-wrapper {
    width: 350px;
    height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
      background: $bg-card;
    border-radius: $border-radius-card;
    border: 1px solid $border-default;
  }

  .qr-modal-img {
    width: calc(100% - 32px);
    height: calc(100% - 32px);
    object-fit: contain;
    border-radius: $border-radius-card;
  }

  .qr-modal-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    color: $text-secondary;
    font-size: 14px;
    text-align: center;

    .el-icon {
      color: $color-primary;
    }
  }

  .section-card {
    margin-bottom: 24px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
  }

  .member-count-tag,
  .task-count-tag {
    margin-left: 8px;
  }

  .section-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-name {
    color: $text-primary;
    font-weight: 500;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid $border-light;
  }

  .task-list {
    padding: 20px 0;
  }

  .task-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
  }

  .task-card {
    display: flex;
    flex-direction: column;
    height: 100%;

    .task-header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .task-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .task-title {
      flex: 1;
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
      line-height: 1.4;
    }

    .task-description {
      color: $text-secondary;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .task-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: $text-tertiary;
        font-size: 13px;

        .el-icon {
          font-size: 14px;
        }
      }
    }

    .task-progress {
      margin-bottom: 16px;

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .progress-label {
        color: $text-secondary;
        font-size: 13px;
      }

      .progress-value {
        color: $text-primary;
        font-size: 14px;
        font-weight: 600;
      }
    }

    .task-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid $border-light;
      margin-top: auto;
    }
  }

  .avatar-display {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .avatar-container {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .avatar-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .account-status {
    display: flex;
    align-items: center;
  }

  .course-teachers {
    margin-bottom: 24px;

    .selected-count {
      color: $color-primary;
      font-weight: 600;
    }

    .teacher-selection {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .teachers-card {
      border: 1px solid $border-card;
      border-radius: $border-radius-card;
      overflow: hidden;
    }

    .teachers-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .teacher-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: $bg-secondary;
      border: 1px solid $border-card;
      border-radius: $border-radius-card;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .teacher-avatar {
      flex-shrink: 0;
      border-radius: 50%;
    }

    .teacher-info {
      flex: 1;
      min-width: 0;
    }

    .teacher-name {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
    }

    .teacher-email {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: $text-tertiary;
    }

    .teacher-meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .meta-item {
        font-size: 12px;
        color: $text-tertiary;
        background: $bg-tertiary;
        padding: 4px 8px;
        border-radius: 6px;
      }
    }

    .teacher-actions {
      flex-shrink: 0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
    }

    .card-subtitle {
      font-size: 14px;
      margin-left: 15px;
      color: $text-secondary;
    }
  }

  .add-teacher-dialog {
    :deep(.el-dialog) {
      border-radius: $border-radius-card;
      overflow: hidden;
    }

    :deep(.el-dialog__header) {
      background: $color-primary;
      color: #fff;
      padding: 24px 32px;
      margin: 0;
    }

    :deep(.el-dialog__title) {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
    }

    :deep(.el-dialog__headerbtn .el-dialog__close) {
      color: #fff;
      font-size: 20px;
    }

    :deep(.el-dialog__body) {
      padding: 0;
    }

    .dialog-content {
      padding: 10px;
    }

    .search-section {
      margin-bottom: 32px;
    }

    .search-header {
      margin-bottom: 20px;
    }

    .search-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;

      .el-icon {
        color: $color-primary;
        font-size: 20px;
      }
    }

    .search-description {
      margin: 0;
      color: $text-tertiary;
      font-size: 14px;
      line-height: 1.5;
    }

    .teacher-search {
      position: relative;
    }

    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: $border-radius-card;
        border: 2px solid $border-light;
        padding: 12px 16px;
      }

      :deep(.el-input__wrapper.is-focus) {
        border-color: $color-primary;
      }

      :deep(.el-input__inner) {
        font-size: 16px;
        color: $text-primary;
      }
    }

    .search-icon {
      color: $text-tertiary;
      font-size: 18px;
    }

    .loading-icon {
      color: $color-primary;
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .results-section {
    min-height: 300px;
  }

  .search-loading {
    padding: 32px;
    text-align: center;
  }

  .loading-text {
    margin-top: 16px;
    color: $text-tertiary;
    font-size: 14px;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid $border-light;
  }

  .results-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  .selected-info {
    color: $text-tertiary;
    font-size: 14px;
  }

  .selected-count {
    color: $color-primary;
    font-weight: 600;
  }

  .available-teachers {
    max-height: 420px;
    overflow-y: auto;
    padding: 4px;
    margin: 0 -4px;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: $bg-tertiary;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: $border-default;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: $border-dark;
    }
  }

  .teachers-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .teacher-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border: 2px solid $border-light;
    border-radius: $border-radius-card;
    cursor: pointer;
    background: $bg-card;
    position: relative;
    overflow: hidden;

    &.selected {
      border-color: $color-primary;
      background: $bg-secondary;
    }

    .teacher-card-info {
      flex: 1;
      min-width: 0;
      position: relative;
      z-index: 1;

      h5 {
        margin: 0 0 6px 0;
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;
        line-height: 1.4;
      }

      p {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: $text-tertiary;
        line-height: 1.4;
      }

      span {
        font-size: 12px;
        color: $text-quaternary;
        background: $bg-tertiary;
        padding: 4px 8px;
        border-radius: 6px;
        display: inline-block;
      }
    }

    .el-checkbox {
      position: relative;
      z-index: 2;
    }

    .teacher-avatar {
      position: relative;
      z-index: 1;
      box-shadow: $shadow-light;
      border: 3px solid #ffffff;
    }

    &.selected .teacher-avatar {
      border-color: $color-primary;
    }
  }

  .empty-state,
  .welcome-state {
    padding: 40px 20px;
    text-align: center;

    :deep(.el-empty__description) {
      color: $text-tertiary;
      font-size: 16px;
      line-height: 1.6;
    }
    :deep(.el-empty__description) strong {
      color: $text-primary;
      font-weight: 600;
    }
  }

  .empty-tip,
  .welcome-tip {
    margin-top: 8px;
    color: $text-quaternary;
    font-size: 14px;
  }

  .footer-info {
    flex: 1;
  }

  .selection-summary {
    color: $text-tertiary;
    font-size: 14px;
    font-weight: 500;
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }

  .dialog-footer {
    .el-button {
      border-radius: $border-radius-card;
      padding: 12px 24px;
      font-weight: 500;
      min-width: 100px;
    }
    .el-button--primary {
      background: $color-primary;
      border: none;
    }
    .el-button--primary:disabled {
      background: $bg-tertiary;
      color: $text-quaternary;
    }
    .el-button:not(.el-button--primary) {
      background: $bg-card;
      border: 1px solid $border-light;
      color: $text-primary;
    }
  }

  .manage-students-dialog {
    :deep(.el-dialog) {
      width: 660px;
      max-width: 95vw;
    }
    :deep(.el-dialog__body) {
      padding: 24px 28px;
      min-height: 520px;
      display: flex;
      flex-direction: column;
    }

    .operation-section .section-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      transform: translateY(-8px);
      padding-left: 16px;
      margin-bottom: 8px;
      font-weight: 400;
    }

    .operation-section + .operation-section {
      margin-top: 28px;
    }

    .dialog-footer {
      padding: 16px 24px;
    }

    .option-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 20px;
    }
    .option-card {
      display: flex;
      align-items: center;
      background: #f5f7fa;
      border-radius: $border-radius-card;
      border: 1px solid $border-light;
      padding: 14px 16px;
      cursor: pointer;
      transition: background .15s ease, box-shadow .15s ease, border-color .15s ease;
    }
    .option-card:hover {
      background: lighten(#f5f7fa, 2%);
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      border-color: $border-default;
    }
    .option-card.active {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.15);
      background: mix(#f5f7fa, $color-primary, 94%);
    }
    .option-label {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: 400;
      color: $text-primary;
    }
    .option-card.active .option-label {
      color: $color-primary;
    }
    .option-icon {
      font-size: 18px;
      color: $color-primary;
    }
    :deep(.el-checkbox__label) {
      font-size: 16px;
    }
  }

  @media (max-width: 768px) {
    .manage-students-dialog {
      :deep(.el-dialog) {
        width: 95vw;
      }
      :deep(.el-dialog__body) {
        min-height: auto;
        padding: 20px;
      }
      .option-list {
        gap: 20px;
      }
    }
  }
}
</style>
