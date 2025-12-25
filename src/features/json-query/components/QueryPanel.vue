<template>
  <div class="query-panel">
    <div class="query-input-wrapper">
      <div class="input-group">
        <Search :size="14" class="search-icon" />
        <input 
          v-model="queryPath" 
          type="text" 
          placeholder="Enter JSONPath (e.g., $.store.book[*].author)" 
          @keyup.enter="handleQuery"
          class="query-input"
        />
        <button class="run-btn" @click="handleQuery">Run</button>
      </div>
    </div>

    <div v-if="error" class="error-msg">
      <AlertCircle :size="16" />
      <span>{{ error }}</span>
    </div>

    <div class="query-result">
      <div class="result-header">
        <span class="label">RESULT</span>
        <span class="meta" v-if="result">
          {{ isArray ? result.length + ' items' : 'Object' }}
        </span>
      </div>
      <div class="result-body">
        <TreeViewer v-if="resultString" :data="resultString" />
        <div v-else class="empty-result">
          No results found or enter a query to start.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Search } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import TreeViewer from '../../json-viewer/components/TreeViewer.vue';
import { executeQuery } from '../utils/query-logic';

const props = defineProps<{
  data: string
}>()

const queryPath = ref('$')
const result = ref<any>(null)
const error = ref<string | null>(null)

const resultString = computed(() => {
  if (result.value === null && !error.value) return ''
  return JSON.stringify(result.value, null, 2)
})

const isArray = computed(() => Array.isArray(result.value))

const handleQuery = () => {
  if (!props.data) return
  
  try {
    const jsonData = JSON.parse(props.data)
    const { data: queryResult, error: queryError } = executeQuery(jsonData, queryPath.value)
    
    if (queryError) {
      error.value = queryError
      result.value = null
    } else {
      error.value = null
      result.value = queryResult
    }
  } catch (e) {
    error.value = 'Source JSON is invalid'
    result.value = null
  }
}

// Re-run query when source data changes
watch(() => props.data, () => {
  handleQuery()
})

// Initial run
handleQuery()
</script>

<style scoped>
.query-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.query-input-wrapper {
  padding: 1rem;
  border-bottom: 1px solid var(--border-subtle);
  background-color: var(--bg-sidebar);
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--bg-app);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
}

.search-icon {
  color: var(--text-muted);
}

.query-input {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  padding: 0.5rem;
  outline: none;
}

.run-btn {
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.run-btn:hover {
  opacity: 0.9;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
}

.query-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.result-header {
  padding: 0.5rem 1rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
}

.result-body {
  flex: 1;
  overflow: hidden; /* Scroll handled by TreeViewer */
}

.empty-result {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.85rem;
}
</style>
