import { ref } from 'vue'
import type { ToastConfig, ToastType } from '../types'

/**
 * Composable for managing toast notifications
 * Following Guideline 9.2.2 - User-friendly error feedback without alert()
 */

const toasts = ref<ToastConfig[]>([])
let toastIdCounter = 0

/**
 * Show a toast notification
 * @param message - Message to display
 * @param type - Type of toast (success, error, warning, info)
 * @param duration - Duration in ms before auto-dismiss (default: 4000)
 */
export function showToast(message: string, type: ToastType = 'info', duration: number = 4000): string {
    const id = `toast-${++toastIdCounter}`

    const toast: ToastConfig = {
        id,
        message,
        type,
        duration
    }

    toasts.value.push(toast)

    // Auto-dismiss after duration
    if (duration > 0) {
        setTimeout(() => {
            dismissToast(id)
        }, duration)
    }

    return id
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissToast(id: string): void {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
        toasts.value.splice(index, 1)
    }
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts(): void {
    toasts.value = []
}

/**
 * Composable hook for toast functionality
 */
export function useToast() {
    return {
        toasts,
        showToast,
        dismissToast,
        dismissAllToasts
    }
}
