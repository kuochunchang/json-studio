<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="toast"
        :class="[`toast--${toast.type}`]"
      >
        <component :is="getIcon(toast.type)" :size="18" class="toast-icon" />
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click="dismissToast(toast.id)" aria-label="Dismiss notification">
          <X :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'
import type { ToastType } from '../types'

const { toasts, dismissToast } = useToast()

function getIcon(type: ToastType) {
  switch (type) {
    case 'success': return CheckCircle
    case 'error': return AlertCircle
    case 'warning': return AlertTriangle
    case 'info': default: return Info
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  min-width: 280px;
  max-width: 400px;
}

.toast--success {
  border-left: 3px solid #22c55e;
}

.toast--success .toast-icon {
  color: #22c55e;
}

.toast--error {
  border-left: 3px solid #ef4444;
}

.toast--error .toast-icon {
  color: #ef4444;
}

.toast--warning {
  border-left: 3px solid #eab308;
}

.toast--warning .toast-icon {
  color: #eab308;
}

.toast--info {
  border-left: 3px solid var(--primary);
}

.toast--info .toast-icon {
  color: var(--primary);
}

.toast-message {
  flex: 1;
  font-size: 0.85rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.toast-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* Transitions */
.toast-enter-active {
  animation: slideIn 0.3s ease;
}

.toast-leave-active {
  animation: slideOut 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
