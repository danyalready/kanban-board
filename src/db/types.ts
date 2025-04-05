export type Priority = "low" | "medium" | "high";

export interface Board {
    id: string;
    name: string;
    createdAt: number;
}

export interface Column {
    id: string;
    boardId: string;
    name: string;
    position: number;
}

export interface Task {
    id: string;
    columnId: string;
    title: string;
    description: string;
    priority: Priority;
    createdAt: number;
    position: number;
}

export interface Comment {
    id: string;
    taskId: string;
    text: string;
    createdAt: number;
}
