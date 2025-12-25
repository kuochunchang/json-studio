export type TargetFormat = 'yaml' | 'csv' | 'xml';

export interface TransformResult {
    content: string;
    format: TargetFormat;
    error?: string;
}
