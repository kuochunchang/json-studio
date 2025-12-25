import { create } from 'jsondiffpatch'
import type { DiffResult } from '../types'

// Create a jsondiffpatch instance with semantic diff options
const diffpatcher = create({
    // Compare arrays by strict equality (don't try to detect moves)
    arrays: {
        detectMove: true,
        includeValueOnMove: false
    },
    // Ignore object key order by default for semantic comparison
    objectHash: (obj: any) => {
        if (obj && obj.id) return obj.id
        if (obj && obj._id) return obj._id
        return JSON.stringify(obj)
    }
})

/**
 * Compare two JSON values and return a structured diff result
 * @param leftJson - The original/left JSON string
 * @param rightJson - The modified/right JSON string
 * @returns DiffResult with delta and parsed objects
 */
export function computeDiff(leftJson: string, rightJson: string): DiffResult {
    try {
        const leftParsed = JSON.parse(leftJson.trim() || '{}')
        const rightParsed = JSON.parse(rightJson.trim() || '{}')

        const delta = diffpatcher.diff(leftParsed, rightParsed)

        return {
            hasDiff: delta !== undefined,
            delta,
            leftParsed,
            rightParsed
        }
    } catch (e) {
        return {
            hasDiff: false,
            delta: null,
            leftParsed: null,
            rightParsed: null,
            error: e instanceof Error ? e.message : 'Failed to parse JSON'
        }
    }
}

/**
 * Format the diff delta into a human-readable summary
 */
export function formatDiffSummary(delta: any): string[] {
    if (!delta) return ['No differences found']

    const changes: string[] = []
    traverseDelta(delta, '', changes)
    return changes.length > 0 ? changes : ['No differences found']
}

function traverseDelta(delta: any, path: string, changes: string[]) {
    if (!delta || typeof delta !== 'object') return

    for (const key in delta) {
        const value = delta[key]
        const currentPath = path ? `${path}.${key}` : key

        // Handle special array notation
        if (key.startsWith('_')) continue

        if (Array.isArray(value)) {
            if (value.length === 1) {
                // Added
                changes.push(`+ Added: ${currentPath}`)
            } else if (value.length === 2) {
                // Modified
                changes.push(`~ Modified: ${currentPath}`)
            } else if (value.length === 3 && value[2] === 0) {
                // Deleted
                changes.push(`- Removed: ${currentPath}`)
            }
        } else if (typeof value === 'object') {
            // Nested changes
            traverseDelta(value, currentPath, changes)
        }
    }
}

export { diffpatcher }
