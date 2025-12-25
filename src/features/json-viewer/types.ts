export type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'

export interface JsonTreeNode {
    id: string
    key: string
    value: any
    type: JsonValueType
    depth: number
    isExpanded: boolean
    children?: JsonTreeNode[]
    path: string // 用於快速定位或路徑複製
}
