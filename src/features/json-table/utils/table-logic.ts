import type { TableData, TableSection } from '../types';

/**
 * Converts a JSON input into multiple potential table sections.
 */
export function transformToTableData(input: any): TableData | null {
    if (input === null || typeof input !== 'object') return null;

    const sections: TableSection[] = [];

    // 1. Always add the "Root" section
    const rootArray = Array.isArray(input) ? input : [input];
    const rootSection = createSection('Root', 'root', rootArray);
    if (rootSection) sections.push(rootSection);

    // 2. Identify top-level properties that can be sections
    if (!Array.isArray(input)) {
        Object.entries(input).forEach(([key, value]) => {
            if (value === null || typeof value !== 'object') return;

            const title = key.charAt(0).toUpperCase() + key.slice(1);
            const id = `prop-${key}`;

            const dataArray = Array.isArray(value) ? value : [value];
            const section = createSection(title, id, dataArray);
            if (section) sections.push(section);
        });
    }

    return sections.length > 0 ? { sections } : null;
}

function createSection(title: string, id: string, data: any[]): TableSection | null {
    // We only create a section if there's actual data to show
    if (data.length === 0) return null;

    const columnSet = new Set<string>();
    const rows: Record<string, any>[] = [];

    data.forEach(item => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
            // Object: collect all keys
            Object.keys(item).forEach(k => columnSet.add(k));
            rows.push(item);
        } else {
            // Primitive or Array: use a generic "Value" column
            columnSet.add('Value');
            rows.push({ 'Value': item });
        }
    });

    if (columnSet.size === 0) return null;

    return {
        id,
        title,
        columns: Array.from(columnSet),
        rows
    };
}
