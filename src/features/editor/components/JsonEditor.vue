<template>
  <div class="editor-container" ref="editorRef"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import '../setup'; // 引入 worker 配置

interface Props {
  modelValue: string
  readonly?: boolean
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  readonly: false,
  language: 'json'
})

const emit = defineEmits(['update:modelValue', 'change'])

const editorRef = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  if (!editorRef.value) return

  // 創建 Monaco 實例
  editor = monaco.editor.create(editorRef.value, {
    value: props.modelValue,
    language: 'json',
    theme: 'vs-dark', // 之後可以封裝成自定義 Zinc 主題
    automaticLayout: true,
    tabSize: 2,
    fontSize: 14,
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    readOnly: props.readonly,
    padding: { top: 16, bottom: 16 },
    fixedOverflowWidgets: true
  })

  // 監聽內容變更
  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || ''
    if (value !== props.modelValue) {
      emit('update:modelValue', value)
      emit('change', value)
    }
  })
})

// 外部 modelValue 變更時同步到編輯器
watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    const position = editor.getPosition()
    editor.setValue(newValue)
    if (position) editor.setPosition(position)
  }
})

// 處理唯讀狀態
watch(() => props.readonly, (newVal) => {
  editor?.updateOptions({ readOnly: newVal })
})

// 處理語言變更
watch(() => props.language, (newLang) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLang || 'json')
    }
  }
})

onBeforeUnmount(() => {
  editor?.dispose()
})

// 導出格式化方法給父組件使用
defineExpose({
  format: () => {
    editor?.getAction('editor.action.formatDocument')?.run()
  }
})
</script>

<style scoped>
.editor-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 覆蓋 Monaco 的預設背景色，使其符合我們的 Zinc-950/900 配色 */
:deep(.monaco-editor),
:deep(.monaco-editor .margin) {
  background-color: var(--bg-app) !important;
}

:deep(.monaco-editor .line-numbers) {
  color: var(--zinc-600);
}

:deep(.monaco-editor .current-line) {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
