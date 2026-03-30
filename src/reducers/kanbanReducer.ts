import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

import type { Column, Task } from "@/db/types";
import { COLUMN_POSITION_OFFSET } from "@/services/columnService";
import {
    calculatePosition,
    filterTasksByColumn,
    needsReindex,
    reindex,
} from "@/model/task-ordering";

import { KanbanActionType, type KanbanAction, type KanbanState } from "./kanbanTypes";

export function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
    switch (action.type) {
        case KanbanActionType.SetState: {
            return action.payload.state;
        }
        case KanbanActionType.SetBoards: {
            return { ...state, boards: action.payload.boards };
        }
        case KanbanActionType.SetColumns: {
            return { ...state, columns: action.payload.columns };
        }
        case KanbanActionType.SetTasks: {
            return { ...state, tasks: action.payload.tasks };
        }
        case KanbanActionType.SetComments: {
            return { ...state, comments: action.payload.comments };
        }
        case KanbanActionType.ClearBoardData: {
            return { ...state, columns: [], tasks: [], comments: [] };
        }
        case KanbanActionType.SetActive: {
            return { ...state, active: action.payload.active };
        }
        case KanbanActionType.AddColumn: {
            const columnsInBoard = state.columns.filter(
                (column) => column.boardId === action.payload.boardId,
            );
            const maxPosition =
                columnsInBoard.length > 0
                    ? Math.max(...columnsInBoard.map((c) => c.position))
                    : -COLUMN_POSITION_OFFSET;
            const endPosition = maxPosition + COLUMN_POSITION_OFFSET;
            const newColumn: Column = {
                id: uuidv4(),
                name: action.payload.name,
                boardId: action.payload.boardId,
                position: endPosition,
                createdAt: Date.now(),
            };

            return { ...state, columns: [...state.columns, newColumn] };
        }
        case KanbanActionType.UpdateColumn: {
            return {
                ...state,
                columns: state.columns.map((column) =>
                    column.id === action.payload.columnId
                        ? { ...column, ...action.payload.data }
                        : column,
                ),
            };
        }
        case KanbanActionType.DeleteColumn: {
            return {
                ...state,
                columns: state.columns.filter((item) => item.id !== action.payload.columnId),
            };
        }
        case KanbanActionType.MoveColumn: {
            const activeIndex = state.columns.findIndex(
                (item) => item.id === action.payload.columnId,
            );
            if (activeIndex === -1 || action.payload.targetIndex === -1) return state;

            return {
                ...state,
                columns: arrayMove(state.columns, activeIndex, action.payload.targetIndex),
            };
        }
        case KanbanActionType.AddTask: {
            const newTask: Task = { id: uuidv4(), ...action.payload.data };

            return {
                ...state,
                tasks: [...state.tasks, newTask],
            };
        }
        case KanbanActionType.UpdateTask: {
            return {
                ...state,
                tasks: state.tasks.map((task) => {
                    if (task.id === action.payload.taskId) {
                        return { ...task, ...action.payload.data };
                    }

                    return task;
                }),
            };
        }
        case KanbanActionType.DeleteTask: {
            return {
                ...state,
                tasks: state.tasks.filter((item) => item.id !== action.payload.taskId),
            };
        }
        case KanbanActionType.MoveTask: {
            const { taskId, sourceColumnId, targetColumnId, targetIndex } = action.payload;

            const sourceTasks = filterTasksByColumn(state.tasks, sourceColumnId);
            const targetTasks =
                sourceColumnId === targetColumnId
                    ? sourceTasks
                    : filterTasksByColumn(state.tasks, targetColumnId);

            const index = targetIndex === -1 ? targetTasks.length : targetIndex;

            const newPosition = calculatePosition(targetTasks, index);

            let nextTasks = state.tasks.map((task) =>
                task.id === taskId
                    ? {
                          ...task,
                          columnId: targetColumnId,
                          position: newPosition,
                      }
                    : task,
            );

            const updatedColumnTasks = filterTasksByColumn(nextTasks, targetColumnId);

            if (needsReindex(updatedColumnTasks)) {
                const reindexed = reindex(updatedColumnTasks);

                nextTasks = nextTasks.map((task) => {
                    const updated = reindexed.find((t) => t.id === task.id);
                    return updated ? updated : task;
                });
            }

            return { ...state, tasks: nextTasks };
        }
        default: {
            return state;
        }
    }
}
