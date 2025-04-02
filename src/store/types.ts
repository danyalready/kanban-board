import { UniqueIdentifier } from "@dnd-kit/core";

export interface Task {
    id: UniqueIdentifier;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    comments: string[];
}

export interface Column {
    id: UniqueIdentifier;
    title: string;
    tasks: UniqueIdentifier[];
}

export interface Target {
    columnId: UniqueIdentifier;
    index: number;
}

export interface KanbanState {
    columns: Column[];
    tasks: Task[];
    active: null | Task | Column;
}

export type KanbanAction =
    | { type: "SET_STATE"; payload: KanbanState }
    | { type: "SET_ACTIVE"; payload: { active: null | Task | Column } }
    | { type: "ADD_COLUMN"; payload: { title: string } }
    | { type: "UPDATE_COLUMN"; payload: { columnId: UniqueIdentifier; data: Partial<Column> } }
    | { type: "DELETE_COLUMN"; payload: { columnId: UniqueIdentifier } }
    | { type: "MOVE_COLUMN"; payload: { columnId: UniqueIdentifier; targetIndex: number } }
    | { type: "ADD_TASK"; payload: { columnId: UniqueIdentifier; data: Omit<Task, "id" | "comments"> } }
    | { type: "UPDATE_TASK"; payload: { taskId: UniqueIdentifier; data: Partial<Task> } }
    | { type: "DELETE_TASK"; payload: { taskId: UniqueIdentifier } }
    | {
          type: "MOVE_TASK";
          payload: { taskId: UniqueIdentifier; targetIndex: number; targetColumnId: UniqueIdentifier };
      };

export function isTask(active: null | Task | Column): active is Task {
    return Boolean(active && "priority" in active);
}

export function isColumn(active: null | Task | Column): active is Column {
    return Boolean(active && "tasks" in active);
}
