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
    createdAt: number;
}

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
    id: string;
    columnId: string;
    title: string;
    description: string;
    priority: TaskPriority;
    position: number;
    createdAt: number;
}

export interface Comment {
    id: string;
    taskId: string;
    text: string;
    createdAt: number;
}
