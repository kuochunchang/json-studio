import type { JsonTreeNode, JsonValueType } from '../types'

function getValueType(value: any): JsonValueType {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value as JsonValueType
}

/**
 * 將原始 JSON 對象遞迴轉換為樹狀節點
 */
export function buildTree(
    data: any,
    key: string = 'root',
    depth: number = 0,
    path: string = 'root'
): JsonTreeNode {
    const type = getValueType(data)
    const id = Math.random().toString(36).substring(2, 9) // 簡單 ID，Production 可換成 UUID

    const node: JsonTreeNode = {
        id,
        key,
        value: data,
        type,
        depth,
        path,
        isExpanded: depth < 2 // 預設展開前兩層
    }

    if (type === 'object' && data !== null) {
        node.children = Object.entries(data).map(([childKey, childValue]) =>
            buildTree(childValue, childKey, depth + 1, `${path}.${childKey}`)
        )
    } else if (type === 'array') {
        node.children = (data as any[]).map((item, index) =>
            buildTree(item, `[${index}]`, depth + 1, `${path}[${index}]`)
        )
    }

    return node
}
