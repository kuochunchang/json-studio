/**
 * Pure utility functions for JSON manipulation
 * Following Guideline 1.2 - Business logic should be separated from UI
 */

/**
 * Format a JSON string with specified indentation
 * @param input - Raw JSON string
 * @param indent - Number of spaces for indentation, default 2
 * @returns Formatted JSON string, or null if parsing fails
 */
export function formatJson(input: string, indent: number = 2): string | null {
    try {
        const parsed = JSON.parse(input)
        return JSON.stringify(parsed, null, indent)
    } catch {
        return null
    }
}

/**
 * Minify a JSON string by removing all unnecessary whitespace
 * @param input - Raw JSON string
 * @returns Minified JSON string, or null if parsing fails
 */
export function minifyJson(input: string): string | null {
    try {
        const parsed = JSON.parse(input)
        return JSON.stringify(parsed)
    } catch {
        return null
    }
}

/**
 * Validate if a string is valid JSON
 * @param input - String to validate
 * @returns true if valid JSON, false otherwise
 */
export function isValidJson(input: string): boolean {
    try {
        JSON.parse(input)
        return true
    } catch {
        return false
    }
}

/**
 * Get the size of a JSON string in bytes
 * @param input - JSON string
 * @returns Size in bytes
 */
export function getJsonSize(input: string): number {
    return new Blob([input]).size
}

/**
 * Safely parse JSON with error handling
 * @param input - JSON string to parse
 * @returns Parsed object or error information
 */
export function safeParseJson<T = unknown>(input: string): { success: true; data: T } | { success: false; error: string } {
    try {
        const data = JSON.parse(input) as T
        return { success: true, data }
    } catch (e) {
        const error = e instanceof SyntaxError ? e.message : 'Failed to parse JSON'
        return { success: false, error }
    }
}
