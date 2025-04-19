import { UniqueIdentifier } from "@dnd-kit/core";

import type { Board, Column, Comment, Task } from "@/db/types";

export interface KanbanState {
    boards: Board[];
    columns: Column[];
    tasks: Task[];
    comments: Comment[];
    active: null | Task | Column;
}

export enum KanbanActionType {
    SetState = "SET_STATE",
    SetActive = "SET_ACTIVE",
    AddColumn = "ADD_COLUMN",
    UpdateColumn = "UPDATE_COLUMN",
    DeleteColumn = "DELETE_COLUMN",
    MoveColumn = "MOVE_COLUMN",
    AddTask = "ADD_TASK",
    UpdateTask = "UPDATE_TASK",
    DeleteTask = "DELETE_TASK",
    MoveTask = "MOVE_TASK",
}

export type KanbanAction =
    | { type: KanbanActionType.SetState; payload: { state: KanbanState } }
    | { type: KanbanActionType.SetActive; payload: { active: null | Task | Column } }
    | { type: KanbanActionType.AddColumn; payload: { title: string } }
    | { type: KanbanActionType.UpdateColumn; payload: { columnId: UniqueIdentifier; data: Partial<Column> } }
    | { type: KanbanActionType.DeleteColumn; payload: { columnId: UniqueIdentifier } }
    | { type: KanbanActionType.MoveColumn; payload: { columnId: UniqueIdentifier; targetIndex: number } }
    | { type: KanbanActionType.AddTask; payload: { columnId: UniqueIdentifier; data: Omit<Task, "id" | "comments"> } }
    | { type: KanbanActionType.UpdateTask; payload: { taskId: UniqueIdentifier; data: Partial<Task> } }
    | { type: KanbanActionType.DeleteTask; payload: { taskId: UniqueIdentifier } }
    | {
          type: "MOVE_TASK";
          payload: { taskId: UniqueIdentifier; targetIndex: number; targetColumnId: UniqueIdentifier };
      };

export function isTask(active: null | Task | Column): active is Task {
    return Boolean(active && "priority" in active);
}

export function isColumn(active: null | Task | Column): active is Column {
    return Boolean(active && !("priority" in active));
}
