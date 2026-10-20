<!-- AI 出题工作台：教师设置教学要求、审阅沙箱验证结果，并按题目确认入库范围。 -->
<template>
  <div class="generation-page">
    <header class="page-heading">
      <div><span class="eyebrow">教师工具 / 编程题</span><h1>AI 出题工作台</h1><p>从知识点到可运行的编程题，审阅通过后再加入题库。</p></div>
      <el-button @click="router.push('/problems')">返回题库</el-button>
    </header>
    <div class="workspace">
      <section class="requirements panel" aria-labelledby="requirements-title">
        <h2 id="requirements-title">出题要求</h2>
        <el-form label-position="top" :disabled="running || saving" @submit.prevent="startGeneration">
          <el-form-item label="知识点（必填）">
            <el-input v-model="topics" type="textarea" :rows="2" maxlength="300" placeholder="例如：数组、循环、前缀和" />
            <span class="field-note">多个知识点用逗号、顿号或换行分隔。</span>
          </el-form-item>
          <div class="form-row">
            <el-form-item label="难度"><el-select v-model="form.difficulty"><el-option label="简单" value="easy" /><el-option label="中等" value="medium" /><el-option label="困难" value="hard" /></el-select></el-form-item>
            <el-form-item label="标准答案语言"><el-select v-model="form.standard_language"><el-option label="Python" value="python" /><el-option label="C++" value="cpp" /><el-option label="Java" value="java" /></el-select></el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="题目数量"><el-input-number v-model="form.count" :min="1" :max="10" :precision="0" /></el-form-item>
            <el-form-item label="每题测试用例"><el-input-number v-model="form.testcase_count" :min="1" :max="10" :precision="0" /></el-form-item>
          </div>
          <el-form-item label="补充要求"><el-input v-model="form.additional_requirements" type="textarea" :rows="4" maxlength="2000" show-word-limit placeholder="例如：适合大一学生，以校园生活为背景，包含边界测试。" /></el-form-item>
          <el-button class="generate-button" type="primary" native-type="submit" :loading="running">{{ running ? '正在生成与验证' : '生成编程题' }}</el-button>
        </el-form>
        <el-button v-if="running" class="stop-button" @click="cancelGeneration">停止生成</el-button>
        <p class="field-note">生成可能需要几分钟。题目、答案和测试用例均需审阅后再使用。</p>
      </section>
      <div class="review-column">
        <section class="panel progress-panel" aria-label="生成进度">
          <div class="section-heading"><h2>生成进度</h2><span class="status-text" role="status" aria-live="polite">{{ statusText }}</span></div>
          <ol class="stage-track">
            <li v-for="(stage, index) in stages" :key="stage.key" :class="{ active: activeStage === index && running, complete: completedStages.includes(stage.key) }">
              <span class="stage-number">{{ completedStages.includes(stage.key) ? '✓' : index + 1 }}</span><span>{{ stage.label }}</span>
            </li>
          </ol>
          <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
        </section>
        <section v-if="!problems.length" class="panel empty-state">
          <span class="code-mark">{ … }</span><h2>{{ running ? '正在准备题目' : '下一道练习，从这里开始' }}</h2>
          <p>{{ running ? '完成每个阶段后，进度会自动更新，请保持页面打开。' : '填写左侧要求，AI 会生成题面、标准答案和测试用例，并在沙箱中验证。' }}</p>
        </section>
        <template v-else>
          <div class="review-heading"><h2>题目审阅 <span>{{ problems.length }} 道</span></h2><span>仅验证通过的题目可选择保存</span></div>
          <article v-for="(problem, index) in problems" :key="problem.id" class="panel problem-card">
            <div class="problem-heading">
              <el-checkbox v-model="choices[problem.id]!.selected" :disabled="!canSelect(problem) || saving" :aria-label="`选择${problem.title}`" />
              <div class="problem-title"><span class="eyebrow">题目 {{ String(index + 1).padStart(2, '0') }} / {{ difficultyLabel(problem.difficulty) }}</span><h3>{{ problem.title }}</h3></div>
              <el-tag :type="problem.verification?.passed ? 'success' : problem.verification ? 'danger' : 'info'">{{ problem.verification?.passed ? '验证通过' : problem.verification ? '验证未通过' : '等待验证' }}</el-tag>
            </div>
            <el-alert v-if="problem.verification && !problem.verification.passed" :title="problem.verification.message" type="warning" :closable="false" show-icon />
            <el-tabs>
              <el-tab-pane label="题目内容"><div class="problem-text">{{ problem.description }}</div><h4>输入格式</h4><div class="problem-text">{{ problem.input_format }}</div><h4>输出格式</h4><div class="problem-text">{{ problem.output_format }}</div><template v-if="problem.hint"><h4>提示</h4><div class="problem-text">{{ problem.hint }}</div></template></el-tab-pane>
              <el-tab-pane label="标准答案"><p class="field-note">语言：{{ problem.language || form.standard_language }}</p><pre class="code-block">{{ problem.standard_code || '正在生成标准答案…' }}</pre></el-tab-pane>
              <el-tab-pane :label="`测试用例（${problem.test_cases?.length || 0}）`"><div v-for="(testCase, i) in problem.test_cases" :key="i" class="test-case"><h4>用例 {{ i + 1 }} <el-tag v-if="testCase.is_sample" size="small">示例</el-tag></h4><div class="test-grid"><div><span class="field-note">输入</span><pre>{{ testCase.input || '（空输入）' }}</pre></div><div><span class="field-note">期望输出</span><pre>{{ testCase.expected_output }}</pre></div></div></div></el-tab-pane>
            </el-tabs>
            <div v-if="choices[problem.id]!.savedId" class="saved-result">已保存到题库 <router-link :to="`/problems/${choices[problem.id]!.savedId}`">查看题目 →</router-link></div>
            <div v-else class="save-options">
              <el-checkbox v-model="choices[problem.id]!.isPublic" :disabled="running || saving">公开到首页题库</el-checkbox>
              <el-select v-model="choices[problem.id]!.courseIds" multiple filterable clearable placeholder="关联课程（可多选）" :disabled="running || saving" :loading="coursesLoading" :aria-label="`${problem.title}关联课程`"><el-option v-for="course in courses" :key="course.id" :label="course.name || course.title" :value="course.id" /></el-select>
              <span class="field-note">至少选择公开或关联一个课程。</span>
              <el-alert v-if="choices[problem.id]!.saveError" :title="choices[problem.id]!.saveError" type="error" :closable="false" />
            </div>
          </article>
          <el-alert v-if="courseError" type="warning" :closable="false"><template #title>{{ courseError }} <el-button link type="primary" @click="loadCourses">重新加载</el-button></template></el-alert>
          <footer v-if="draftId" class="panel save-bar"><div><strong>已选 {{ selectedProblems.length }} 道</strong><p>确认内容和公开范围后，保存到正式题库。</p></div><el-button type="primary" :loading="saving" :disabled="running || !selectedProblems.length" @click="saveSelection">保存选中题目</el-button></footer>
          <el-alert v-if="saveMessage" :title="saveMessage" type="success" :closable="false" show-icon />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { generateProblems, saveGeneratedProblems, queryGenerationCourses } from '@/api/aiGeneration'

import { useUserStore } from '@/stores/user'
import type { Course } from '@/types/course'
import type { GeneratedProblem, GenerationEvent, GenerationRequest, Verification } from '@/types/aiGeneration'

const router = useRouter()
const userStore = useUserStore()
const topics = ref('')
const form = reactive<Omit<GenerationRequest, 'knowledge_points'>>({ difficulty: 'easy', count: 1, testcase_count: 3, standard_language: 'python', additional_requirements: '' })
const running = ref(false)
const saving = ref(false)
const error = ref('')
const saveMessage = ref('')
const statusText = ref('等待开始')
const activeStage = ref(-1)
const completedStages = ref<string[]>([])
const stages = [{ key: 'generating', label: '生成题目' }, { key: 'codegen', label: '标准答案' }, { key: 'testcase', label: '测试用例' }, { key: 'verifying', label: '沙箱验证' }]
const problems = ref<GeneratedProblem[]>([])
const draftId = ref('')
const choices = reactive<Record<string, { selected: boolean; isPublic: boolean; courseIds: string[]; savedId: string; saveError: string }>>({})
const courses = ref<Course[]>([])
const coursesLoading = ref(false)
const courseError = ref('')
let controller: AbortController | undefined
const selectedProblems = computed(() => problems.value.filter(problem => choices[problem.id]?.selected && canSelect(problem)))
const hasUnsaved = computed(() => Boolean(draftId.value && problems.value.some(problem => !choices[problem.id]?.savedId)))
const difficultyLabel = (difficulty: string) => ({ easy: '简单', medium: '中等', hard: '困难' }[difficulty] || difficulty)
const canSelect = (problem: GeneratedProblem) => !running.value && Boolean(draftId.value && problem.verification?.passed && !choices[problem.id]?.savedId)

function upsertProblem(problem: GeneratedProblem) {
  if (!problem.id) throw new Error('收到的题目缺少标识，请重试或检查后端版本')
  const existing = problems.value.find(item => item.id === problem.id)
  if (existing) Object.assign(existing, problem)
  else problems.value.push(problem)
  choices[problem.id] ||= { selected: false, isPublic: false, courseIds: [], savedId: '', saveError: '' }
}

// 按服务端事件合并同一题的阶段结果，只有草稿落库成功后才允许正式保存。
function receiveEvent(event: GenerationEvent) {
  const data = event.data || {}
  if (event.type === 'stage_started') {
    activeStage.value = stages.findIndex(stage => stage.key === data.stage)
    statusText.value = stages[activeStage.value]?.label || '正在生成'
  } else if (event.type === 'stage_complete') {
    completedStages.value.push(String(data.stage))
  } else if (event.type === 'question_generated') {
    upsertProblem(data as unknown as GeneratedProblem)
  } else if (event.type === 'waiting_confirmation') {
    for (const problem of (data.questions || []) as GeneratedProblem[]) upsertProblem(problem)
    draftId.value = String(data.draft_id || '')
    if (!draftId.value) throw new Error(String(data.draft_error || '草稿保存失败，请重新生成'))
    for (const problem of problems.value) choices[problem.id]!.selected = Boolean(problem.verification?.passed)
    statusText.value = '生成完成，请审阅题目'
  } else {
    const problem = problems.value.find(item => item.id === data.id)
    if (!problem) return
    if (event.type === 'standard_code_generated') {
      problem.standard_code = String(data.code || '')
      problem.language = String(data.language || form.standard_language)
    } else if (event.type === 'testcase_generated') {
      problem.test_cases = data.test_cases as GeneratedProblem['test_cases']
    } else if (event.type === 'verification_completed') {
      problem.verification = data as unknown as Verification
    }
  }
}

async function startGeneration() {
  if (running.value || saving.value) return
  const knowledgePoints = [...new Set(topics.value.split(/[,，、;；\n]+/).map(item => item.trim()).filter(Boolean))]
  if (!knowledgePoints.length) return void ElMessage.warning('请填写至少一个知识点')
  if (hasUnsaved.value) {
    const confirmed = await ElMessageBox.confirm('重新生成会清空当前未保存的题目，是否继续？', '重新生成', { type: 'warning' }).then(() => true).catch(() => false)
    if (!confirmed) return
  }
  problems.value = []
  Object.keys(choices).forEach(key => delete choices[key])
  draftId.value = ''
  error.value = ''
  saveMessage.value = ''
  completedStages.value = []
  activeStage.value = -1
  statusText.value = '正在连接生成服务'
  running.value = true
  controller = new AbortController()
  try {
    await generateProblems({ ...form, knowledge_points: knowledgePoints }, controller.signal, receiveEvent)
    if (!draftId.value) throw new Error('生成连接已结束，但未收到完整草稿，请重试')
  } catch (cause) {
    if (controller.signal.aborted) {
      statusText.value = '已停止生成'
      error.value = '生成已停止，未完成的题目不能保存。'
    } else {
      error.value = cause instanceof Error ? cause.message : '生成失败，请重试'
      statusText.value = '生成未完成'
    }
  } finally {
    running.value = false
    controller = undefined
  }
}

function cancelGeneration() { controller?.abort() }

async function loadCourses() {
  coursesLoading.value = true
  courseError.value = ''
  try {
    const list = new Map<string, Course>()
    const paths: ('/courses' | '/courses/teaching')[] = userStore.user?.role === 'teacher' ? ['/courses', '/courses/teaching'] : ['/courses']
    // 合并创建和参与教学的课程；后端仍对每次保存检查实际管理权限。
    for (const path of paths) {
      let loaded = 0
      for (let page = 1; ; page++) {
        const result = await queryGenerationCourses(path, page)
        const batch = result.courses || []
        for (const course of batch) list.set(course.id, course)
        loaded += batch.length
        if (!batch.length || loaded >= result.total) break
      }
    }
    courses.value = [...list.values()]
  } catch {
    courseError.value = '课程加载失败，可重试或选择公开到首页题库。'
  } finally { coursesLoading.value = false }
}

async function saveSelection() {
  if (saving.value || running.value || !draftId.value || !selectedProblems.value.length) return
  const selection = [...selectedProblems.value]
  if (selection.some(problem => !choices[problem.id]!.isPublic && !choices[problem.id]!.courseIds.length)) {
    return void ElMessage.warning('请为每道选中题目选择公开到首页，或关联至少一个课程')
  }
  saving.value = true
  error.value = ''
  saveMessage.value = ''
  try {
    const response = await saveGeneratedProblems(draftId.value, selection.map(problem => ({ generated_problem_id: problem.id, is_public: choices[problem.id]!.isPublic, course_ids: choices[problem.id]!.courseIds })))
    for (const result of response.results) {
      const choice = choices[result.generated_problem_id]
      if (!choice) continue
      choice.saveError = result.error || ''
      if (result.success) { choice.savedId = result.problem_id || ''; choice.selected = false }
    }
    if (response.saved_count) saveMessage.value = `已保存 ${response.saved_count} 道题目到正式题库。`
    if (response.failed_count) error.value = `${response.failed_count} 道题目未保存，请查看对应错误后重试。`
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '保存失败，请重试'
  } finally { saving.value = false }
}

// 离开或刷新前提示未完成任务，避免用户在长时间生成或审阅时丢失工作。
function beforeUnload(event: BeforeUnloadEvent) {
  if (running.value || saving.value || hasUnsaved.value) { event.preventDefault(); event.returnValue = '' }
}
onBeforeRouteLeave(async () => {
  if (saving.value) { ElMessage.warning('正在保存，请稍候'); return false }
  if (!running.value && !hasUnsaved.value) return true
  return ElMessageBox.confirm('离开会停止生成并丢失当前未保存的题目，是否继续？', '离开出题工作台', { type: 'warning' }).then(() => true).catch(() => false)
})
onMounted(() => { void loadCourses(); window.addEventListener('beforeunload', beforeUnload) })
onBeforeUnmount(() => { controller?.abort(); window.removeEventListener('beforeunload', beforeUnload) })
</script>

<style scoped>
.generation-page { --accent: #008b7a; --ink: #223c3a; --muted: #6b7f7c; --line: #dce7e4; max-width: 1320px; margin: auto; padding: 32px 24px 64px; color: var(--ink); font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif; }
.page-heading, .section-heading, .problem-heading, .review-heading, .save-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.page-heading { margin-bottom: 28px; }
.eyebrow { color: var(--accent); font-size: 12px; letter-spacing: .06em; }
h1 { font-size: 28px; margin: 10px 0; letter-spacing: -.04em; }
h2 { font-size: 17px; margin: 0 0 20px; }
h3 { font-size: 20px; margin: 6px 0 0; }
h4 { font-size: 14px; margin: 20px 0 8px; }
p { color: var(--muted); line-height: 1.7; margin: 0; }
.workspace { display: grid; grid-template-columns: 340px minmax(0, 1fr); align-items: start; gap: 24px; }
.panel { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 24px; }
.requirements { border-top: 4px solid var(--accent); position: sticky; top: 24px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-row :deep(.el-input-number), .form-row :deep(.el-select) { width: 100%; }
.field-note { color: var(--muted); font-size: 12px; line-height: 1.7; }
.generate-button { width: 100%; min-height: 42px; margin-bottom: 12px; }
.stop-button { width: 100%; margin: 0 0 12px; }
.review-column { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.section-heading h2 { margin: 0; }
.status-text { font-size: 12px; color: var(--accent); }
.stage-track { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); padding: 0; margin: 24px 0 4px; }
.stage-track li { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); border-top: 2px solid var(--line); padding: 14px 0; }
.stage-track li.active, .stage-track li.complete { border-color: var(--accent); color: var(--accent); }
.stage-number { display: inline-flex; width: 24px; height: 24px; justify-content: center; align-items: center; border: 1px solid currentColor; border-radius: 50%; font-family: Consolas, monospace; }
.stage-track .active .stage-number { background: var(--accent); color: white; }
.empty-state { text-align: center; padding: 64px 24px; background: #f6faf8; }
.code-mark { font: 52px Consolas, monospace; color: var(--accent); display: block; margin-bottom: 20px; }
.empty-state p { max-width: 400px; margin: auto; font-size: 14px; }
.review-heading h2 { margin: 0; }
.review-heading span { font-size: 12px; font-weight: 400; color: var(--muted); }
.problem-heading { justify-content: flex-start; margin-bottom: 16px; }
.problem-title { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.problem-text { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14px; line-height: 1.85; }
.code-block { background: #f1f6f4; border-left: 3px solid var(--accent); padding: 18px; max-height: 420px; }
pre { overflow: auto; font: 13px/1.7 Consolas, monospace; tab-size: 4; }
.test-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.test-grid > div { background: #f6f8f7; padding: 12px; min-width: 0; border-radius: 6px; }
.save-options { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; border-top: 1px solid var(--line); padding-top: 16px; margin-top: 16px; }
.save-options .el-select { flex: 1; min-width: 220px; }
.save-options > .field-note { flex-basis: 100%; }
.save-bar { position: sticky; bottom: 20px; box-shadow: 0 8px 30px #223c3a12; border-color: #a6cfc4; z-index: 2; }
.save-bar p { font-size: 12px; margin-top: 4px; }
.saved-result { color: var(--accent); padding-top: 16px; }
.saved-result a { color: var(--accent); margin-left: 16px; }
@media (max-width: 1000px) { .workspace { grid-template-columns: 290px minmax(0, 1fr); gap: 16px; } .panel { padding: 18px; } .stage-track li { flex-direction: column; align-items: flex-start; } }
@media (max-width: 760px) { .generation-page { padding: 24px 12px 40px; } .workspace { grid-template-columns: 1fr; } .requirements { position: static; } .page-heading { align-items: flex-start; } h1 { font-size: 24px; } .problem-heading { flex-wrap: wrap; } .test-grid { grid-template-columns: 1fr; } .save-bar { bottom: 8px; flex-wrap: wrap; } }
</style>
