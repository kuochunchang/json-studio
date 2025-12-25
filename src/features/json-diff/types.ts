export interface DiffResult {
    hasDiff: boolean
    delta: any // jsondiffpatch delta format
    leftParsed: any
    rightParsed: any
    error?: string
}

export type DiffSource = 'file' | 'paste'
