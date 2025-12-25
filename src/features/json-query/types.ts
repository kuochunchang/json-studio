export interface QueryResult {
    data: any;
    error?: string;
}

export interface QueryHistory {
    path: string;
    timestamp: number;
}
