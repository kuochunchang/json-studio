<template>
  <div class="tree-viewer">
    <div v-if="error" class="error-msg">
      <AlertCircle :size="16" />
      <span>Invalid JSON to view</span>
    </div>
    
    <div v-else-if="rootNode" class="tree-content">
      <TreeItem :node="rootNode" :depth="0" />
    </div>

    <div v-else class="empty-state">
      No data to display
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import type { JsonTreeNode } from '../types'
import { buildTree } from '../utils/tree-builder'
import TreeItem from './TreeItem.vue'

const props = defineProps<{
  data: string
}>()

const rootNode = ref<JsonTreeNode | null>(null)
const error = ref(false)

const updateTree = () => {
  if (!props.data || props.data.trim() === '') {
    rootNode.value = null
    error.value = false
    return
  }

  try {
    const parsed = JSON.parse(props.data)
    rootNode.value = buildTree(parsed)
    error.value = false
  } catch (e) {
    error.value = true
    rootNode.value = null
  }
}

watch(() => props.data, updateTree)
onMounted(updateTree)
</script>

<style scoped>
.tree-viewer {
  width: 100%;
  height: 100%;
  padding: 1rem;
  overflow: auto;
  background-color: var(--bg-panel);
}

.tree-content {
  color: var(--text-primary);
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.85rem;
  padding: 1rem;
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
</style>
