import yaml from 'js-yaml';
import { json2csv } from 'json-2-csv';
import type { TargetFormat, TransformResult } from '../types';

/**
 * Transforms JSON object to various formats (YAML, CSV).
 * Rejects if formatting is not possible (e.g. CSV from non-array-like objects).
 */
export async function transformJson(data: any, format: TargetFormat): Promise<TransformResult> {
    try {
        if (format === 'yaml') {
            const yamlContent = yaml.dump(data, { indent: 2, noRefs: true });
            return { content: yamlContent, format: 'yaml' };
        }

        if (format === 'csv') {
            // json-2-csv handles both single objects and arrays, but arrays are preferred.
            const csvContent = await json2csv(Array.isArray(data) ? data : [data]);
            return { content: csvContent, format: 'csv' };
        }

        return { content: '', format, error: `Unsupported format: ${format}` };
    } catch (error: any) {
        return {
            content: '',
            format,
            error: error.message || `Failed to transform to ${format.toUpperCase()}`
        };
    }
}
