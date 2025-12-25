<template>
  <div class="diff-view">
    <!-- Diff Toolbar -->
    <div class="diff-toolbar">
      <div class="toolbar-left">
        <GitCompare :size="16" class="toolbar-icon" />
        <span class="toolbar-title">JSON Diff</span>
        
        <div class="file-selector">
          <div class="file-badge left">
            <FileCode2 :size="12" />
            <span>{{ leftFileName }}</span>
          </div>
          <span class="vs-text">vs</span>
          <div class="file-badge right">
            <select v-model="rightSource" class="source-select">
              <option value="file">File:</option>
              <option value="paste">Pasted</option>
            </select>
            <select 
              v-if="rightSource === 'file'" 
              v-model="selectedFileId" 
              class="file-select"
            >
              <option value="">Select...</option>
              <option 
                v-for="file in otherFiles" 
                :key="file.id" 
                :value="file.id"
              >
                {{ file.name }}
              </option>
            </select>
            <span v-else class="pasted-label">JSON</span>
          </div>
        </div>
      </div>

      <div class="toolbar-right">
        <button class="close-btn" @click="$emit('close')" title="Exit Diff Mode">
          <X :size="16" />
          <span>Close</span>
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-banner">
      <AlertCircle :size="16" />
      <span>{{ error }}</span>
    </div>

    <!-- Main Content Area -->
    <div class="diff-main">
      <!-- No Right Side Selected -->
      <div v-if="!hasRightSide" class="empty-right">
        <div class="empty-content">
          <GitCompare :size="64" class="empty-icon" />
          <h3>Select a file to compare</h3>
          <p>Choose another file from the dropdown above, or paste JSON directly.</p>
          
          <div v-if="rightSource === 'paste'" class="paste-container">
            <textarea 
              v-model="pastedJson"
              placeholder="Paste your JSON here..."
              class="paste-textarea"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Has Comparison -->
      <template v-else>
        <!-- Identical Notice -->
        <div v-if="diffResult && !diffResult.hasDiff" class="identical-banner">
          <CheckCircle :size="18" />
          <span>Both JSON documents are identical</span>
        </div>

        <!-- Side by Side Editors (Top) -->
        <div class="editors-container">
          <!-- Left Editor -->
          <div class="editor-pane">
            <div class="editor-header left-header">
              <FileCode2 :size="14" />
              <span class="filename">{{ leftFileName }}</span>
              <span class="badge original">Original</span>
            </div>
            <div class="editor-body">
              <JsonEditor v-model="leftContent" :readonly="true" />
            </div>
          </div>

          <!-- Divider -->
          <div class="editor-divider"></div>

          <!-- Right Editor -->
          <div class="editor-pane">
            <div class="editor-header right-header">
              <FileCode2 :size="14" />
              <span class="filename">{{ rightFileName }}</span>
              <span class="badge modified">Modified</span>
            </div>
            <div class="editor-body">
              <JsonEditor v-model="rightContent" :readonly="rightSource === 'file'" />
            </div>
          </div>
        </div>

        <!-- Changes Summary (Bottom) -->
        <div v-if="diffResult?.hasDiff" class="changes-panel">
          <div class="changes-header" @click="changesExpanded = !changesExpanded">
            <div class="changes-title">
              <List :size="14" />
              <span>Changes</span>
              <span class="change-count added">+{{ addedCount }}</span>
              <span class="change-count removed">-{{ removedCount }}</span>
              <span v-if="modifiedCount > 0" class="change-count modified">~{{ modifiedCount }}</span>
            </div>
            <button class="expand-btn">
              <ChevronDown :size="16" :class="{ rotated: !changesExpanded }" />
            </button>
          </div>
          <div v-show="changesExpanded" class="changes-body">
            <ul class="changes-list">
              <li 
                v-for="(change, idx) in changeSummary" 
                :key="idx"
                :class="getChangeClass(change)"
              >
                {{ change }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  FileCode2,
  GitCompare,
  List,
  X
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useWorkbenchStore } from '../../../core/stores/workbench'
import JsonEditor from '../../editor/components/JsonEditor.vue'
import type { DiffResult } from '../types'
import { computeDiff, formatDiffSummary } from '../utils/diff-engine'

const props = defineProps<{
  data: string
  fileName: string
}>()

defineEmits<{
  close: []
}>()

const store = useWorkbenchStore()
const { files, activeFileId } = storeToRefs(store)

// State
const rightSource = ref<'file' | 'paste'>('file')
const selectedFileId = ref('')
const pastedJson = ref('')
const changesExpanded = ref(true)
const diffResult = ref<DiffResult | null>(null)
const error = ref<string | null>(null)

// Computed
const leftFileName = computed(() => props.fileName || 'Current File')

const otherFiles = computed(() => {
  return files.value.filter(f => f.id !== activeFileId.value)
})

const hasRightSide = computed(() => {
  if (rightSource.value === 'file') {
    return !!selectedFileId.value
  }
  return pastedJson.value.trim().length > 0
})

const rightFileName = computed(() => {
  if (rightSource.value === 'file') {
    const file = files.value.find(f => f.id === selectedFileId.value)
    return file?.name || 'Selected File'
  }
  return 'Pasted JSON'
})

const leftContent = computed({
  get: () => props.data,
  set: () => {} // Read-only
})

const rightContent = computed({
  get: () => {
    if (rightSource.value === 'file') {
      const file = files.value.find(f => f.id === selectedFileId.value)
      return file?.content || ''
    }
    return pastedJson.value
  },
  set: (value: string) => {
    if (rightSource.value === 'paste') {
      pastedJson.value = value
    }
  }
})

const changeSummary = computed(() => {
  if (!diffResult.value?.delta) return []
  return formatDiffSummary(diffResult.value.delta)
})

const addedCount = computed(() => 
  changeSummary.value.filter(c => c.startsWith('+')).length
)
const removedCount = computed(() => 
  changeSummary.value.filter(c => c.startsWith('-')).length
)
const modifiedCount = computed(() => 
  changeSummary.value.filter(c => c.startsWith('~')).length
)

// Helpers
function getChangeClass(change: string): string {
  if (change.startsWith('+')) return 'added'
  if (change.startsWith('-')) return 'removed'
  if (change.startsWith('~')) return 'modified'
  return ''
}

// Watch and compute diff
watch(
  [() => props.data, rightContent, hasRightSide],
  () => {
    error.value = null
    if (!hasRightSide.value) {
      diffResult.value = null
      return
    }
    
    const result = computeDiff(props.data, rightContent.value)
    if (result.error) {
      error.value = result.error
    }
    diffResult.value = result
  },
  { immediate: true }
)

// Auto-select first file if available
watch(otherFiles, (newFiles) => {
  if (newFiles.length > 0 && !selectedFileId.value) {
    selectedFileId.value = newFiles[0]?.id || ''
  }
}, { immediate: true })
</script>

<style scoped>
.diff-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-app);
}

/* Toolbar */
.diff-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border-subtle);
  gap: 1rem;
  flex-wrap: wrap;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toolbar-icon {
  color: var(--primary);
}

.toolbar-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.file-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid var(--border-subtle);
}

.file-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.file-badge.left {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.file-badge.right {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.vs-text {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 600;
}

.source-select, .file-select {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.source-select:focus, .file-select:focus {
  outline: none;
}

.pasted-label {
  font-size: 0.75rem;
}

.close-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 0.8rem;
}

/* Main Content */
.diff-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Empty State */
.empty-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
  color: var(--text-muted);
  max-width: 400px;
}

.empty-icon {
  opacity: 0.2;
  margin-bottom: 1rem;
}

.empty-content h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.empty-content p {
  margin: 0 0 1.5rem;
  font-size: 0.85rem;
}

.paste-container {
  width: 100%;
}

.paste-textarea {
  width: 100%;
  min-height: 200px;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  padding: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  resize: vertical;
}

.paste-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

/* Identical Banner */
.identical-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(34, 197, 94, 0.1);
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 500;
}

/* Editors Container (Top) */
.editors-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.left-header {
  background: rgba(239, 68, 68, 0.08);
  border-bottom: 2px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.right-header {
  background: rgba(34, 197, 94, 0.08);
  border-bottom: 2px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.filename {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge.original {
  background: rgba(239, 68, 68, 0.2);
}

.badge.modified {
  background: rgba(34, 197, 94, 0.2);
}

.editor-body {
  flex: 1;
  overflow: hidden;
}

.editor-divider {
  width: 1px;
  background: var(--border-subtle);
}

/* Changes Panel (Bottom) */
.changes-panel {
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-sidebar);
  max-height: 35%;
  display: flex;
  flex-direction: column;
}

.changes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  cursor: pointer;
  user-select: none;
}

.changes-header:hover {
  background: var(--bg-hover);
}

.changes-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.change-count {
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 600;
}

.change-count.added {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.change-count.removed {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.change-count.modified {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
}

.expand-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  padding: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.expand-btn svg.rotated {
  transform: rotate(-90deg);
}

.changes-body {
  flex: 1;
  overflow: auto;
  padding: 0.5rem 1rem 1rem;
}

.changes-list {
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
}

.changes-list li {
  padding: 0.3rem 0.5rem;
  border-radius: 3px;
  margin-bottom: 0.2rem;
}

.changes-list li.added {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.changes-list li.removed {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.changes-list li.modified {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
}
</style>
