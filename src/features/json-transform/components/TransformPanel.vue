<template>
  <div class="transform-panel">
    <div class="transform-toolbar">
      <div class="format-chips">
        <button 
          v-for="fmt in formats" 
          :key="fmt"
          class="format-chip"
          :class="{ active: targetFormat === fmt }"
          @click="targetFormat = fmt"
        >
          {{ fmt.toUpperCase() }}
        </button>
      </div>

      <div class="action-buttons">
        <button class="action-btn" @click="copyToClipboard" title="Copy to Clipboard">
          <Copy :size="14" />
          <span>Copy</span>
        </button>
        <button class="action-btn" @click="downloadFile" title="Download as File">
          <Download :size="14" />
          <span>Download</span>
        </button>
      </div>
    </div>

    <div v-if="error" class="error-msg">
      <AlertCircle :size="16" />
      <span>{{ error }}</span>
    </div>

    <div class="transform-body">
      <JsonEditor 
        v-model="transformedContent" 
        :readonly="true" 
        :language="monacoLanguage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Copy, Download } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import JsonEditor from '../../editor/components/JsonEditor.vue'
import type { TargetFormat } from '../types'
import { transformJson } from '../utils/transform-logic'

const props = defineProps<{
  data: string
}>()

const formats: TargetFormat[] = ['yaml', 'csv']
const targetFormat = ref<TargetFormat>('yaml')
const transformedContent = ref('')
const error = ref<string | null>(null)

const monacoLanguage = computed(() => {
  if (targetFormat.value === 'yaml') return 'yaml'
  if (targetFormat.value === 'csv') return 'plaintext' // Monaco doesn't have native CSV
  return 'plaintext'
})

const doTransform = async () => {
  if (!props.data) {
    transformedContent.value = ''
    return
  }

  try {
    const jsonData = JSON.parse(props.data)
    const result = await transformJson(jsonData, targetFormat.value)
    
    if (result.error) {
      error.value = result.error
      transformedContent.value = ''
    } else {
      error.value = null
      transformedContent.value = result.content
    }
  } catch (e) {
    error.value = 'Invalid Source JSON'
    transformedContent.value = ''
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(transformedContent.value)
    alert('Copied to clipboard!')
  } catch (err) {
    alert('Failed to copy')
  }
}

const downloadFile = () => {
  const blob = new Blob([transformedContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transformed.${targetFormat.value}`
  a.click()
  URL.revokeObjectURL(url)
}

watch([() => props.data, targetFormat], () => {
  doTransform()
})

onMounted(doTransform)
</script>

<style scoped>
.transform-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.transform-toolbar {
  padding: 0.75rem 1rem;
  background-color: var(--bg-sidebar);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.format-chips {
  display: flex;
  gap: 0.5rem;
}

.format-chip {
  background-color: var(--bg-app);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.format-chip:hover {
  border-color: var(--zinc-600);
}

.format-chip.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: white;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
}

.action-btn:hover {
  background-color: var(--bg-hover);
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.8rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
}

.transform-body {
  flex: 1;
  overflow: hidden;
}
</style>
