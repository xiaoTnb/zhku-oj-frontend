<template>
  <div class="editor-toolbar">
    <div class="toolbar-left">
      <el-select 
        :model-value="selectedLanguage"
        @update:model-value="$emit('update:selectedLanguage', $event)"
        size="default"
        style="width: 160px"
      >
        <el-option label="Java" value="Java"></el-option>
      </el-select>
      
      <el-button-group class="editor-actions">
        <el-button @click="$emit('reset')" size="default">
          <el-icon><Refresh /></el-icon>
          重置代码
        </el-button>
        <el-button @click="$emit('run')" type="success" size="default" :loading="running">
          <el-icon><VideoPlay /></el-icon>
          运行
        </el-button>
        <el-button @click="$emit('submit')" type="primary" size="default" :loading="submitting">
          <el-icon><Upload /></el-icon>
          提交
        </el-button>
      </el-button-group>

      <div class="timer-wrapper">
        <el-icon class="timer-icon"><Timer /></el-icon>
        <span class="timer-display">{{ formattedTime }}</span>
        <el-button-group size="small">
          <el-button 
            @click="toggleTimer" 
            :type="isTimerRunning ? 'warning' : 'success'" 
            :title="isTimerRunning ? '暂停' : '开始'"
          >
            <el-icon><component :is="isTimerRunning ? VideoPause : VideoPlay" /></el-icon>
          </el-button>
          <el-button @click="resetTimer" title="重置计时" type="info">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <div class="toolbar-right">
      <el-button @click="$emit('toggleTheme')" size="default">
        <el-icon><Sunny v-if="isDarkTheme" /><Moon v-else /></el-icon>
        {{ isDarkTheme ? '浅色' : '深色' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { Refresh, VideoPlay, Upload, Sunny, Moon, VideoPause, Timer } from '@element-plus/icons-vue'

// Timer Logic
const time = ref(0)
const isTimerRunning = ref(false)
let timerInterval: any = null

const formattedTime = computed(() => {
  const minutes = Math.floor(time.value / 60)
  const seconds = time.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const toggleTimer = () => {
  if (isTimerRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  if (timerInterval) return
  isTimerRunning.value = true
  timerInterval = setInterval(() => {
    time.value++
  }, 1000)
}

const pauseTimer = () => {
  isTimerRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const resetTimer = () => {
  pauseTimer()
  time.value = 0
}

onUnmounted(() => {
  pauseTimer()
})

interface Props {
  selectedLanguage: string
  running: boolean
  submitting: boolean
  isDarkTheme: boolean
}

defineProps<Props>()

defineEmits<{
  'update:selectedLanguage': [value: string]
  reset: []
  run: []
  submit: []
  toggleTheme: []
}>()
</script>

<style scoped lang="scss">
.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid $border-default;
  background: $bg-secondary;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .editor-actions {
      display: flex;
      gap: 8px;
    }

    .timer-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 16px;
      margin-right: 20px;
      padding: 4px 12px;
      background: var(--el-bg-color);
      border-radius: 4px;
      border: 1px solid var(--el-border-color-lighter);
      
      .timer-icon {
        color: var(--el-text-color-secondary);
        font-size: 16px;
      }

      .timer-display {
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
        font-variant-numeric: tabular-nums;
        font-weight: 500;
        color: var(--el-text-color-primary);
        min-width: 48px;
        text-align: center;
        font-size: 16px;
        letter-spacing: 0.5px;
      }
    }
  }

  .toolbar-right {
    display: flex;
    align-items: center;
  }
}
</style>
