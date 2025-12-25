<template>
  <div class="table-container" :class="{ 'has-multiple': tableData && tableData.sections.length > 1 }">
    <div v-if="error" class="error-msg">
      <AlertCircle :size="16" />
      <span>Unable to display as table. Ensure your JSON contains data structures that can be tabulated.</span>
    </div>
    
    <template v-else-if="tableData">
      <!-- Sidebar Navigation for multiple sections -->
      <div v-if="tableData.sections.length > 1" class="section-nav">
        <div class="nav-header">SECTIONS</div>
        <button 
          v-for="section in tableData.sections" 
          :key="section.id"
          class="nav-item"
          :class="{ active: activeSectionId === section.id }"
          @click="activeSectionId = section.id"
        >
          {{ section.title }}
          <span class="row-count">{{ section.rows.length }}</span>
        </button>
      </div>

      <!-- Main Table Area -->
      <div class="table-content">
        <div v-if="currentSection" class="table-wrapper">
          <div class="table-header">
            <h3>{{ currentSection.title }}</h3>
            <span class="stats">{{ currentSection.rows.length }} rows • {{ currentSection.columns.length }} columns</span>
          </div>
          <div class="scroll-area">
            <table>
              <thead>
                <tr>
                  <th v-for="col in currentSection.columns" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in currentSection.rows" :key="idx">
                  <td v-for="col in currentSection.columns" :key="col">
                    <span :class="['cell-value', getValType(row[col])]">
                      {{ formatCellValue(row[col]) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="empty-state">
      No data to display. Ensure your JSON contains arrays or objects.
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import type { TableData } from '../types';
import { transformToTableData } from '../utils/table-logic';

const props = defineProps<{
  data: string
}>()

const tableData = ref<TableData | null>(null)
const activeSectionId = ref<string | null>(null)
const error = ref(false)

const currentSection = computed(() => {
  if (!tableData.value) return null
  return tableData.value.sections.find(s => s.id === activeSectionId.value) || tableData.value.sections[0]
})

const updateTable = () => {
  if (!props.data || props.data.trim() === '') {
    tableData.value = null
    error.value = false
    return
  }

  try {
    const parsed = JSON.parse(props.data)
    const transformed = transformToTableData(parsed)
    
    if (transformed) {
      tableData.value = transformed
      // Reset active section if current one doesn't exist in new data
      if (!activeSectionId.value || !transformed.sections.find(s => s.id === activeSectionId.value)) {
        activeSectionId.value = transformed.sections[0].id
      }
      error.value = false
    } else {
      tableData.value = null
      error.value = true
    }
  } catch (e) {
    error.value = true
    tableData.value = null
  }
}

const getValType = (val: any) => {
  if (val === null) return 'type-null'
  if (Array.isArray(val)) return 'type-array'
  return `type-${typeof val}`
}

const formatCellValue = (val: any) => {
  if (val === null) return 'null'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

watch(() => props.data, updateTable)
onMounted(updateTable)
</script>

<style scoped>
.table-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
}

.table-container.has-multiple {
  background-color: var(--bg-app);
}

/* Section Sidebar */
.section-nav {
  width: 200px;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  gap: 2px;
  overflow-y: auto;
}

.nav-header {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  padding: 0.75rem 0.5rem;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--primary);
  font-weight: 500;
}

.row-count {
  font-size: 0.7rem;
  opacity: 0.6;
  background: rgba(0,0,0,0.2);
  padding: 1px 6px;
  border-radius: 10px;
}

/* Table Content Area */
.table-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-panel);
}

.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.stats {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.scroll-area {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  min-width: max-content;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

thead th {
  position: sticky;
  top: 0;
  background-color: var(--bg-sidebar);
  color: var(--text-primary);
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid var(--border-subtle);
  font-weight: 600;
  z-index: 1;
}

thead th:first-child { border-top-left-radius: 8px; }
thead th:last-child { border-top-right-radius: 8px; }

tbody td {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background-color: var(--bg-hover);
}

.cell-value {
  white-space: pre-wrap;
  word-break: break-all;
  display: block;
  max-width: 400px;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.85rem;
  padding: 1rem;
  margin: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
  height: fit-content;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: var(--text-muted);
  font-style: italic;
}

/* Color coding for table cells */
.type-string { color: #ce9178; }
.type-number { color: #b5cea8; }
.type-boolean { color: #569cd6; }
.type-null { color: #569cd6; font-style: italic; }
</style>
