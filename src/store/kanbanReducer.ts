import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import type { KanbanAction, KanbanState, Task } from "./types";

export function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
    switch (action.type) {
        case "SET_ACTIVE": {
            const { active } = action.payload;

            return { ...state, active };
        }
        case "ADD_COLUMN": {
            const { title } = action.payload;

            const newColumn = { id: uuidv4(), title, tasks: [] };

            return { ...state, columns: [...state.columns, newColumn] };
        }
        case "UPDATE_COLUMN": {
            const { columnId, data } = action.payload;

            return {
                ...state,
                columns: state.columns.map((item) => (item.id === columnId ? { ...item, ...data } : item)),
            };
        }
        case "DELETE_COLUMN": {
            const { columnId } = action.payload;

            return { ...state, columns: state.columns.filter((item) => item.id !== columnId) };
        }
        case "MOVE_COLUMN": {
            const { columnId, targetIndex } = action.payload;

            const activeIndex = state.columns.findIndex((item) => item.id === columnId);

            if (activeIndex === -1 || targetIndex === -1) return state;

            return {
                ...state,
                columns: arrayMove(state.columns, activeIndex, targetIndex),
            };
        }
        case "ADD_TASK": {
            const { columnId, data } = action.payload;

            const newTask: Task = { id: uuidv4(), comments: [], ...data };

            return {
                ...state,
                columns: state.columns.map((item) =>
                    item.id === columnId ? { ...item, tasks: [...item.tasks, newTask.id] } : item,
                ),
                tasks: [...state.tasks, newTask],
            };
        }
        case "UPDATE_TASK": {
            const { taskId, data } = action.payload;

            return {
                ...state,
                tasks: state.tasks.map((item) => (item.id === taskId ? { ...item, ...data } : item)),
            };
        }
        case "DELETE_TASK": {
            const { taskId } = action.payload;

            const task = state.tasks.find((item) => item.id === taskId);

            if (!task) return state;

            const taskColumn = state.columns.find((column) => column.tasks.includes(task.id));

            if (!taskColumn) return state;

            return {
                ...state,
                columns: state.columns.map((stateColumn) =>
                    stateColumn.id === taskColumn.id
                        ? { ...stateColumn, tasks: stateColumn.tasks.filter((id) => id !== taskId) }
                        : stateColumn,
                ),
                tasks: state.tasks.filter((item) => item.id !== taskId),
            };
        }
        case "MOVE_TASK": {
            const { taskId, targetIndex, targetColumnId } = action.payload;

            const sourceColumn = state.columns.find((column) => column.tasks.includes(taskId));

            if (!sourceColumn) return state;

            // NOTE: Reorders the task in the same column
            if (sourceColumn.id === targetColumnId) {
                const activeIndex = sourceColumn.tasks.findIndex((id) => id === taskId);

                return {
                    ...state,
                    columns: state.columns.map((column) => {
                        if (column.id === targetColumnId) {
                            return {
                                ...column,
                                tasks: arrayMove(column.tasks, activeIndex, targetIndex),
                            };
                        }

                        return column;
                    }),
                };
            }

            // NOTE: Moves the task into the another column
            return {
                ...state,
                tasks: state.tasks.map((stateTask) =>
                    stateTask.id === taskId ? { ...stateTask, columnId: targetColumnId } : stateTask,
                ),
                columns: state.columns.map((column) => {
                    // NOTE: Removes the task from the source coulmn
                    if (column.id === sourceColumn.id) {
                        return {
                            ...column,
                            tasks: column.tasks.filter((columnTaskId) => columnTaskId !== taskId),
                        };
                    }

                    // NOTE: Adds the task to the target column
                    if (column.id === targetColumnId) {
                        const updatedTasks = [...column.tasks];

                        updatedTasks.splice(targetIndex, 0, taskId);

                        return {
                            ...column,
                            tasks: updatedTasks,
                        };
                    }

                    return column;
                }),
            };
        }
        default: {
            return state;
        }
    }
}
