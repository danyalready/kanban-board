import { UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

export type Task = {
    id: UniqueIdentifier;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    comments: string[];
};

export type Column = {
    id: UniqueIdentifier;
    title: string;
    tasks: UniqueIdentifier[]; // task IDs
};

export interface KanbanState {
    columns: Column[];
    tasks: Task[];
}

export type KanbanAction =
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

export function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
    switch (action.type) {
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
                        return {
                            ...column,
                            tasks: [taskId, ...column.tasks],
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
