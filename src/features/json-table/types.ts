export interface TableSection {
    id: string;
    title: string;
    columns: string[];
    rows: Record<string, any>[];
}

export interface TableData {
    sections: TableSection[];
}
