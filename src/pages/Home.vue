<script setup lang="ts">
import {
  Clipboard,
  ClipboardPaste,
  FileCode2,
  Minimize2,
  Plus,
  Sparkles,
  X
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import { showToast } from '../core/composables/useToast'
import { useWorkbenchStore } from '../core/stores/workbench'
import { minifyJson } from '../utils/json'

// Lazy load heavy components (Guideline 6.1)
const JsonEditor = defineAsyncComponent(() => 
  import('../features/editor/components/JsonEditor.vue')
)
const DiffPanel = defineAsyncComponent(() => 
  import('../features/json-diff/components/DiffPanel.vue')
)
const QueryPanel = defineAsyncComponent(() => 
  import('../features/json-query/components/QueryPanel.vue')
)
const JsonTable = defineAsyncComponent(() => 
  import('../features/json-table/components/JsonTable.vue')
)
const TransformPanel = defineAsyncComponent(() => 
  import('../features/json-transform/components/TransformPanel.vue')
)
const TreeViewer = defineAsyncComponent(() => 
  import('../features/json-viewer/components/TreeViewer.vue')
)

const store = useWorkbenchStore()
const { files, activeFileId, activeFile, openFiles } = storeToRefs(store)

const editorRef = ref<InstanceType<typeof JsonEditor> | null>(null)
const activeTool = ref<'viewer' | 'table' | 'query' | 'transform' | 'diff'>('viewer')

// Resizer state
const leftPaneWidth = ref(50) // percentage
const isResizing = ref(false)

const handleCreateFile = () => {
  store.createFile(`Untitled-${files.value.length + 1}`)
}

const handleCloseFile = (id: string, event: Event) => {
  event.stopPropagation() // Prevent tab activation
  store.closeFile(id)
}

const setActive = (id: string) => {
  store.setActiveFile(id)
}

// Format logic using Monaco's built-in action
const formatJson = () => {
  if (editorRef.value) {
    editorRef.value.format()
  }
}

// Minify logic using pure utility function (Guideline 1.2)
const handleMinify = () => {
  if (!activeFile.value) return
  const result = minifyJson(activeFile.value.content)
  if (result) {
    activeFile.value.content = result
    showToast('JSON minified successfully', 'success')
  } else {
    showToast('Unable to minify: Invalid JSON format. Please check and try again.', 'error')
  }
}

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text && activeFile.value) {
      activeFile.value.content = text
      showToast('Pasted from clipboard', 'success')
    }
  } catch (err) {
    showToast('Failed to paste: Browser permission denied', 'error')
  }
}

const handleCopy = async () => {
  if (!activeFile.value) return
  try {
    await navigator.clipboard.writeText(activeFile.value.content)
    showToast('Copied to clipboard', 'success')
  } catch (err) {
    showToast('Failed to copy', 'error')
  }
}

// Resizer functionality
const startResize = (e: MouseEvent) => {
  isResizing.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  e.preventDefault()
}

const stopResize = () => {
  if (!isResizing.value) return
  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isResizing.value) return
  
  const workArea = document.querySelector('.work-area') as HTMLElement
  if (!workArea) return
  
  const rect = workArea.getBoundingClientRect()
  const percentage = ((e.clientX - rect.left) / rect.width) * 100
  
  // Clamp between 20% and 80%
  leftPaneWidth.value = Math.min(80, Math.max(20, percentage))
}

const handleMouseUp = () => {
  stopResize()
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="workbench">
    <!-- Browser-like Tabs Header -->
    <div class="workbench-tabs">
      <div 
        v-for="file in openFiles"
        :key="file.id"
        class="tab"
        :class="{ active: file.id === activeFileId }"
        @click="setActive(file.id)"
      >
        <FileCode2 :size="14" class="tab-icon" />
        <span class="tab-name">{{ file.name }}</span>
        <button class="tab-close" data-tooltip="Close tab" @click="handleCloseFile(file.id, $event)">
          <X :size="12" />
        </button>
      </div>
      
      <button class="new-tab-btn" data-tooltip="New scratchpad" @click="handleCreateFile">
        <Plus :size="16" />
      </button>
    </div>

    <!-- FULL-SCREEN DIFF MODE -->
    <div v-if="activeFile && activeTool === 'diff'" class="work-area diff-mode">
      <DiffPanel 
        :data="activeFile.content" 
        :fileName="activeFile.name"
        @close="activeTool = 'viewer'"
      />
    </div>

    <!-- NORMAL MODE: Dual Pane Work Area -->
    <div class="work-area" v-else-if="activeFile">
      
      <!-- LEFT PANE: SOURCE EDITOR -->
      <div class="pane editor-pane" :style="{ width: leftPaneWidth + '%' }">
        <div class="pane-toolbar">
          <div class="toolbar-left">
            <span class="pane-label">SOURCE</span>
            <span class="file-info">
               {{ activeFile.content.length }} bytes • JSON
            </span>
          </div>
          <div class="toolbar-right">
            <button class="icon-btn" data-tooltip="Format JSON" @click="formatJson">
              <Sparkles :size="16" />
            </button>
            <button class="icon-btn" data-tooltip="Minify JSON" @click="handleMinify">
              <Minimize2 :size="16" />
            </button>
            <button class="icon-btn" data-tooltip="Copy to clipboard" @click="handleCopy">
              <Clipboard :size="16" />
            </button>
            <button class="icon-btn" data-tooltip="Paste from clipboard" @click="handlePaste">
              <ClipboardPaste :size="16" />
            </button>
          </div>
        </div>
        <div class="pane-body">
          <JsonEditor 
            ref="editorRef"
            v-model="activeFile.content" 
          />
        </div>
      </div>

      <!-- RESIZER -->
      <div 
        class="resizer" 
        :class="{ active: isResizing }"
        @mousedown="startResize"
      ></div>

      <!-- RIGHT PANE: TOOLS & VIEWER -->
      <div class="pane tools-pane">
        <div class="pane-toolbar">
          <div class="tool-selector">
            <button 
              class="tool-btn" 
              :class="{ active: activeTool === 'viewer' }"
              @click="activeTool = 'viewer'"
            >Viewer</button>
            <button 
              class="tool-btn"
              :class="{ active: activeTool === 'table' }"
              @click="activeTool = 'table'"
            >Table</button>
            <button 
              class="tool-btn"
              :class="{ active: activeTool === 'query' }"
              @click="activeTool = 'query'"
            >Query</button>
            <button 
              class="tool-btn"
              :class="{ active: activeTool === 'transform' }"
              @click="activeTool = 'transform'"
            >Transform</button>
            <button 
              class="tool-btn diff-btn"
              @click="activeTool = 'diff'"
            >Diff</button>
          </div>
        </div>
        <div class="pane-body tool-content">
          <TreeViewer v-if="activeTool === 'viewer'" :data="activeFile.content" />
          <JsonTable v-else-if="activeTool === 'table'" :data="activeFile.content" />
          <QueryPanel v-else-if="activeTool === 'query'" :data="activeFile.content" />
          <TransformPanel v-else-if="activeTool === 'transform'" :data="activeFile.content" />
        </div>
      </div>

    </div>
    
    <div v-else class="empty-state">
      <p>Select a file to start editing</p>
    </div>
  </div>
</template>

<style scoped>
.workbench {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Tabs Header */
.workbench-tabs {
  height: var(--tab-height);
  background-color: var(--bg-sidebar); /* Darker than panel */
  display: flex;
  align-items: flex-end;
  padding: 0 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
  overflow-x: auto; /* Allow scrolling if many tabs */
}

/* Hide scrollbar for tabs */
.workbench-tabs::-webkit-scrollbar {
  height: 0px;
  background: transparent;
}

.tab {
  height: 32px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  border: 1px solid transparent;
  border-bottom: none;
  margin-right: 2px;
  min-width: 120px;
  max-width: 200px;
}

.tab:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.tab.active {
  background-color: var(--bg-panel);
  color: var(--primary);
  border-color: var(--border-subtle);
  position: relative;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--bg-panel); /* Mask border-bottom */
}

.tab-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.tab-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}

.tab:hover .tab-close {
  opacity: 0.7;
}
.tab-close:hover {
  background-color: rgba(255,255,255,0.1);
  opacity: 1 !important;
}

.new-tab-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.new-tab-btn:hover {
  color: var(--text-primary);
}

/* Work Area (Dual Panes) */
.work-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.pane {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-panel);
  min-width: 200px;
}

.editor-pane {
  flex: none;
}

.tools-pane {
  flex: 1;
}

.pane-toolbar {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Icon Buttons - Transparent with white strokes */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.icon-btn:active {
  transform: scale(0.95);
}

.pane-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  margin-right: 1rem;
}

.file-info {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.pane-body {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Input Area */
.raw-input {
  width: 100%;
  height: 100%;
  background-color: var(--bg-app); /* Slightly darker than panel */
  border: none;
  color: var(--text-primary);
  padding: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  resize: none;
  outline: none;
  line-height: 1.6;
}

/* Resizer */
.resizer {
  width: 6px;
  background-color: transparent;
  cursor: col-resize;
  position: relative;
  z-index: 10;
  transition: background-color 0.15s;
  flex-shrink: 0;
}

.resizer::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: var(--border-subtle);
  transform: translateX(-50%);
  transition: width 0.15s, background-color 0.15s;
}

.resizer:hover::after,
.resizer.active::after {
  width: 3px;
  background-color: var(--primary);
}

.resizer.active {
  background-color: rgba(16, 185, 129, 0.1);
}

/* Tool Tabs in Right Pane */
.tool-selector {
  display: flex;
  gap: 0.5rem;
}

.tool-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.tool-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.tool-btn.active {
  color: var(--primary);
  background-color: rgba(16, 185, 129, 0.1); /* Green tint */
}

/* Special Diff Button */
.tool-btn.diff-btn {
  border: 1px dashed var(--border-subtle);
}

.tool-btn.diff-btn:hover {
  border-style: solid;
  border-color: var(--primary);
  color: var(--primary);
}

.tool-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  color: var(--text-muted);
  background-color: var(--bg-app);
  overflow: auto;
}

/* Full-screen Diff Mode */
.work-area.diff-mode {
  display: flex;
  flex-direction: column;
}
</style>
