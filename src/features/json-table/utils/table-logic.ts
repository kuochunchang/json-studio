import type { TableData } from '../types';

/**
 * Converts a JSON array of objects into a flat table structure.
 * If the input is not an array, it returns null.
 */
export function transformToTableData(input: any): TableData | null {
    if (!Array.isArray(input)) return null;

    // Filter out non-object items and check if we have any valid objects
    const objects = input.filter(item => item !== null && typeof item === 'object' && !Array.isArray(item));
    if (objects.length === 0) return null;

    // Collect all unique keys from all objects to form columns
    const columnSet = new Set<string>();
    objects.forEach(obj => {
        Object.keys(obj).forEach(key => columnSet.add(key));
    });

    return {
        columns: Array.from(columnSet),
        rows: objects
    };
}
