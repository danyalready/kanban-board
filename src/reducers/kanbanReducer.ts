import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

import type { Column, Task } from "@/db/types";
import { COLUMN_POSITION_OFFSET } from "@/services/columnService";
import { TASK_POSITION_OFFSET } from "@/services/taskService";

import { KanbanActionType, type KanbanAction, type KanbanState } from "./kanbanTypes";

export function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
    switch (action.type) {
        case KanbanActionType.SetState: {
            return action.payload.state;
        }
        case KanbanActionType.SetActive: {
            return { ...state, active: action.payload.active };
        }
        case KanbanActionType.AddColumn: {
            const columnsInBoard = state.columns.filter((column) => column.boardId === action.payload.boardId);
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
                    column.id === action.payload.columnId ? { ...column, ...action.payload.data } : column,
                ),
            };
        }
        case KanbanActionType.DeleteColumn: {
            return { ...state, columns: state.columns.filter((item) => item.id !== action.payload.columnId) };
        }
        case KanbanActionType.MoveColumn: {
            const activeIndex = state.columns.findIndex((item) => item.id === action.payload.columnId);
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
            if (action.payload.sourceColumnId === action.payload.targetColumnId) {
                const tasksInColumn = state.tasks
                    .filter((task) => task.columnId === action.payload.sourceColumnId)
                    .sort((a, b) => a.position - b.position);

                const before = tasksInColumn[action.payload.targetIndex - 1];
                const after = tasksInColumn[action.payload.targetIndex];

                let newPosition: number;

                if (before && after) {
                    newPosition = (before.position + after.position) / 2;
                } else if (before) {
                    newPosition = before.position + TASK_POSITION_OFFSET;
                } else if (after) {
                    newPosition = after.position / 2;
                } else {
                    newPosition = TASK_POSITION_OFFSET;
                }

                const updatedTasks = state.tasks.map((task) => {
                    if (task.id === action.payload.taskId) {
                        return { ...task, position: newPosition };
                    }

                    return task;
                });

                return { ...state, tasks: updatedTasks };
            }

            // Cross-column move: compute a new position based on targetIndex within the target column
            const tasksInTargetColumn = state.tasks
                .filter((task) => task.columnId === action.payload.targetColumnId)
                .sort((a, b) => a.position - b.position);

            let newPosition: number;

            if (action.payload.targetIndex === -1) {
                // append to end
                const last = tasksInTargetColumn[tasksInTargetColumn.length - 1];
                newPosition = last ? last.position + TASK_POSITION_OFFSET : TASK_POSITION_OFFSET;
            } else {
                const before = tasksInTargetColumn[action.payload.targetIndex - 1];
                const after = tasksInTargetColumn[action.payload.targetIndex];

                if (before && after) {
                    newPosition = (before.position + after.position) / 2;
                } else if (before) {
                    newPosition = before.position + TASK_POSITION_OFFSET;
                } else if (after) {
                    newPosition = Math.max(0, after.position - TASK_POSITION_OFFSET);
                } else {
                    newPosition = TASK_POSITION_OFFSET;
                }
            }

            const updatedTasks = state.tasks.map((task) => {
                if (task.id === action.payload.taskId) {
                    return {
                        ...task,
                        columnId: action.payload.targetColumnId,
                        position: newPosition,
                    };
                }

                return task;
            });

            return { ...state, tasks: updatedTasks };
        }
        default: {
            return state;
        }
    }
}
