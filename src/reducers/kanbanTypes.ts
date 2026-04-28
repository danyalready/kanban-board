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
    SetBoards = "SET_BOARDS",
    SetColumns = "SET_COLUMNS",
    SetTasks = "SET_TASKS",
    SetComments = "SET_COMMENTS",
    ClearBoardData = "CLEAR_BOARD_DATA",
    AddColumn = "ADD_COLUMN",
    UpdateColumn = "UPDATE_COLUMN",
    DeleteColumn = "DELETE_COLUMN",
    AddTask = "ADD_TASK",
    UpdateTask = "UPDATE_TASK",
    DeleteTask = "DELETE_TASK",
    MoveTask = "MOVE_TASK",
    AddComment = "ADD_COMMENT",
    UpdateComment = "UPDATE_COMMENT",
    DeleteComment = "DELETE_COMMENT",
}

export type KanbanAction =
    | { type: KanbanActionType.SetState; payload: { state: KanbanState } }
    | { type: KanbanActionType.SetActive; payload: { active: null | Task | Column } }
    | { type: KanbanActionType.SetBoards; payload: { boards: Board[] } }
    | { type: KanbanActionType.SetColumns; payload: { columns: Column[] } }
    | { type: KanbanActionType.SetTasks; payload: { tasks: Task[] } }
    | { type: KanbanActionType.SetComments; payload: { comments: Comment[] } }
    | { type: KanbanActionType.ClearBoardData }
    | { type: KanbanActionType.AddColumn; payload: { name: string; boardId: string } }
    | { type: KanbanActionType.UpdateColumn; payload: { columnId: string; data: Partial<Column> } }
    | { type: KanbanActionType.DeleteColumn; payload: { columnId: string } }
    | { type: KanbanActionType.AddTask; payload: { columnId: string; data: Omit<Task, "id"> } }
    | { type: KanbanActionType.UpdateTask; payload: { taskId: string; data: Partial<Task> } }
    | { type: KanbanActionType.DeleteTask; payload: { taskId: string } }
    | { type: KanbanActionType.AddComment; payload: { comment: Comment } }
    | {
          type: KanbanActionType.UpdateComment;
          payload: { commentId: string; data: Partial<Comment> };
      }
    | { type: KanbanActionType.DeleteComment; payload: { commentId: string } };

export function isTask(active: null | Task | Column): active is Task {
    return Boolean(active && "priority" in active);
}

export function isColumn(active: null | Task | Column): active is Column {
    return Boolean(active && !("priority" in active));
}
