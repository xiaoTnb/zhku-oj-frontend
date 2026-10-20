<template>
  <div class="course-detail">
    <!-- 页头 -->
    <section class="page-header">
      <div class="header-left">
        <h1 class="title">{{ course?.title || course?.name || "课程详情" }}</h1>
        <div class="title-meta">
          <el-tag :type="getStatusType(course?.status)" effect="plain" round>{{
            mapStatusLabel(course?.status)
          }}</el-tag>
          <!-- <span class="muted">课程 ID: {{ course?.id || '-' }}</span> -->
          <span class="muted" v-if="course?.created_by_user">
            创建者:
            {{
              course.created_by_user.username ||
              course.created_by_user.real_name ||
              "-"
            }}
            - 邮箱: {{ course.created_by_user.email || "-" }}
          </span>
        </div>
      </div>
      <div class="header-actions">
        <el-button class="ghost-btn" @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回
        </el-button>
        <el-button type="primary" class="primary-btn" @click="openEditDialog">
          <el-icon>
            <Edit />
          </el-icon>
          编辑课程
        </el-button>
      </div>
    </section>

    <!-- 加载状态 -->
    <div v-loading="loading" style="min-height: 400px">
      <!-- 课程概览 -->
      <section class="course-overview" v-if="course">
        <div class="overview-grid">
          <!-- 课程头像卡片 - 仅显示封面图 -->
          <div
            class="info-card cover-card"
            @click="triggerAvatarUpload"
            :class="{ uploading: uploadingAvatar }"
          >
            <div class="cover-image">
              <img
                :src="courseAvatarUrl"
                :alt="course?.name || course?.title || '课程头像'"
              />
              <!-- 上传遮罩层 -->
              <div class="upload-overlay">
                <div class="upload-content">
                  <el-icon v-if="!uploadingAvatar" class="upload-icon">
                    <Plus />
                  </el-icon>
                  <el-icon v-else class="upload-icon loading">
                    <Loading />
                  </el-icon>
                  <span class="upload-text">{{
                    uploadingAvatar ? "上传中..." : "点击上传课程头像"
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 课程名称卡片 -->
          <div class="info-card name-card">
            <div class="card-icon">
              <el-icon>
                <Reading />
              </el-icon>
            </div>
            <div class="card-content">
              <div class="card-label">课程名称</div>
              <div class="card-value">
                {{ course.name || course.title || "-" }}
              </div>
            </div>
          </div>

          <!-- 课程状态卡片 -->
          <div class="info-card status-card">
            <div class="card-icon">
              <el-icon>
                <CircleCheck />
              </el-icon>
            </div>
            <div class="card-content">
              <div class="card-label">课程状态</div>
              <div class="card-value">
                <el-tag
                  :type="getStatusType(course.status)"
                  effect="plain"
                  round
                  size="large"
                >
                  {{ mapStatusLabel(course.status) }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 授课教师卡片 -->
          <div class="info-card teacher-card">
            <div class="card-icon">
              <el-icon>
                <UserFilled />
              </el-icon>
            </div>
            <div class="card-content">
              <div class="card-label">课程创建者</div>
              <div class="card-value">
                {{
                  course.teacher_name ||
                  course.created_by_user?.username ||
                  course.created_by_user?.real_name ||
                  "未分配"
                }}
              </div>
            </div>
          </div>

          <!-- 班级数量卡片 -->
          <div class="info-card classes-count-card">
            <div class="card-icon">
              <el-icon>
                <School />
              </el-icon>
            </div>
            <div class="card-content">
              <div class="card-label">班级数量</div>
              <div class="card-value">
                {{ relatedClasses.length || 0 }}<span class="unit">个</span>
              </div>
            </div>
          </div>

          <!-- 创建时间卡片 -->
          <div class="info-card time-card">
            <div class="card-icon">
              <el-icon>
                <Clock />
              </el-icon>
            </div>
            <div class="card-content">
              <div class="card-label">创建时间</div>
              <div class="card-value">
                {{ course.ctime ? formatDate(course.ctime) : "-" }}
              </div>
            </div>
          </div>

          <!-- 关联教师卡片 -->
          <div class="info-card teachers-count-card">
            <div class="card-icon">
              <el-icon>
                <Avatar />
              </el-icon>
            </div>
            <div class="card-content">
              <div class="card-label">关联教师</div>
              <div class="card-value">
                {{ courseTeachers.length || 0 }}<span class="unit">人</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 课程描述 -->
      <section class="course-description" v-if="course">
        <el-card class="description-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">课程描述</span>
            </div>
          </template>
          <div class="description-content">
            <p v-if="course.description">{{ course.description }}</p>
            <p v-else class="no-description">暂无课程描述</p>
          </div>
        </el-card>
      </section>

      <!-- 班级任务 -->
      <section class="tasks" v-if="course">
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <h2 class="section-title">
                <el-icon><Document /></el-icon>
                任务列表
                <el-tag size="small" class="task-count-tag">{{ filteredCourseTaskCards.length }}</el-tag>
              </h2>
              <div class="section-actions">
                <el-button-group class="filter-group">
                  <el-button :type="taskFilter === 'all' ? 'primary' : ''" @click="taskFilter = 'all'">全部</el-button>
                  <el-button :type="taskFilter === 'not_started' ? 'primary' : ''" @click="taskFilter = 'not_started'">未开始</el-button>
                  <el-button :type="taskFilter === 'ongoing' ? 'primary' : ''" @click="taskFilter = 'ongoing'">进行中</el-button>
                  <el-button :type="taskFilter === 'completed' ? 'primary' : ''" @click="taskFilter = 'completed'">已结束</el-button>
                </el-button-group>
                <el-button type="primary" @click="openCreateTaskDialog">
                  <el-icon><Plus /></el-icon>
                  创建任务
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="task-list" v-loading="tasksLoading">
            <div v-if="filteredCourseTaskCards.length > 0" class="task-grid">
              <el-card
                v-for="item in filteredCourseTaskCards"
                :key="item.id + '_' + item.clazzId"
                class="task-card"
                shadow="never"
              >
                <div class="task-header">
                  <div class="task-title-row">
                    <h3 class="task-title">{{ item.title }}</h3>
                    <el-tag :type="item.statusTag" size="small">{{ item.statusLabel }}</el-tag>
                  </div>
                  <el-tag :type="item.typeTag" size="small" effect="plain">
                    {{ item.typeLabel }}
                  </el-tag>
                 </div>
                <div class="task-description">
                  {{ (item.description && item.description.trim()) ? item.description : '暂无描述' }}
                </div>
                <!-- 已布置班级显示 -->
                <div class="task-classes" style="margin-bottom: 12px; font-size: 13px; color: #606266;">
                  <span style="font-weight: 600;">已布置班级: </span>
                  <span>{{ item.clazzNames ? item.clazzNames.join('、') : item.clazzName }}</span>
                </div>
                <div class="task-meta">
                  <div class="meta-item">
                    <el-icon><Clock /></el-icon>
                    <span>开始: {{ formatDate(item.start_time) }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Clock /></el-icon>
                    <span>截止: {{ item.end_time ? formatDate(item.end_time) : '无截止日期' }}</span>
                  </div>
                </div>
                <div class="task-progress">
                  <div class="progress-info">
                    <span class="progress-label">完成进度</span>
                    <span class="progress-value">{{ item.finishCount }} / {{ item.memberCount || 0 }}</span>
                  </div>
                </div>
                <div class="task-actions">
                  <el-button text @click="handleViewTaskFromCourse(item.id, item.clazzId)">
                    <el-icon><View /></el-icon>
                    查看详情
                  </el-button>
                  <el-button text @click="handleEditTask(item)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button text type="danger" @click="handleDeleteTask(item)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </el-card>
            </div>
            <el-empty v-else description="暂无任务显示（请前往具体班级查看）" />
          </div>
        </el-card>
      </section>

      <!-- 关联班级列表 -->
      <section class="course-classes">
        <el-card class="classes-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div 
                style="display: flex; align-items: center; cursor: pointer; user-select: none;"
                @click="isClassesCollapsed = !isClassesCollapsed"
              >
                <el-icon 
                  :class="{ 'is-collapsed': isClassesCollapsed }"
                  style="margin-right: 8px; transition: transform 0.3s;"
                >
                  <ArrowDown v-if="!isClassesCollapsed" />
                  <ArrowRight v-else />
                </el-icon>
                <span class="card-title">关联班级</span>
                <span class="card-subtitle"
                  >共 {{ relatedClasses.length }} 个班级</span
                >
              </div>
              <el-button type="primary" @click="openCreateClassDialog">
                <el-icon>
                  <Plus />
                </el-icon>
                新增班级
              </el-button>
            </div>
          </template>

          <div v-show="!isClassesCollapsed">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
              <el-skeleton :rows="3" animated />
            </div>

            <!-- 班级列表 -->
            <div v-else-if="relatedClasses.length > 0" class="classes-list">
              <div
                v-for="classItem in relatedClasses"
                :key="classItem.id"
                class="class-item"
              >
                <div class="class-header">
                  <div class="class-title-row">
                    <h3 class="class-title">
                      {{ classItem.name || "未命名班级" }}
                    </h3>
                    <el-tag
                      :type="getClassStatusType(classItem.status)"
                      effect="plain"
                      round
                    >
                      {{ getClassStatusLabel(classItem.status) }}
                    </el-tag>
                  </div>
                </div>

                <div class="class-body">
                  <p v-if="classItem.description" class="class-description">
                    {{ classItem.description }}
                  </p>
                  <p v-else class="class-description no-description">
                    暂无班级描述
                  </p>

                  <div class="class-meta">
                    <div class="meta-item">
                      <el-icon>
                        <User />
                      </el-icon>
                      <span
                        >成员数量: {{ classItem.add_nums || 0
                        }}{{
                          classItem.max_members
                            ? ` / ${classItem.max_members}`
                            : ""
                        }}
                        人</span
                      >
                    </div>
                    <div class="meta-item" v-if="classItem.schedule">
                      <el-icon>
                        <Calendar />
                      </el-icon>
                      <span>上课时间: {{ classItem.schedule }}</span>
                    </div>
                    <div class="meta-item">
                      <el-icon>
                        <Key />
                      </el-icon>
                      <span
                        >邀请码:
                        {{ classItem.require_invite ? "需要" : "不需要" }}</span
                      >
                    </div>
                    <div class="meta-item">
                      <el-icon>
                        <Clock />
                      </el-icon>
                      <span
                        >创建时间:
                        {{
                          classItem.ctime ? formatDate(classItem.ctime) : "-"
                        }}</span
                      >
                    </div>
                  </div>
                </div>

                <div class="class-footer">
                  <el-button
                    size="default"
                    @click="goToClassDetail(classItem.id)"
                  >
                    <el-icon>
                      <View />
                    </el-icon>
                    查看班级
                  </el-button>
                  <el-button
                    size="default"
                    type="primary"
                    class="edit-class-btn"
                    @click="handleEditClass(classItem)"
                  >
                    <el-icon>
                      <Edit />
                    </el-icon>
                    编辑班级
                  </el-button>
                  <el-button
                    size="default"
                    type="danger"
                    plain
                    @click="handleDeleteClass(classItem)"
                  >
                    <el-icon>
                      <Delete />
                    </el-icon>
                    删除班级
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty v-else description="暂无关联班级" :image-size="120">
              <el-button type="primary" @click="openCreateClassDialog">
                添加班级
              </el-button>
            </el-empty>
          </div>
        </el-card>
      </section>

      <!-- 关联教师列表 -->
      <section class="course-teachers">
        <el-card class="teachers-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div
                style="display: flex; align-items: center; cursor: pointer; user-select: none;"
                @click="isTeachersCollapsed = !isTeachersCollapsed"
              >
                <el-icon 
                  :class="{ 'is-collapsed': isTeachersCollapsed }"
                  style="margin-right: 8px; transition: transform 0.3s;"
                >
                  <ArrowDown v-if="!isTeachersCollapsed" />
                  <ArrowRight v-else />
                </el-icon>
                <span class="card-title">关联教师</span>
                <span class="card-subtitle"
                  >共 {{ courseTeachers.length }} 位教师</span
                >
                <span
                  v-if="selectedCourseTeachers.length > 0"
                  class="card-subtitle selected-count"
                >
                  已选择 {{ selectedCourseTeachers.length }} 位
                </span>
              </div>
              <div style="display: flex; gap: 10px">
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
                  :disabled="selectedCourseTeachers.length === 0"
                >
                  <el-icon>
                    <Delete />
                  </el-icon>
                  批量移除
                </el-button>
              </div>
            </div>
          </template>

          <div v-show="!isTeachersCollapsed">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
              <el-skeleton :rows="3" animated />
            </div>

            <!-- 教师列表 -->
            <div v-else-if="courseTeachers.length > 0" class="teachers-list">
              <div
                v-for="teacher in courseTeachers"
                :key="teacher.id"
                class="teacher-item"
              >
                <div class="teacher-selection" style="margin-right: 12px">
                  <el-checkbox
                    :model-value="Boolean(selectedCourseTeachers.includes(teacher.id))"
                    @change="toggleTeacherSelection(teacher.id)"
                    :disabled="false"
                    :show-label="false"
                    style="display: inline-block"
                  >
                  </el-checkbox>
                </div>
                <div class="teacher-avatar">
                  <el-avatar :size="60" :src="teacher.avatar">
                    <el-icon><UserFilled /></el-icon>
                  </el-avatar>
                </div>
                <div class="teacher-info">
                  <h4 class="teacher-name">
                    {{ teacher.real_name || teacher.username }}
                  </h4>
                  <p class="teacher-email">{{ teacher.email }}</p>
                  <div class="teacher-meta">
                    <span v-if="teacher.school" class="meta-item">{{
                      teacher.school
                    }}</span>
                    <span v-if="teacher.major" class="meta-item">{{
                      teacher.major
                    }}</span>
                  </div>
                </div>
                <div
                  class="teacher-classes"
                  style="flex: 1; margin-left: 20px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center"
                >
                  <div
                    v-if="teacher.classes && teacher.classes.length > 0"
                    style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap"
                  >
                    <span style="font-size: 12px; color: #909399">关联班级:</span>
                    <el-tag
                      v-for="clazz in teacher.classes"
                      :key="clazz.id"
                      size="small"
                      type="info"
                      effect="plain"
                    >
                      {{ clazz.name }}
                    </el-tag>
                  </div>
                </div>
                <div class="teacher-actions" style="margin-left: 16px;">
                  <el-button
                    type="primary"
                    link
                    @click="openManageClassesDialog(teacher)"
                  >
                    <el-icon><Edit /></el-icon>
                    分配班级
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty v-else description="暂无关联教师" :image-size="120">
              <el-button type="primary" @click="openAddTeacherDialog">
                添加教师
              </el-button>
            </el-empty>
          </div>
        </el-card>
      </section>
    </div>

    <!-- 新增班级对话框 -->
    <el-dialog
      v-model="classDialogVisible"
      :title="'新增班级'"
      width="600px"
      @close="handleClassDialogClose"
    >
      <el-form
        ref="classFormRef"
        :model="classForm"
        :rules="classFormRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="班级名称" prop="name">
          <el-input
            v-model="classForm.name"
            placeholder="请输入班级名称"
            clearable
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="班级描述" prop="description">
          <el-input
            v-model="classForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入班级描述（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="最大人数" prop="max_members">
          <el-input-number
            v-model="classForm.max_members"
            :min="1"
            :max="9999"
            :step="1"
            controls-position="right"
            placeholder="限制人数"
            style="width: 30%"
          />
        </el-form-item>

        <el-form-item label="上课时间安排" prop="schedule">
          <el-input
            v-model="classForm.schedule"
            type="textarea"
            :rows="3"
            placeholder="例：每周一、三、五 14:00-16:00（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="需要邀请码" prop="require_invite" required>
          <el-switch
            v-model="classForm.require_invite"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="classDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleCreateClass"
            :loading="submitting"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑课程对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="'编辑课程'"
      width="560px"
      @close="handleEditDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="96px"
      >
        <el-form-item label="课程名称" prop="name">
          <el-input
            v-model="editForm.name"
            placeholder="请输入课程名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input
            type="textarea"
            v-model="editForm.description"
            placeholder="请输入课程描述"
            :rows="4"
          ></el-input>
        </el-form-item>
        <el-form-item label="课程状态" prop="status">
          <el-select
            v-model="editForm.status"
            placeholder="请选择课程状态"
            style="width: 100%"
          >
            <el-option label="未开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已结束" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submittingEdit"
          @click="handleEditSubmit"
          >保存</el-button
        >
      </template>
    </el-dialog>

    <!-- 编辑班级对话框 -->
    <el-dialog
      v-model="editClassDialogVisible"
      title="编辑班级"
      width="600px"
      @close="handleEditClassDialogClose"
    >
      <el-form
        ref="editClassFormRef"
        :model="editClassForm"
        :rules="editClassFormRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="班级名称" prop="name">
          <el-input
            v-model="editClassForm.name"
            placeholder="请输入班级名称"
            clearable
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="班级描述" prop="description">
          <el-input
            v-model="editClassForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入班级描述（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="最大人数" prop="max_members">
          <el-input-number
            v-model="editClassForm.max_members"
            :min="1"
            :max="9999"
            :step="1"
            controls-position="right"
            placeholder="限制人数"
            style="width: 30%"
          />
        </el-form-item>

        <el-form-item label="上课时间安排" prop="schedule">
          <el-input
            v-model="editClassForm.schedule"
            type="textarea"
            :rows="3"
            placeholder="例：每周一、三、五 14:00-16:00（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="需要邀请码" prop="require_invite" required>
          <el-switch
            v-model="editClassForm.require_invite"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editClassDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleEditClassSubmit"
            :loading="submittingEditClass"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增教师对话框 -->
    <el-dialog
      v-model="addTeacherDialogVisible"
      title="新增教师"
      width="600px"
      @close="handleAddTeacherDialogClose"
    >
      <div class="teacher-search">
        <el-input
          v-model="teacherSearchKeyword"
          placeholder="请输入教师姓名进行搜索"
          clearable
          @input="handleTeacherSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchingTeachers" class="search-loading">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="availableTeachers.length > 0" class="available-teachers">
        <div class="teachers-grid">
          <div
            v-for="teacher in availableTeachers"
            :key="teacher.id"
            class="teacher-card"
            :class="{ 
              selected: selectedCourseTeachers.includes(teacher.id),
              'is-added': courseTeachers.some(t => t.id === teacher.id)
            }"
            @click="toggleTeacherSelection(teacher.id)"
          >
            <el-avatar :size="50" :src="teacher.avatar">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
            <div class="teacher-card-info">
              <h5>{{ teacher.real_name || teacher.username }}</h5>
              <p>{{ teacher.email }}</p>
              <span v-if="teacher.school">{{ teacher.school }}</span>
            </div>
            <el-checkbox
              :model-value="selectedCourseTeachers.includes(teacher.id)"
              @change="toggleTeacherSelection(teacher.id)"
            />
          </div>
        </div>
      </div>

      <el-empty
        v-else-if="teacherSearchKeyword"
        description="未找到匹配的教师"
        :image-size="100"
      />
      <el-empty v-else description="请输入关键词搜索教师" :image-size="100" />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addTeacherDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleAddTeachers"
            :loading="addingTeachers"
            :disabled="selectedCourseTeachers.length === 0"
          >
            添加
            {{
              selectedCourseTeachers.length > 0
                ? `(${selectedCourseTeachers.length})`
                : ""
            }}
          </el-button>
        </div>
      </template>
    </el-dialog>

 
    <!-- 教师关联班级管理对话框 -->
    <el-dialog
      v-model="manageClassesDialogVisible"
      :title="`分配班级 - ${currentTeacherForClasses?.real_name || currentTeacherForClasses?.username || '教师'}`"
      width="500px"
    >
      <div class="manage-classes-content" style="padding: 10px 20px;">
        <p class="dialog-tip" style="margin-bottom:8px; color: #606266;">
          请选择要分配给该教师的班级：
        </p>
        <el-checkbox-group v-model="selectedClassIdsForTeacher">
          <div 
            v-for="clazz in relatedClasses" 
            :key="clazz.id" 
            style="margin-bottom: 5px;"
          >
            <el-checkbox :label="clazz.id" :value="clazz.id">
              {{ clazz.name }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
        
        <el-empty 
          v-if="relatedClasses.length === 0" 
          description="该课程下暂无班级" 
          :image-size="80"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="manageClassesDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSaveTeacherClasses"
            :loading="submittingClassesBinding"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 创建任务对话框 -->
    <el-dialog
      v-model="createTaskDialogVisible"
      title="创建任务"
      width="650px"
      @close="handleCreateTaskDialogClose"
    >
      <el-form :model="taskForm" label-width="100px" ref="taskFormRef" :rules="taskFormRules">
        <el-form-item label="任务标题" prop="title">
          <el-input
            v-model="taskForm.title"
            placeholder="请输入任务标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="任务类型" prop="type">
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

        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="开始时间" prop="start_time">
          <el-date-picker
            v-model="taskForm.start_time"
            type="datetime"
            placeholder="选择开始时间"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="end_time">
          <el-date-picker
            v-model="taskForm.end_time"
            type="datetime"
            placeholder="选择结束时间"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 关联题目 -->
        <el-form-item label="关联题目" prop="relation_ids">
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

        <!-- 发布对象：班级 -->
        <el-form-item label="发布班级" prop="clazz_ids">
             <el-select
                v-model="taskForm.clazz_ids"
                multiple
                placeholder="请选择要发布的班级"
                style="width: 100%"
            >
                <el-option
                    v-for="item in relatedClasses"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                />
            </el-select>
        </el-form-item>

        
      </el-form>

      <template #footer>
        <el-button @click="createTaskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitTask" :loading="creatingTask">创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog 
      v-model="editTaskDialogVisible"
      title="编辑任务"
      width="600px"
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

    <!-- 隐藏的文件上传input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleAvatarUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Reading,
  CircleCheck,
  CircleCheckFilled,
  CirclePlus,
  UserFilled,
  User,
  Clock,
  View,
  Plus,
  Loading,
  Calendar,
  Key,
  Delete,
  Search,
  Close,
  School,
  Avatar,
  ArrowDown,
  Document,
  DocumentCopy,
  VideoCamera,
} from "@element-plus/icons-vue";
import { useClassStore } from "@/stores/class";
import { useCourseStore } from "@/stores/course";
import { useUserStore } from "@/stores/user";
import { getClasses, createClass } from "@/api/class";
import { getUsers, getTeachers } from "@/api/user";
import { getCourseTeachers, searchTeachers } from "@/api/course";
import { addTask, getTasksByClazzId, updateTask, deleteTask } from "@/api/task";
import { searchProblems } from "@/api/problem";
import type { AddTaskRequest, TaskType, Task } from "@/types/task";
import type {
  Course,
  CourseStatus,
  UpdateCoursePayload,
  SearchTeachersPayload,
  SearchTeachersResponse,
} from "@/types/course";
import type {
  ClassItem,
  ClassStatus,
  ClassListResponse,
  CreateClassRequest,
  UpdateClassRequest,
} from "@/types/class";
import type { UserProfile, GetUsersParams } from "@/types/user";
import { ElMessage, ElMessageBox } from "element-plus";

const route = useRoute();
const router = useRouter();
const classStore = useClassStore();
const store = useCourseStore();
const userStore = useUserStore();
const course = ref<Course | null>(null);
const loading = ref(false);
const relatedClasses = ref<ClassItem[]>([]);
const isClassesCollapsed = ref(false);
const isTeachersCollapsed = ref(false);

// 任务管理相关
const createTaskDialogVisible = ref(false);
const creatingTask = ref(false);
const taskFormRef = ref<FormInstance>();
const taskForm = ref<AddTaskRequest>({
  course_id: '',
  title: '',
  type: 1,
  start_time: '',
  end_time: '',
  description: '',
  relation_ids: [],
  clazz_ids: []
});

const taskFormRules: FormRules = {
  title: [{ required: true, message: "请输入任务标题", trigger: "blur" }],
  type: [{ required: true, message: "请选择任务类型", trigger: "change" }],
  start_time: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  end_time: [{ required: true, message: "请选择结束时间", trigger: "change" }],
  description: [{ required: true, message: "请输入任务描述", trigger: "blur" }],
  relation_ids: [{ required: false, message: "请选择关联题目", trigger: "change" }],
  clazz_ids: [{ required: true, message: "请选择发布班级", trigger: "change" }],
};

const availableProblems = ref<any[]>([]);
const searchingProblems = ref(false);
const tasksLoading = ref(false);
const courseTaskCards = ref<Array<{
  id: string;
  title: string;
  clazzId: string;
  clazzName: string;
  description?: string;
  start_time: string;
  end_time?: string;
  type: number;
  typeLabel: string;
  typeTag: '' | 'success' | 'info';
  statusLabel: string;
  statusTag: '' | 'success' | 'warning' | 'info';
  statusValue?: number;
  finishCount: number;
  memberCount: number;
  clazzNames: string[]; // 新增：存储关联的班级名称
  clazzIds: string[];   // 新增：存储关联的班级ID
  taskInfos: Array<{ clazzId: string, taskId: string }>; // 新增：存储所有聚合的任务ID信息
}>>([]);
const taskFilter = ref<'all' | 'not_started' | 'ongoing' | 'completed'>('all');
const filteredCourseTaskCards = computed(() => {
  const allCards = courseTaskCards.value || [];
  if (taskFilter.value === 'all') return allCards;
  const targetStatus =
    taskFilter.value === 'not_started' ? 0 :
    taskFilter.value === 'ongoing' ? 1 :
    taskFilter.value === 'completed' ? 2 : null;
  if (targetStatus === null) return allCards;
  return allCards.filter(t => {
    if (typeof t.statusValue === 'number') return t.statusValue === targetStatus;
    const label = t.statusLabel;
    if (targetStatus === 0) return label === '未开始';
    if (targetStatus === 1) return label === '进行中';
    if (targetStatus === 2) return label === '已结束';
    return true;
  });
});

function openCreateTaskDialog() {
  if (!course.value) return;
  taskForm.value.course_id = course.value.id;
  createTaskDialogVisible.value = true;
}

function handleCreateTaskDialogClose() {
  taskFormRef.value?.resetFields();
  taskForm.value = {
    course_id: course.value?.id || '',
    title: '',
    type: 1,
    start_time: '',
    end_time: '',
    description: '',
    relation_ids: [],
    clazz_ids: []
  };
}

async function handleProblemSearch(query: string) {
  if (query) {
    searchingProblems.value = true;
    try {
      const res = await searchProblems({ keyword: query, page: 1, page_size: 20 });
      const list = (res as any)?.data?.list 
        ?? (res as any)?.list 
        ?? (res as any)?.items 
        ?? (res as any)?.problems 
        ?? [];
      availableProblems.value = Array.isArray(list) ? list : [];
    } catch (e) {
      console.error(e);
    } finally {
      searchingProblems.value = false;
    }
  } else {
    availableProblems.value = [];
  }
}

async function handleSubmitTask() {
  if (!taskFormRef.value) return;
  await taskFormRef.value.validate(async (valid) => {
    if (valid) {
      // 检查任务标题是否已存在
      const isDuplicate = courseTaskCards.value.some(
        (task) => task.title.trim() === taskForm.value.title.trim()
      );

      if (isDuplicate) {
        ElMessage.warning("当前课程下已存在同名任务，请修改任务标题");
        return;
      }

      creatingTask.value = true;
      try {
        const payload = { ...taskForm.value };
        
        await addTask(payload);
        ElMessage.success("任务创建成功");
        createTaskDialogVisible.value = false;
        await fetchCourseTasks();
      } catch (e: any) {
        ElMessage.error(e.message || "任务创建失败");
      } finally {
        creatingTask.value = false;
      }
    }
  });
}

function mapTaskTypeLabel(type?: number) {
  const labels: Record<number, string> = {
    1: "题单",
    2: "视频",
  };
  return type !== undefined ? labels[type] || "未知" : "未知";
}

function mapTaskTypeTag(type?: number): '' | 'success' | 'info' {
  switch (type) {
    case 1:
      return 'success';
    case 2:
      return 'info';
    default:
      return '';
  }
}

function mapTaskStatusLabel(status?: number) {
  const labels: Record<number, string> = {
    0: "未开始",
    1: "进行中",
    2: "已结束",
  };
  return status !== undefined ? labels[status] || "未知" : "未知";
}

function mapTaskStatusTag(status?: number): '' | 'success' | 'warning' | 'info' {
  switch (status) {
    case 1:
      return 'success';
    case 2:
      return 'info';
    case 0:
      return 'warning';
    default:
      return '';
  }
}

async function fetchCourseTasks() {
  if (!relatedClasses.value || relatedClasses.value.length === 0) {
    courseTaskCards.value = [];
    return;
  }
  tasksLoading.value = true;
  try {
    const promises = relatedClasses.value.map(async (clazz) => {
      const res = await getTasksByClazzId(String(clazz.id)) as any;
      const list: Task[] = Array.isArray(res) ? res : (res?.data || res?.list || []);
      return list.map((t) => ({
        id: String(t.id),
        title: t.title,
        clazzId: String(clazz.id),
        clazzName: clazz.name || '未命名班级',
        description: t.description || '',
        start_time: t.start_time,
        end_time: t.end_time,
        type: t.type, // Store raw type
        typeLabel: mapTaskTypeLabel(t.type),
        typeTag: mapTaskTypeTag(t.type),
        statusLabel: mapTaskStatusLabel(t.status),
        statusTag: mapTaskStatusTag(t.status),
        statusValue: typeof t.status === 'number' ? t.status : undefined,
        finishCount: Array.isArray(t.finish_ids) ? t.finish_ids.length : 0,
        memberCount: Number(clazz.member_count || 0),
      }));
    });
    const results = await Promise.all(promises);
    const allTasks = results.flat();
    
    // 聚合逻辑：根据 标题+类型+开始时间+结束时间 视为同一个任务
    const mergedTasksMap = new Map<string, typeof allTasks[0] & { clazzNames: string[], clazzIds: string[], taskInfos: Array<{ clazzId: string, taskId: string }> }>();

    allTasks.forEach(task => {
      // 生成唯一Key用于聚合
      const key = `${task.title}|${task.typeLabel}|${task.start_time}|${task.end_time || ''}`;

      if (mergedTasksMap.has(key)) {
        const existing = mergedTasksMap.get(key)!;
        // 累加数据
        if (!existing.clazzIds.includes(task.clazzId)) {
          existing.clazzIds.push(task.clazzId);
          existing.clazzNames.push(task.clazzName);
          existing.finishCount += task.finishCount;
          existing.memberCount += task.memberCount;
          existing.taskInfos.push({ clazzId: task.clazzId, taskId: task.id });
        }
      } else {
        // 初始化新记录
        mergedTasksMap.set(key, {
          ...task,
          clazzNames: [task.clazzName],
          clazzIds: [task.clazzId],
          taskInfos: [{ clazzId: task.clazzId, taskId: task.id }]
        });
      }
    });

    // 按照截止时间升序排列（即将截止的排在前面）
    courseTaskCards.value = Array.from(mergedTasksMap.values()).sort((a, b) => {
      const getTimestamp = (timeStr?: string) => {
        if (!timeStr) return Number.MAX_SAFE_INTEGER;
        const t = new Date(timeStr).getTime();
        return isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
      };
      return getTimestamp(a.end_time) - getTimestamp(b.end_time);
    });
  } catch (e) {
    console.error("加载任务列表失败:", e);
    courseTaskCards.value = [];
  } finally {
    tasksLoading.value = false;
  }
}

function handleViewTaskFromCourse(taskId: string, clazzId: string) {
  router.push({
    path: `/teacher/task/${taskId}`,
    query: { clazzId }
  });
}

// 编辑任务相关
const editTaskDialogVisible = ref(false)
const updatingTask = ref(false)
const currentEditingTaskInfos = ref<Array<{ clazzId: string, taskId: string }>>([])
const editTaskForm = ref({
  title: '',
  description: '',
  type: 1 as TaskType,
  start_time: '',
  end_time: '',
})

function handleEditTask(taskItem: any) {
  editTaskForm.value = {
    title: taskItem.title,
    description: taskItem.description || '',
    type: taskItem.type || 1,
    start_time: taskItem.start_time,
    end_time: taskItem.end_time || '',
  }
  currentEditingTaskInfos.value = taskItem.taskInfos || []
  editTaskDialogVisible.value = true
}

async function handleUpdateTask() {
    if (!editTaskForm.value.title.trim()) {
      ElMessage.warning('请输入任务标题')
      return
    }
    if (!editTaskForm.value.start_time) {
      ElMessage.warning('请选择开始时间')
      return
    }
    
    updatingTask.value = true
    try {
        const promises = currentEditingTaskInfos.value.map(info => 
            updateTask(info.clazzId, info.taskId, {
                task_id: info.taskId,
                clazz_id: info.clazzId,
                course_id: course.value?.id || '',
                title: editTaskForm.value.title.trim(),
                description: editTaskForm.value.description?.trim() || undefined,
                type: editTaskForm.value.type,
                start_time: editTaskForm.value.start_time,
                end_time: editTaskForm.value.end_time || undefined,
            })
        )
        await Promise.all(promises)
        ElMessage.success('更新成功')
        editTaskDialogVisible.value = false
        await fetchCourseTasks()
    } catch (error: any) {
        console.error('更新任务失败', error)
        ElMessage.error(error?.message || '更新任务失败')
    } finally {
        updatingTask.value = false
    }
}

async function handleDeleteTask(taskItem: any) {
  if (!taskItem.taskInfos || taskItem.taskInfos.length === 0) return;
  
  try {
    await ElMessageBox.confirm(
      `确定要删除该任务吗? 此操作将删除 ${taskItem.taskInfos.length} 个关联班级中的该任务。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 批量删除
    const promises = taskItem.taskInfos.map((info: any) => 
      deleteTask(info.clazzId, info.taskId)
    );
    
    await Promise.all(promises);
    ElMessage.success('删除成功');
    await fetchCourseTasks();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除任务失败:', error);
      ElMessage.error('删除任务失败');
    }
  }
}

function goToClassDetail(classId: string) {
  if (!classId) {
    ElMessage.warning("班级ID不能为空");
    return;
  }
  try {
    const courseName = course.value?.name || course.value?.title || "";
    const teacherName =
      course.value?.teacher_name ||
      course.value?.created_by_user?.username ||
      course.value?.created_by_user?.real_name ||
      "";
    router
      .push({
        name: "TeacherClassDetail",
        params: { clazzes_id: classId },
        query: { courseName, teacherName },
      })
      .catch((error) => {
        console.error("跳转失败:", error);
        ElMessage.error("跳转失败: " + error.message);
      });
  } catch (error: any) {
    console.error("跳转异常:", error);
    ElMessage.error("跳转异常: " + error?.message);
  }
}
// 头像上传相关
const fileInputRef = ref<HTMLInputElement>();
const uploadingAvatar = ref(false);

// 编辑课程相关
const editDialogVisible = ref(false);
const editFormRef = ref<FormInstance>();
const submittingEdit = ref(false);
const editForm = ref({
  name: "",
  description: "",
  status: 0 as CourseStatus,
});

const editFormRules: FormRules = {
  name: [{ required: true, message: "请输入课程名称", trigger: "blur" }],
  description: [
    { min: 0, max: 500, message: "描述不超过500字", trigger: "blur" },
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

// 教师管理相关
const courseTeachers = ref<any[]>([]);
const addTeacherDialogVisible = ref(false);
const teacherSearchKeyword = ref("");
const searchingTeachers = ref(false);
const availableTeachers = ref<UserProfile[]>([]);
const addingTeachers = ref(false);
const removingTeacher = ref<string | null>(null);
// 课程教师管理专用变量
const selectedCourseTeachers = ref<string[]>([]); // 用于课程教师管理

/**
 * 处理Base64图片数据，添加正确的data URI前缀
 * @param base64Data Base64编码的图片数据
 * @returns 完整的data URI或原始数据
 */
function processImageData(base64Data?: string): string {
  if (!base64Data) {
    return "https://placehold.co/400x250.png?text=Course+Cover";
  }

  // 如果已经是完整的URL或data URI，直接返回
  if (base64Data.startsWith("http") || base64Data.startsWith("data:")) {
    return base64Data;
  }

  // 如果是Base64数据，添加data URI前缀
  // 默认假设是JPEG格式，也可以根据数据头部判断格式
  if (
    base64Data.startsWith("/9j/") ||
    base64Data.startsWith("iVBOR") ||
    base64Data.startsWith("R0lGOD")
  ) {
    // /9j/ 开头通常是JPEG，iVBOR开头是PNG，R0lGOD开头是GIF
    let mimeType = "image/jpeg";
    if (base64Data.startsWith("iVBOR")) {
      mimeType = "image/png";
    } else if (base64Data.startsWith("R0lGOD")) {
      mimeType = "image/gif";
    }
    return `data:${mimeType};base64,${base64Data}`;
  }

  // 如果不是识别的图片格式，返回默认图片
  return "https://placehold.co/400x250.png?text=Course+Cover";
}

// 计算属性：处理后的课程头像URL
const courseAvatarUrl = computed(() => {
  return processImageData(course.value?.avatar || course.value?.cover_url);
});

// 新增班级对话框相关
const classDialogVisible = ref(false);
const classFormRef = ref<FormInstance>();
const submitting = ref(false);
const classForm = ref<CreateClassRequest>({
  name: "",
  description: "",
  max_members: undefined,
  schedule: "",
  require_invite: true, // 默认需要邀请码
  course_id: course.value?.id || "", // 添加 course_id，如果课程未加载则为空字符串
  teacher_ids: [], // 保留以符合类型要求，但UI上不再显示
});

const classFormRules: FormRules = {
  name: [
    { required: true, message: "请输入班级名称", trigger: "blur" },
    { min: 2, max: 50, message: "班级名称长度为 2-50 个字符", trigger: "blur" },
  ],
  require_invite: [
    { required: true, message: "请选择是否需要邀请码", trigger: "change" },
  ],
};

// 编辑班级对话框相关
const editClassDialogVisible = ref(false);
const editClassFormRef = ref<FormInstance>();
const submittingEditClass = ref(false);
const currentEditingClass = ref<ClassItem | null>(null);
const editClassForm = ref({
  name: "",
  description: "",
  max_members: undefined as number | undefined,
  schedule: "",
  require_invite: true,
});

const editClassFormRules: FormRules = {
  name: [
    { required: true, message: "请输入班级名称", trigger: "blur" },
    { min: 2, max: 50, message: "班级名称长度为 2-50 个字符", trigger: "blur" },
  ],
  require_invite: [
    { required: true, message: "请选择是否需要邀请码", trigger: "change" },
  ],
};

/** 获取课程状态标签文本 */
function mapStatusLabel(status?: CourseStatus) {
  const labels: Record<number, string> = {
    0: "未开始",
    1: "进行中",
    2: "已结束",
  };
  return status !== undefined ? labels[status] || "未知" : "未知";
}

/** 获取课程状态标签类型 */
function getStatusType(
  status?: CourseStatus,
): "" | "success" | "info" | "warning" {
  switch (status) {
    case 1:
      return "success"; // 进行中 - 绿色
    case 2:
      return "info"; // 已结束 - 灰色
    case 0:
      return "warning"; // 未开始 - 橙色
    default:
      return "info"; // 未知状态 - 灰色
  }
}

/** 获取班级状态标签文本 */
function getClassStatusLabel(status?: ClassStatus) {
  if (status === undefined || status === null) {
    return "未知";
  }

  // 数字状态映射
  if (typeof status === "number") {
    const numberLabels: Record<number, string> = {
      0: "未激活",
      1: "活跃",
      2: "已归档",
    };
    return numberLabels[status] || "未知";
  }

  // 字符串状态映射
  const stringLabels: Record<string, string> = {
    active: "活跃",
    archived: "已归档",
    pending: "待激活",
  };
  return stringLabels[status] || "未知";
}

/** 获取班级状态标签类型 */
function getClassStatusType(status?: ClassStatus) {
  // 数字状态映射
  if (typeof status === "number") {
    switch (status) {
      case 1:
        return "success"; // 活跃 - 绿色
      case 2:
        return "info"; // 已归档 - 灰色
      case 0:
        return "warning"; // 未激活 - 橙色
      default:
        return "info"; // 未知状态 - 灰色
    }
  }
  return "info"; // 默认返回 info 而不是空字符串
}

/** 格式化日期 */
function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

/** 打开编辑对话框 */
function openEditDialog() {
  if (!course.value) {
    ElMessage.warning("课程信息未加载，无法编辑");
    return;
  }

  // 填充表单数据
  editForm.value = {
    name: course.value.name || course.value.title || "",
    description: course.value.description || "",
    status: course.value.status ?? 0,
  };

  editDialogVisible.value = true;
}

/** 关闭编辑对话框 */
function handleEditDialogClose() {
  editFormRef.value?.resetFields();
  editForm.value = {
    name: "",
    description: "",
    status: 0,
  };
}

/** 提交编辑表单 */
async function handleEditSubmit() {
  if (!editFormRef.value) return;

  if (!course.value?.id) {
    ElMessage.error("课程信息未加载，无法保存");
    return;
  }

  await editFormRef.value.validate(async (valid) => {
    if (!valid) return;

    submittingEdit.value = true;
    try {
      const payload = {
        id: course.value!.id,
        name: editForm.value.name,
        description: editForm.value.description,
        status: editForm.value.status,
      };

      await store.update(course.value!.id, payload);
      editDialogVisible.value = false;

      // 重新加载课程详情
      await load();
    } catch (error: any) {
      console.error("编辑课程失败:", error);
      ElMessage.error(error?.message || "编辑课程失败");
    } finally {
      submittingEdit.value = false;
    }
  });
}

/** 触发头像上传 */
function triggerAvatarUpload() {
  if (uploadingAvatar.value) {
    ElMessage.warning("正在上传中，请稍候...");
    return;
  }

  if (!course.value?.id) {
    ElMessage.warning("课程信息未加载，无法上传头像");
    return;
  }

  fileInputRef.value?.click();
}

/** 处理头像上传 */
async function handleAvatarUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    return;
  }

  // 验证文件类型
  if (!file.type.startsWith("image/")) {
    ElMessage.error("请选择图片文件");
    target.value = ""; // 清空文件选择
    return;
  }

  // 验证文件大小 (限制为5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    ElMessage.error("图片文件大小不能超过5MB");
    target.value = ""; // 清空文件选择
    return;
  }

  if (!course.value?.id) {
    ElMessage.error("课程信息未加载，无法上传头像");
    target.value = ""; // 清空文件选择
    return;
  }

  uploadingAvatar.value = true;

  try {
    await store.updateAvatar(course.value.id, file);
    ElMessage.success("头像上传成功");

    // 重新加载课程详情以获取最新的头像URL
    await load();
  } catch (error: any) {
    console.error("头像上传失败:", error);
    ElMessage.error(error?.message || "头像上传失败");
  } finally {
    uploadingAvatar.value = false;
    target.value = ""; // 清空文件选择，允许重复选择同一文件
  }
}

/** 打开创建班级对话框 */
function openCreateClassDialog() {
  if (!course.value?.id) {
    ElMessage.warning("课程信息未加载，请稍后再试");
    return;
  }

  classForm.value = {
    name: "",
    description: "",
    max_members: undefined,
    schedule: "",
    require_invite: true, // 默认需要邀请码
    course_id: course.value!.id,
    teacher_ids: [], // 保留以符合类型要求
  };

  classDialogVisible.value = true;
}

/** 关闭创建班级对话框 */
function handleClassDialogClose() {
  classFormRef.value?.resetFields();
  classForm.value = {
    name: "",
    description: "",
    max_members: undefined,
    schedule: "",
    require_invite: true, // 默认需要邀请码
    course_id: course.value?.id || "", // 从当前课程获取
    teacher_ids: [], // 保留以符合类型要求
  };
}

/** 创建班级 */
async function handleCreateClass() {
  if (!classFormRef.value) return;

  // 检查课程ID是否存在
  if (!course.value?.id) {
    ElMessage.error("课程信息未加载，无法创建班级");
    return;
  }

  await classFormRef.value.validate(async (valid) => {
    if (!valid) return;

    submitting.value = true;
    try {
      // 根据接口规范，构建请求数据
      // 获取当前用户ID作为教师ID
      const currentUserId = userStore.user?.id;

      const payload: CreateClassRequest = {
        name: classForm.value.name,
        description: classForm.value.description,
        require_invite: classForm.value.require_invite, // 必填字段
        course_id: course.value!.id, // 添加课程ID
        teacher_ids: currentUserId ? [currentUserId] : [], // 默认传递当前用户ID作为唯一教师ID
        // major_class_ids: classForm.value.major_class_ids, // 删除
      };

      // 如果有填写最大人数，添加到请求中
      if (classForm.value.max_members) {
        payload.max_members = classForm.value.max_members;
      }

      // 如果有填写上课时间，添加到请求中
      if (classForm.value.schedule) {
        payload.schedule = classForm.value.schedule;
      }

      await createClass(payload);
      
      ElMessage.success("班级创建成功");
      classDialogVisible.value = false;

      // 刷新班级列表
      if (course.value?.id) {
        await loadRelatedClasses(course.value.id);
      }
    } catch (error: any) {
      console.error("创建班级失败:", error);
      ElMessage.error(error?.message || "创建班级失败");
    } finally {
      submitting.value = false;
    }
  });
}

// 教师搜索相关方法
/** 搜索教师 */
async function handleTeacherSearch() {
  if (!teacherSearchKeyword.value.trim()) {
    availableTeachers.value = [];
    return;
  }

  searchingTeachers.value = true;
  try {
    const payload: SearchTeachersPayload = {
      page_num: 1,
      page_size: 20,
      real_name: teacherSearchKeyword.value.trim(),
    };

    const response = await searchTeachers(payload);
    // 修复：根据实际API响应，字段名是teachers（小写t）
    availableTeachers.value = response.teachers || [];
  } catch (error: any) {
    console.error("搜索教师失败:", error);
    ElMessage.error(error?.message || "搜索教师失败");
    availableTeachers.value = [];
  } finally {
    searchingTeachers.value = false;
  }
}

/** 清空教师搜索 */
function handleTeacherSearchClear() {
  availableTeachers.value = [];
  teacherSearchKeyword.value = "";
}

/** 切换教师选择状态 */
  function toggleTeacherSelection(teacherId: string): void {
    // 仅在新增教师对话框中检查是否已添加
    if (addTeacherDialogVisible.value) {
      // 检查教师是否已在关联列表中
      const isAlreadyAdded = courseTeachers.value.some(teacher => teacher.id === teacherId);
      if (isAlreadyAdded) {
        ElMessage.warning('该教师已在关联列表中');
        return;
      }
    }

    // 只处理课程教师管理的情况（传入的是教师ID）
    const index = selectedCourseTeachers.value.indexOf(teacherId);
    if (index > -1) {
      selectedCourseTeachers.value.splice(index, 1);
    } else {
      selectedCourseTeachers.value.push(teacherId);
    }
  }


/** 删除班级 */
async function handleDeleteClass(classItem: ClassItem) {
  if (!classItem.id) {
    ElMessage.warning("班级ID不能为空");
    return;
  }

  // 弹出确认对话框
  const { ElMessageBox } = await import("element-plus");

  try {
    await ElMessageBox.confirm(
      `确定要删除班级 "${classItem.name || "未命名班级"}" 吗？此操作不可撤销。`,
      "删除确认",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      },
    );

    // 设置courseId以便store能正确工作
    if (course.value?.id) {
      classStore.setCourseId(course.value.id);
    }

    // 用户确认删除，调用store的remove方法
    await classStore.remove(classItem.id);

    // 重新加载班级列表
    if (course.value?.id) {
      await loadRelatedClasses(course.value.id);
    }
  } catch (error: any) {
    // 用户取消删除或删除失败
    if (error !== "cancel") {
      console.error("删除班级失败:", error);
      ElMessage.error(error?.message || "删除班级失败");
    }
  }
}

/** 编辑班级 */
function handleEditClass(classItem: ClassItem) {
  if (!classItem.id) {
    ElMessage.warning("班级信息不完整，无法编辑");
    return;
  }

  // 保存当前编辑的班级信息
  currentEditingClass.value = classItem;

  // 填充表单数据
  editClassForm.value = {
    name: classItem.name || "",
    description: classItem.description || "",
    max_members: classItem.max_members,
    schedule: classItem.schedule || "",
    require_invite: classItem.require_invite ?? true,
  };

  editClassDialogVisible.value = true;
}

/** 编辑班级对话框关闭处理 */
function handleEditClassDialogClose() {
  editClassFormRef.value?.resetFields();
  editClassForm.value = {
    name: "",
    description: "",
    max_members: undefined,
    schedule: "",
    require_invite: true,
  };
  currentEditingClass.value = null;
}

/** 提交编辑班级 */
async function handleEditClassSubmit() {
  if (!editClassFormRef.value) return;

  if (!currentEditingClass.value?.id) {
    ElMessage.error("班级信息未加载，无法保存");
    return;
  }

  await editClassFormRef.value.validate(async (valid) => {
    if (!valid) return;

    submittingEditClass.value = true;
    try {
      // 设置courseId以便store能正确工作
      if (course.value?.id) {
        classStore.setCourseId(course.value.id);
      }

      // 检查currentEditingClass是否存在
      if (!currentEditingClass.value) {
        ElMessage.error("班级信息不存在");
        return;
      }

      // 调用store的update方法，使用正确的参数格式
      await classStore.update({
        clazz_id: currentEditingClass.value.id,
        name: editClassForm.value.name,
        description: editClassForm.value.description,
        max_members: editClassForm.value.max_members,
        schedule: editClassForm.value.schedule,
        require_invite: editClassForm.value.require_invite,
      });

      editClassDialogVisible.value = false;
      ElMessage.success("班级信息更新成功");

      // 重新加载班级列表
      if (course.value?.id) {
        await loadRelatedClasses(course.value.id);
      }
    } catch (error: any) {
      console.error("更新班级失败:", error);
      ElMessage.error(error?.message || "更新班级失败");
    } finally {
      submittingEditClass.value = false;
    }
  });
}

/** 加载关联班级列表 */
async function loadRelatedClasses(courseId: string) {
  try {
    const response = await getClasses({ course_id: courseId });

    // 处理不同的响应格式
    let classesData: ClassItem[] = [];

    if (Array.isArray(response)) {
      // 如果响应直接是数组
      classesData = response;
    } else if (response && Array.isArray(response.data)) {
      // 如果响应有 data 字段且是数组
      classesData = response.data;
    } else if (
      response &&
      response.classes &&
      Array.isArray(response.classes)
    ) {
      // 如果响应有 classes 字段
      classesData = response.classes;
    } else if (
      response &&
      response.data &&
      Array.isArray(response.data.classes)
    ) {
      // 嵌套的 classes 字段
      classesData = response.data.classes;
    }

    // 赋值给响应式变量
    relatedClasses.value = classesData;
    console.log("课程关联的班级列表:", classesData);
  } catch (error) {
    console.error("加载班级列表失败:", error);
    ElMessage.error("加载班级列表失败");
    relatedClasses.value = [];
  }
}

/** 加载课程详情 */
async function load() {
  const id = String(route.params.id || "");
  if (!id) return;

  loading.value = true;
  try {
    const data = await store.fetchCourseById(id);
    console.log("课程详情数据:", data);
    
    // 提取并设置教师关联的班级信息
    const courseData = data as any;
    if (courseData && Array.isArray(courseData.teachers)) {
      courseTeachers.value = courseData.teachers.map((t: any) => ({
        ...(t.user_profile || {}),
        classes: t.classes || []
      }));
    } else {
      // 如果没有详细的teachers信息，后面会尝试加载
      courseTeachers.value = [];
    }
    
    course.value = data as Course;

    // 设置课程ID到 classStore
    classStore.setCourseId(id);

    // 加载关联班级列表
    if (course.value?.id) {
      await loadRelatedClasses(course.value.id);
      await fetchCourseTasks();
    }

    // 如果尚未加载关联教师列表，则加载
    if (courseTeachers.value.length === 0) {
      await loadCourseTeachers();
    }
  } catch (error) {
    console.error("加载课程详情失败:", error);
    ElMessage.error("加载课程详情失败");
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.back();
}

// 监听selectedCourseTeachers变化
watch(
  selectedCourseTeachers,
  (newVal) => {
    // 选中的教师ID已移除console.log
  },
  { deep: true },
);

/** 批量移除选中的教师 */
async function handleRemoveSelectedTeachers() {
  if (selectedCourseTeachers.value.length === 0 || !course.value?.id) return;

  try {
    await ElMessageBox.confirm(
      `确定要移除选中的 ${selectedCourseTeachers.value.length} 位教师吗？`,
      "确认移除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    // 使用已有的移除教师方法，批量移除选中的教师
    await store.removeTeachers({
      course_id: course.value.id,
      teacher_ids: selectedCourseTeachers.value,
    });

    ElMessage.success(`成功移除 ${selectedCourseTeachers.value.length} 位教师`);

    // 清空选中状态
    selectedCourseTeachers.value = [];

    // 优化：只重新加载教师列表，而不是整个组件数据
    await loadCourseTeachers();
  } catch (error) {
    if (error !== "cancel") {
      console.error("移除教师失败:", error);
      // Store 已处理错误提示
    }
  } finally {
    removingTeacher.value = null;
  }
}

/** 加载课程关联的教师列表 */
async function loadCourseTeachers() {
  if (!course.value?.id) {
    courseTeachers.value = [];
    return;
  }

  try {
    // 优先尝试获取课程详情以获取包含班级的教师列表
    const data = await store.fetchCourseById(course.value.id);
    const courseData = data as any;

    if (courseData && Array.isArray(courseData.teachers)) {
      courseTeachers.value = courseData.teachers.map((t: any) => ({
        ...(t.user_profile || {}),
        classes: t.classes || [],
      }));
      return;
    }

    // 调用getCourseTeachers接口获取课程教师信息
    // 按照PageQueryCourseTeachersRequest的要求构建参数
    const params = {
      page_num: 1, // 页码，从1开始
      page_size: 100, // 每页数量
      // 以下为可选参数
      // real_name: '教师姓名', // 可选，按教师姓名筛选
      // teacher_id: '特定教师ID' // 可选，按特定教师ID筛选
    };

    const response = await getCourseTeachers(course.value.id, params);

    // 如果接口返回了教师数据，就使用它
    if (response && response.teachers) {
      courseTeachers.value = response.teachers;
    } else {
      // 兼容原有逻辑，避免功能中断
      if (course.value?.teacher_ids && course.value.teacher_ids.length > 0) {
        // 根据teacher_ids获取教师详细信息
        const teacherPromises = course.value.teacher_ids.map((id) =>
          getUsers({ role: "teacher" })
            .then((response) => response.users.find((user) => user.id === id))
            .catch(() => null),
        );

        const teachers = await Promise.all(teacherPromises);
        courseTeachers.value = teachers.filter(
          (teacher) => teacher !== null,
        ) as UserProfile[];
      } else {
        courseTeachers.value = [];
      }
    }
  } catch (error) {
    console.error("加载课程教师失败:", error);

    // 错误情况下回退到原有逻辑
    if (course.value?.teacher_ids && course.value.teacher_ids.length > 0) {
      const teacherPromises = course.value.teacher_ids.map((id) =>
        getUsers({ role: "teacher" })
          .then((response) => response.users.find((user) => user.id === id))
          .catch(() => null),
      );

      const teachers = await Promise.all(teacherPromises);
      courseTeachers.value = teachers.filter(
        (teacher) => teacher !== null,
      ) as UserProfile[];
    } else {
      courseTeachers.value = [];
    }
  }
}

/** 打开新增教师对话框 */
function openAddTeacherDialog() {
  addTeacherDialogVisible.value = true;
  teacherSearchKeyword.value = "";
  availableTeachers.value = [];
  selectedCourseTeachers.value = []; // 使用课程教师管理专用变量
}

/** 关闭新增教师对话框 */
function handleAddTeacherDialogClose() {
  teacherSearchKeyword.value = "";
  availableTeachers.value = [];
  selectedCourseTeachers.value = []; // 使用课程教师管理专用变量
}

/** 添加选中的教师 */
async function handleAddTeachers() {
  if (selectedCourseTeachers.value.length === 0 || !course.value?.id) return;

  addingTeachers.value = true;
  try {
    await store.addTeachers({
      course_id: course.value.id,
      teacher_ids: selectedCourseTeachers.value,
    });

    ElMessage.success(`成功添加 ${selectedCourseTeachers.value.length} 位教师`);
    addTeacherDialogVisible.value = false;

    // 优化：只重新加载教师列表，而不是整个组件数据
    await loadCourseTeachers();
  } catch (error) {
    console.error("添加教师失败:", error);
    // Store 已处理错误提示
  } finally {
    addingTeachers.value = false;
  }
}

/**
 * 添加教师到课程
 * @param teacherIds 要添加的教师ID数组
 * @returns Promise<boolean> 添加是否成功
 */
async function addCourseTeachers(teacherIds: string[]): Promise<boolean> {
  if (teacherIds.length === 0 || !course.value?.id) return false;

  try {
    await store.addTeachers({
      course_id: course.value.id,
      teacher_ids: teacherIds,
    });

    ElMessage.success(`成功添加 ${teacherIds.length} 位教师`);

    // 优化：只重新加载教师列表，而不是整个组件数据
    await loadCourseTeachers();

    return true;
  } catch (error) {
    console.error("添加教师失败:", error);
    // Store 已处理错误提示
    return false;
  }
}

/** 移除教师 */
async function handleRemoveTeacher(teacher: UserProfile) {
  if (!course.value?.id) return;

  try {
    await ElMessageBox.confirm(
      `确定要移除教师 "${teacher.real_name || teacher.username}" 吗？`,
      "确认移除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    removingTeacher.value = teacher.id;

    await store.removeTeachers({
      course_id: course.value.id,
      teacher_ids: [teacher.id],
    });

    ElMessage.success("教师移除成功");

    // 优化：只重新加载教师列表，而不是整个组件数据
    await loadCourseTeachers();
  } catch (error) {
    if (error !== "cancel") {
      console.error("移除教师失败:", error);
      // Store 已处理错误提示
    }
  } finally {
    removingTeacher.value = null;
  }
}

// 教师关联班级管理相关
const manageClassesDialogVisible = ref(false);
const currentTeacherForClasses = ref<any>(null);
const selectedClassIdsForTeacher = ref<string[]>([]);
const submittingClassesBinding = ref(false);

/** 打开管理教师关联班级对话框 */
function openManageClassesDialog(teacher: any) {
  currentTeacherForClasses.value = teacher;
  // 获取该教师已关联的班级ID
  selectedClassIdsForTeacher.value = (teacher.classes || []).map((c: any) => c.id);
  manageClassesDialogVisible.value = true;
}

/** 保存教师关联班级 */
async function handleSaveTeacherClasses() {
  if (!currentTeacherForClasses.value) return;
  
  submittingClassesBinding.value = true;
  try {
    const teacherId = currentTeacherForClasses.value.id;
    const oldClassIds = (currentTeacherForClasses.value.classes || []).map((c: any) => c.id);
    const newClassIds = selectedClassIdsForTeacher.value;
    
    // 计算需要添加和移除的班级
    const toAdd = newClassIds.filter((id: string) => !oldClassIds.includes(id));
    const toRemove = oldClassIds.filter((id: string) => !newClassIds.includes(id));
    
    const promises = [];
    
    // 批量添加
    if (toAdd.length > 0) {
      promises.push(classStore.bindTeachers(toAdd, teacherId));
    }
    
    // 逐个移除
    if (toRemove.length > 0) {
      toRemove.forEach((classId: string) => {
        promises.push(classStore.removeClazzTeacherAction(classId, teacherId));
      });
    }
    
    await Promise.all(promises);
    
    ElMessage.success("教师关联班级已更新");
    manageClassesDialogVisible.value = false;
    
    // 刷新数据
    await loadCourseTeachers();
    
  } catch (error: any) {
    console.error("更新教师关联班级失败:", error);
    // 错误已经在 store action 中处理了部分，这里可以只记录
  } finally {
    submittingClassesBinding.value = false;
  }
}

onMounted(load);

// 导出公共方法
defineExpose({
  addCourseTeachers,
});
</script>

<style lang="scss" scoped>
.course-detail {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;

  .loading-state {
    padding: 20px;
  }

  section {
    margin-bottom: 24px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 28px;

    .header-left {
      flex: 1;
    }

    .title {
      margin: 0;
      font-size: 32px;
      font-weight: 300;
      color: $text-primary;
      letter-spacing: 0.02em;
    }

    .title-meta {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .muted {
      color: $text-tertiary;
      font-size: 14px;
    }

    .header-actions {
      display: inline-flex;
      gap: 10px;
    }

    .ghost-btn :deep(.el-icon),
    .primary-btn :deep(.el-icon) {
      margin-right: 6px;
    }
  }

  .overview-card,
  .description-card,
  .classes-card,
  .resources-card {
    border: 1px solid $border-card;
    border-radius: $border-radius-card;
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
    color: $text-tertiary;
  }

  .course-overview {
    margin-bottom: 32px;

    .overview-grid {
      display: grid;
      grid-template-columns: 360px repeat(3, 1fr);
      grid-template-rows: 1fr 1fr;
      gap: 20px;
    }
  }

  .tasks {
    .task-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .task-count-tag {
      margin-left: 8px;
    }
    .section-actions {
      display: inline-flex;
      gap: 10px;
      align-items: center;
    }
    .filter-group :deep(.el-button) {
      min-width: 80px;
    }
    .task-card {
      border: 1px solid $border-card;
      border-radius: $border-radius-card;
      padding: 16px;
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
  }

  .info-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px;
    background: #ffffff;
    border: 1px solid $border-card;
    border-radius: $border-radius-card;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    .card-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--card-icon-bg);
      border-radius: 14px;
      font-size: 26px;
      color: var(--card-icon-color);
      margin-bottom: 16px;
      transition: all 0.3s ease;
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .card-label {
      font-size: 13px;
      font-weight: 500;
      color: $text-tertiary;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
      text-align: center;
    }

    .card-value {
      font-size: 20px;
      font-weight: 700;
      color: $text-primary;
      line-height: 1.4;
      word-break: break-word;
      text-align: center;
    }

    .card-value .unit {
      font-size: 14px;
      font-weight: 500;
      color: $text-quaternary;
      margin-left: 4px;
    }
  }

  .cover-card {
    padding: 0;
    display: flex;
    flex-direction: column;
    grid-row: 1 / 3;
    grid-column: 1;
    --card-gradient-from: #6366f1;
    --card-gradient-to: #4f46e5;
    --card-border-hover: #6366f1;
    --card-shadow: rgba(99, 102, 241, 0.2);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-default;
    }

    &.uploading {
      cursor: not-allowed;
    }

    .cover-image {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: $bg-tertiary;
      border-radius: $border-radius-card;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all 0.3s ease;
      }
    }

    &:hover .cover-image img {
      transform: scale(1.05);
    }

    .upload-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s ease;
      border-radius: $border-radius-card;
    }

    &:hover .upload-overlay {
      opacity: 1;
    }

    &.uploading .upload-overlay {
      opacity: 1;
      background: rgba(0, 0, 0, 0.8);
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #fff;
      text-align: center;

      .upload-icon {
        font-size: 32px;
        margin-bottom: 4px;

        &.loading {
          animation: rotate 1s linear infinite;
        }
      }

      .upload-text {
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
      }
    }
  }

  .name-card {
    --card-gradient-from: #3b82f6;
    --card-gradient-to: #2563eb;
    --card-border-hover: #3b82f6;
    --card-shadow: rgba(59, 130, 246, 0.2);
    --card-icon-bg: rgba(59, 130, 246, 0.1);
    --card-icon-color: #3b82f6;
  }

  .status-card {
    --card-gradient-from: #10b981;
    --card-gradient-to: #059669;
    --card-border-hover: #10b981;
    --card-shadow: rgba(16, 185, 129, 0.2);
    --card-icon-bg: rgba(16, 185, 129, 0.1);
    --card-icon-color: #10b981;
  }

  .teacher-card {
    --card-gradient-from: #f59e0b;
    --card-gradient-to: #d97706;
    --card-border-hover: #f59e0b;
    --card-shadow: rgba(245, 158, 11, 0.2);
    --card-icon-bg: rgba(245, 158, 11, 0.1);
    --card-icon-color: #f59e0b;
  }

  .students-card,
  .classes-count-card {
    --card-gradient-from: #8b5cf6;
    --card-gradient-to: #7c3aed;
    --card-border-hover: #8b5cf6;
    --card-shadow: rgba(139, 92, 246, 0.2);
    --card-icon-bg: rgba(139, 92, 246, 0.1);
    --card-icon-color: #8b5cf6;
  }

  .time-card {
    --card-gradient-from: #06b6d4;
    --card-gradient-to: #0891b2;
    --card-border-hover: #06b6d4;
    --card-shadow: rgba(6, 182, 212, 0.2);
    --card-icon-bg: rgba(6, 182, 212, 0.1);
    --card-icon-color: #06b6d4;
  }

  .update-card,
  .teachers-count-card {
    --card-gradient-from: #ec4899;
    --card-gradient-to: #db2777;
    --card-border-hover: #ec4899;
    --card-shadow: rgba(236, 72, 153, 0.2);
    --card-icon-bg: rgba(236, 72, 153, 0.1);
    --card-icon-color: #ec4899;
  }

  .description-content {
    padding: 8px 0;

    p {
      margin: 0;
      color: $text-secondary;
      font-size: 15px;
      line-height: 1.8;
      white-space: pre-wrap;
    }

    .no-description {
      color: $text-quaternary;
      font-style: italic;
    }
  }

  .classes-list {
    display: grid;
    gap: 20px;

    .class-item {
      background: $bg-secondary;
      border: 1px solid $border-card;
      border-radius: $border-radius-card;
      padding: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      .class-header {
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid $border-light;
      }

      .class-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .class-title {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: $text-primary;
      }

      .class-body {
        margin-bottom: 20px;

        .class-description {
          margin: 0 0 20px 0;
          color: $text-secondary;
          font-size: 15px;
          line-height: 1.7;
          padding: 16px;
          background: $bg-secondary;
          border-radius: 12px;
          border: 1px solid $border-card;
          border-left: 4px solid $color-primary;

          &.no-description {
            color: $text-quaternary;
            font-style: italic;
            background: $bg-tertiary;
            border: 1px solid $border-card;
          }
        }

        .class-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 16px;
          background: $bg-secondary;
          border-radius: 12px;
          border: 1px solid $border-card;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: $text-secondary;
            font-size: 14px;
            font-weight: 500;
            padding: 8px 12px;
            background: #fff;
            border-radius: 8px;
            transition: all 0.2s ease;

            :deep(.el-icon) {
              font-size: 16px;
              color: $color-primary;
              flex-shrink: 0;
            }
          }
        }
      }

      .class-footer {
        display: flex;
        gap: 12px;
        padding-top: 20px;
        border-top: 1px solid $border-card;
        justify-content: flex-end;

        .el-button {
          border-radius: 10px;
          font-weight: 600;
          padding: 10px 20px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: $shadow-default;
          }

          :deep(.el-icon) {
            margin-right: 6px;
          }
        }
      }
    }
  }

  .form-tip {
    margin-top: 8px;
    font-size: 12px;
    color: $text-tertiary;
    line-height: 1.5;
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

      .teacher-avatar {
        flex-shrink: 0;
      }

      .teacher-info {
        flex: 1;
        min-width: 0;

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
      }

      .teacher-actions {
        flex-shrink: 0;
      }
    }
  }

  .teacher-search {
    margin-bottom: 20px;
  }

  .search-loading {
    padding: 20px;
  }

  .available-teachers {
    max-height: 400px;
    overflow-y: auto;
  }

  .teachers-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .teacher-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid $border-card;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fff;

    &.selected {
      border-color: $color-primary;
      background: #eff6ff;
    }

    &.is-added {
      border-color: $border-card;
      background: $bg-tertiary;
      cursor: not-allowed;
      opacity: 0.7;

      &:hover {
        border-color: $border-card;
        background: $bg-tertiary;
      }
    }

    .teacher-card-info {
      flex: 1;
      min-width: 0;

      h5 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
        color: $text-primary;
      }

      p {
        margin: 0 0 4px 0;
        font-size: 12px;
        color: $text-tertiary;
      }

      span {
        font-size: 11px;
        color: $text-quaternary;
      }
    }
  }

  .teacher-selection-container {
    background: #fafbfc;
    border: 1px solid $border-default;
    border-radius: $border-radius-card;
    padding: 20px;
    margin-top: 8px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid $border-default;

    .section-icon {
      font-size: 18px;
      color: $color-primary;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
    }
  }

  .selected-teachers-section {
    margin-bottom: 24px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 16px;

    .selected-teachers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;

      .selected-teacher-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #fff;
        border: 1px solid #e0f2fe;
        border-radius: 8px;
        transition: all 0.2s ease;

        &:hover {
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
          border-color: $color-primary;
        }

        .teacher-avatar-small {
          flex-shrink: 0;
        }

        .teacher-basic-info {
          flex: 1;
          min-width: 0;

          .teacher-name {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: $text-primary;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .teacher-email {
            display: block;
            font-size: 12px;
            color: $text-tertiary;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .remove-teacher-btn {
          flex-shrink: 0;
          opacity: 0.7;
          transition: opacity 0.2s ease;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }

  .teacher-search-section {
    margin-bottom: 20px;

    .search-input-wrapper {
      margin-top: 8px;
    }

    .teacher-search-input {
      border-radius: 8px;

      :deep(.el-input__wrapper) {
        border-radius: 8px;
        box-shadow: $shadow-light;
        transition: all 0.2s ease;
      }
      :deep(.el-input__wrapper:hover) {
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
      }
      :deep(.el-input__wrapper.is-focus) {
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
    }

    .search-icon {
      color: $text-tertiary;
    }
  }

  .search-results-section {
    min-height: 60px;
    max-height: 200px;
  }

  .search-loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
    background: $bg-secondary;
    border: 1px dashed $border-default;
    border-radius: 8px;

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .loading-icon {
      font-size: 24px;
      color: $color-primary;
    }

    .loading-text {
      font-size: 14px;
      color: $text-tertiary;
    }
  }

  .available-teachers-container {
    background: #fff;
    border: 1px solid $border-default;
    border-radius: 8px;
    overflow: hidden;

    .results-header {
      padding: 12px 16px;
      background: $bg-secondary;
      border-bottom: 1px solid $border-default;
    }

    .results-count {
      font-size: 13px;
      font-weight: 500;
      color: $text-tertiary;
    }

    .teachers-results-list {
      max-height: 160px;
      overflow-y: auto;
      padding: 4px;
      scrollbar-width: thin;
      scrollbar-color: $border-default $bg-tertiary;

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
        background: #94a3b8;
      }
    }
  }

  .teacher-result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    margin-bottom: 2px;
    border: 1px solid $border-card;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #fff;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      border-color: $color-primary;
      background: $bg-secondary;
      transform: translateX(2px);
    }

    &.is-selected {
      border-color: #67c23a;
      background: #f0f9ff;
    }

    .teacher-avatar-small {
      flex-shrink: 0;
    }

    .teacher-info-compact {
      flex: 1;
      min-width: 0;

      .teacher-name-line {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 2px;

        .teacher-name {
          font-size: 14px;
          font-weight: 600;
          color: $text-primary;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .teacher-email {
          font-size: 12px;
          color: $text-tertiary;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
      }

      .teacher-tags-line {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
    }

    .selection-indicator {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    }

    .selected-icon,
    .unselected-icon {
      font-size: 20px;
      transition: all 0.2s ease;
    }
  }

  .teacher-result-card:hover .unselected-icon {
    color: $color-primary;
    transform: scale(1.1);
  }

  .no-results-state,
  .initial-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;
    background: $bg-secondary;
    border: 1px dashed $border-default;
    border-radius: 8px;

    .no-results-content,
    .initial-content {
      text-align: center;
      max-width: 280px;
    }

    .no-results-icon,
    .initial-icon {
      font-size: 48px;
      color: $border-default;
    }

    .no-results-title,
    .initial-title {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: $text-tertiary;
    }

    .no-results-desc,
    .initial-desc {
      margin: 0;
      font-size: 14px;
      color: $text-quaternary;
      line-height: 1.2;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
