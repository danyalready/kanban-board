import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

export type Task = {
    id: string;
    columnId: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    comments: string[];
};

export type Column = {
    id: string;
    title: string;
    tasks: string[]; // task IDs
};

export interface KanbanState {
    columns: Column[];
    tasks: Task[];
}

export type KanbanAction =
    | { type: "ADD_COLUMN"; payload: { title: string } }
    | { type: "UPDATE_COLUMN"; payload: { columnId: string; data: Partial<Column> } }
    | { type: "DELETE_COLUMN"; payload: { columnId: string } }
    | { type: "MOVE_COLUMN"; payload: { columnId: string; targetIndex: number } }
    | { type: "ADD_TASK"; payload: { data: Omit<Task, "id" | "comments"> } }
    | { type: "UPDATE_TASK"; payload: { taskId: string; data: Partial<Task> } }
    | { type: "DELETE_TASK"; payload: { taskId: string } }
    | { type: "MOVE_TASK"; payload: { taskId: string; targetColumnId: string } };

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
            const { data } = action.payload;

            const newTask: Task = { id: uuidv4(), comments: [], ...data };

            return {
                ...state,
                columns: state.columns.map((item) => {
                    return item.id === newTask.columnId ? { ...item, tasks: [...item.tasks, newTask.id] } : item;
                }),
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

            return {
                ...state,
                columns: state.columns.map((item) =>
                    item.id === task.columnId ? { ...item, tasks: item.tasks.filter((item) => item !== taskId) } : item,
                ),
                tasks: state.tasks.filter((item) => item.id !== taskId),
            };
        }
        case "MOVE_TASK": {
            const { taskId, targetColumnId } = action.payload;

            const task = state.tasks.find((item) => item.id === taskId);

            if (!task) return state;

            const sourceColumn = state.columns.find((item) => item.id === task.columnId);
            const targetColumn = state.columns.find((item) => item.id === targetColumnId);

            if (!sourceColumn || !targetColumn) return state;

            return {
                ...state,
                columns: state.columns.map((item) => {
                    if (item.id === sourceColumn.id) {
                        return {
                            ...item,
                            tasks: item.tasks.filter((item) => item !== task.id),
                        };
                    }

                    if (item.id === targetColumn.id) {
                        return {
                            ...item,
                            tasks: [...item.tasks, task.id],
                        };
                    }

                    return item;
                }),
            };
        }
        default:
            return state;
    }
}
