export type UniqueIdentifier = number | string;

export type Priority = "low" | "medium" | "high";

export interface Column {
    id: UniqueIdentifier;
    title: string;
    order: number;
}

export interface Task {
    id: UniqueIdentifier;
    columnId: UniqueIdentifier;
    title: string;
    description?: string;
    priority: Priority;
    comments: string[];
    order: number;
}
