import { JSONPath } from 'jsonpath-plus';
import type { QueryResult } from '../types';

/**
 * Executes a JSONPath query on a JSON object.
 * Returns the result or an error message.
 */
export function executeQuery(data: any, path: string): QueryResult {
    if (!path || path.trim() === '') {
        return { data };
    }

    try {
        const result = JSONPath({
            path: path.trim(),
            json: data,
            wrap: false
        });

        return {
            data: result === undefined ? null : result
        };
    } catch (error: any) {
        return {
            data: null,
            error: error.message || 'Invalid JSONPath expression'
        };
    }
}
