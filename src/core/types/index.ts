/**
 * Core type definitions for JSON Studio
 * All DTOs and shared data structures should be defined here.
 */

/**
 * Represents a JSON file in the workbench
 */
export interface JsonFile {
    /** Unique identifier for the file */
    id: string
    /** Display name of the file */
    name: string
    /** Raw content of the file */
    content: string
    /** Language mode for syntax highlighting */
    language: 'json' | 'yaml' | 'text'
    /** Timestamp when the file was created */
    createdAt: number
}

/**
 * Metadata for file operations
 */
export interface FileMetadata {
    size: number
    lastModified: number
    isValid: boolean
}

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast notification configuration
 */
export interface ToastConfig {
    id: string
    message: string
    type: ToastType
    duration?: number
}
