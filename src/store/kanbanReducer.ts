import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import { KanbanActionType, type KanbanAction, type KanbanState, type Task } from "./types";

export function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
    switch (action.type) {
        case KanbanActionType.SetState: {
            return action.payload.state;
        }
        case KanbanActionType.SetActive: {
            return { ...state, active: action.payload.active };
        }
        case KanbanActionType.AddColumn: {
            const newColumn = { id: uuidv4(), title: action.payload.title, tasks: [] };

            return { ...state, columns: [...state.columns, newColumn] };
        }
        case KanbanActionType.UpdateColumn: {
            return {
                ...state,
                columns: state.columns.map((item) =>
                    item.id === action.payload.columnId ? { ...item, ...action.payload.data } : item,
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
            const newTask: Task = { id: uuidv4(), comments: [], ...action.payload.data };

            return {
                ...state,
                columns: state.columns.map((item) =>
                    item.id === action.payload.columnId ? { ...item, tasks: [...item.tasks, newTask.id] } : item,
                ),
                tasks: [...state.tasks, newTask],
            };
        }
        case KanbanActionType.UpdateTask: {
            return {
                ...state,
                tasks: state.tasks.map((item) =>
                    item.id === action.payload.taskId ? { ...item, ...action.payload.data } : item,
                ),
            };
        }
        case KanbanActionType.DeleteTask: {
            const task = state.tasks.find((item) => item.id === action.payload.taskId);
            if (!task) return state;

            const taskColumn = state.columns.find((column) => column.tasks.includes(task.id));
            if (!taskColumn) return state;

            return {
                ...state,
                columns: state.columns.map((stateColumn) =>
                    stateColumn.id === taskColumn.id
                        ? { ...stateColumn, tasks: stateColumn.tasks.filter((id) => id !== action.payload.taskId) }
                        : stateColumn,
                ),
                tasks: state.tasks.filter((item) => item.id !== action.payload.taskId),
            };
        }
        case KanbanActionType.MoveTask: {
            const sourceColumn = state.columns.find((column) => column.tasks.includes(action.payload.taskId));
            if (!sourceColumn) return state;

            // Reorders the task in the same column
            if (sourceColumn.id === action.payload.targetColumnId) {
                const activeIndex = sourceColumn.tasks.findIndex((id) => id === action.payload.taskId);

                return {
                    ...state,
                    columns: state.columns.map((column) => {
                        if (column.id === action.payload.targetColumnId) {
                            return {
                                ...column,
                                tasks: arrayMove(column.tasks, activeIndex, action.payload.targetIndex),
                            };
                        }

                        return column;
                    }),
                };
            }

            // Moves the task into the another column
            return {
                ...state,
                columns: state.columns.map((stateColumn) => {
                    // Removes the task from the source coulmn
                    if (stateColumn.id === sourceColumn.id) {
                        return {
                            ...stateColumn,
                            tasks: stateColumn.tasks.filter((columnTaskId) => columnTaskId !== action.payload.taskId),
                        };
                    }

                    // Adds the task to the target column
                    if (stateColumn.id === action.payload.targetColumnId) {
                        const updatedTasks = [...stateColumn.tasks];

                        if (action.payload.targetIndex === -1) {
                            updatedTasks.push(action.payload.taskId);
                        } else {
                            updatedTasks.splice(action.payload.targetIndex, 0, action.payload.taskId);
                        }

                        return {
                            ...stateColumn,
                            tasks: updatedTasks,
                        };
                    }

                    return stateColumn;
                }),
            };
        }
        default: {
            return state;
        }
    }
}
