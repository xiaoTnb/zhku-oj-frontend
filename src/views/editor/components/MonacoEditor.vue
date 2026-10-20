<template>
  <div class="monaco-container">
    <div ref="editorContainer" class="monaco-editor"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'

interface Props {
  value: string
  language: string
  theme: string
  options?: monaco.editor.IStandaloneEditorConstructionOptions
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({})
})

const emit = defineEmits<{
  'update:value': [value: string]
  change: [value: string]
  ready: [editor: monaco.editor.IStandaloneCodeEditor]
}>()

const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 语言映射表，将我们的语言标识符映射到Monaco Editor支持的语言
const languageMap: Record<string, string> = {
  'JavaScript': 'javascript',
  'Python': 'python',
  'Java': 'java',
  'C++': 'cpp',
  'C': 'c',
  'TypeScript': 'typescript',
  'Go': 'go',
  'Rust': 'rust',
  'PHP': 'php',
  'Ruby': 'ruby',
  'C#': 'csharp',
  'Swift': 'swift',
  'Kotlin': 'kotlin',
  'Scala': 'scala',
  'Perl': 'perl',
  'R': 'r',
  'MATLAB': 'matlab',
  'Shell': 'shell',
  // 添加小写版本的映射
  'javascript': 'javascript',
  'python': 'python',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'typescript': 'typescript',
  'go': 'go',
  'rust': 'rust',
  'php': 'php',
  'ruby': 'ruby',
  'csharp': 'csharp',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'scala': 'scala',
  'perl': 'perl',
  'r': 'r',
  'matlab': 'matlab',
  'shell': 'shell'
}

// 获取Monaco Editor支持的语言标识符
const getMonacoLanguage = (language: string): string => {
  return languageMap[language] || language
}

const defaultOptions = {
  fontSize: 14,
  lineNumbers: 'on' as const,
  minimap: { enabled: false },
  automaticLayout: true,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  suggestOnTriggerCharacters: true,
  quickSuggestions: {
    other: true,
    comments: true,
    strings: true
  },
  folding: true,
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 3,
  glyphMargin: false,
  // 确保语法高亮功能启用
  colorDecorators: true,
  semanticHighlighting: {
    enabled: true
  },
  // 启用代码提示
  parameterHints: {
    enabled: true
  },
  // 启用代码格式化
  formatOnPaste: true,
  formatOnType: true
}

const initEditor = async () => {
  await nextTick()
  if (editorContainer.value) {
    const editorOptions = {
      value: props.value,
      language: getMonacoLanguage(props.language),
      theme: props.theme,
      ...defaultOptions,
      ...props.options
    }

    editor = monaco.editor.create(editorContainer.value, editorOptions)

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      if (editor) {
        const value = editor.getValue()
        emit('update:value', value)
        emit('change', value)
      }
    })

    emit('ready', editor)
  }
}

// 监听语言变化
watch(() => props.language, (newLanguage) => {
  if (editor) {
    const monacoLanguage = getMonacoLanguage(newLanguage)
    monaco.editor.setModelLanguage(editor.getModel()!, monacoLanguage)
  }
})

// 监听主题变化
watch(() => props.theme, (newTheme) => {
  if (editor) {
    monaco.editor.setTheme(newTheme)
  }
})

// 监听值变化（外部更新）
watch(() => props.value, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    editor.setValue(newValue || '')
  }
})

// 暴露编辑器实例方法
const getValue = () => {
  return editor?.getValue() || ''
}

const setValue = (value: string) => {
  if (editor) {
    editor.setValue(value)
  }
}

// 生命周期钩子
onMounted(async () => {
  // 初始化编辑器
  await initEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
  }
})

defineExpose({
  getValue,
  setValue,
  getEditor: () => editor
})
</script>

<style scoped lang="scss">
.monaco-container {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 5px;
  box-sizing: border-box;

  .monaco-editor {
    width: 100%;
    height: 100%;
  }
}
</style>
