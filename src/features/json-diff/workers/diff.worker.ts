/**
 * Web Worker for heavy JSON diff computation
 * Following Guideline 6.2 - Heavy computation should be moved to Web Workers
 */

import { create } from 'jsondiffpatch'

// Create a jsondiffpatch instance with semantic diff options
const diffpatcher = create({
    arrays: {
        detectMove: true,
        includeValueOnMove: false
    },
    objectHash: (obj: unknown): string => {
        const record = obj as Record<string, unknown>
        if (record && record.id) return String(record.id)
        if (record && record._id) return String(record._id)
        return JSON.stringify(obj)
    }
})

export interface DiffWorkerInput {
    leftJson: string
    rightJson: string
}

export interface DiffWorkerOutput {
    hasDiff: boolean
    delta: unknown
    leftParsed: unknown
    rightParsed: unknown
    error?: string
    changeSummary: string[]
}

/**
 * Traverse delta to generate human-readable change summary
 */
function traverseDelta(delta: unknown, path: string, changes: string[]): void {
    if (!delta || typeof delta !== 'object') return

    const record = delta as Record<string, unknown>
    for (const key in record) {
        const value = record[key]
        const currentPath = path ? `${path}.${key}` : key

        if (key.startsWith('_')) continue

        if (Array.isArray(value)) {
            if (value.length === 1) {
                changes.push(`+ Added: ${currentPath}`)
            } else if (value.length === 2) {
                changes.push(`~ Modified: ${currentPath}`)
            } else if (value.length === 3 && value[2] === 0) {
                changes.push(`- Removed: ${currentPath}`)
            }
        } else if (typeof value === 'object') {
            traverseDelta(value, currentPath, changes)
        }
    }
}

/**
 * Main worker message handler
 */
self.onmessage = (event: MessageEvent<DiffWorkerInput>) => {
    const { leftJson, rightJson } = event.data

    try {
        const leftParsed = JSON.parse(leftJson.trim() || '{}')
        const rightParsed = JSON.parse(rightJson.trim() || '{}')

        const delta = diffpatcher.diff(leftParsed, rightParsed)

        const changeSummary: string[] = []
        if (delta) {
            traverseDelta(delta, '', changeSummary)
        }

        const result: DiffWorkerOutput = {
            hasDiff: delta !== undefined,
            delta,
            leftParsed,
            rightParsed,
            changeSummary: changeSummary.length > 0 ? changeSummary : ['No differences found']
        }

        self.postMessage(result)
    } catch (e) {
        const result: DiffWorkerOutput = {
            hasDiff: false,
            delta: null,
            leftParsed: null,
            rightParsed: null,
            error: e instanceof Error ? e.message : 'Failed to parse JSON',
            changeSummary: []
        }
        self.postMessage(result)
    }
}
