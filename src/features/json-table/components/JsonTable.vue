<template>
  <div class="table-container">
    <div v-if="error" class="error-msg">
      <AlertCircle :size="16" />
      <span>Input must be an array of objects to use Table view.</span>
    </div>
    
    <div v-else-if="tableData" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="col in tableData.columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in tableData.rows" :key="idx">
            <td v-for="col in tableData.columns" :key="col">
              <span :class="['cell-value', getValType(row[col])]">
                {{ formatCellValue(row[col]) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      No data to display. Ensure your JSON is an array of objects.
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next';
import { onMounted, ref, watch } from 'vue';
import type { TableData } from '../types';
import { transformToTableData } from '../utils/table-logic';

const props = defineProps<{
  data: string
}>()

const tableData = ref<TableData | null>(null)
const error = ref(false)

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
  flex-direction: column;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
  border: 1px solid var(--border-subtle);
  margin: 1rem;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  min-width: max-content;
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

tbody td {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

tbody tr:hover {
  background-color: var(--bg-hover);
}

.cell-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 300px;
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
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--text-muted);
  font-style: italic;
}

/* Color coding for table cells similar to tree viewer */
.type-string { color: #ce9178; }
.type-number { color: #b5cea8; }
.type-boolean { color: #569cd6; }
.type-null { color: #569cd6; font-style: italic; }
</style>
