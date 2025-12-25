<template>
  <div class="tree-item" :style="{ paddingLeft: `${depth * 16}px` }">
    <div class="item-content" @click="toggleExpand">
      <!-- 展開/收起圖標 -->
      <span v-if="hasChildren" class="expand-icon" :class="{ 'is-expanded': expanded }">
        <ChevronRight :size="14" />
      </span>
      <span v-else class="indent-placeholder"></span>

      <!-- Key 名稱 -->
      <span class="item-key">{{ node.key }}:</span>

      <!-- Value 預覽 -->
      <span v-if="!expanded || !hasChildren" class="item-value" :class="`type-${node.type}`">
        {{ formatValue(node.value, node.type) }}
      </span>

      <!-- 陣列和物件的長度提示 -->
      <span v-if="hasChildren" class="item-meta">
        {{ node.type === 'array' ? '[' + node.children?.length + ']' : '{' + node.children?.length + '}' }}
      </span>
    </div>

    <!-- 遞迴子節點 -->
    <div v-if="expanded && hasChildren" class="item-children">
      <TreeItem 
        v-for="child in node.children" 
        :key="child.id" 
        :node="child" 
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import type { JsonTreeNode, JsonValueType } from '../types';

const props = defineProps<{
  node: JsonTreeNode
  depth: number
}>()

const expanded = ref(props.node.isExpanded)
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

const toggleExpand = () => {
  if (hasChildren.value) {
    expanded.value = !expanded.value
  }
}

const formatValue = (val: any, type: JsonValueType) => {
  if (type === 'string') return `"${val}"`
  if (type === 'null') return 'null'
  if (type === 'object') return '{ ... }'
  if (type === 'array') return '[ ... ]'
  return String(val)
}
</script>

<style scoped>
.tree-item {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
}

.item-content {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  white-space: nowrap;
}

.item-content:hover {
  background-color: var(--bg-active);
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  color: var(--text-muted);
  transition: transform 0.2s;
}

.expand-icon.is-expanded {
  transform: rotate(90deg);
}

.indent-placeholder {
  width: 16px;
}

.item-key {
  color: var(--accent-400);
  margin-right: 8px;
}

.item-value {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.item-meta {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-left: 8px;
}

/* 根據型別著色 */
.type-string { color: #ce9178; }
.type-number { color: #b5cea8; }
.type-boolean { color: #569cd6; }
.type-null { color: #569cd6; font-style: italic; }
.type-object, .type-array { color: var(--text-muted); }
</style>
