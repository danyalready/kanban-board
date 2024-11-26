import { PropsWithChildren, useReducer } from "react";

import { KanbanContext } from "./KanbanContext";

export type Task = {
    id: string;
    title: string;
    description?: string;
};

export type Column = {
    id: string;
    title: string;
    tasks: Task[];
};

export interface KanbanState {
    columns: Column[];
}

export type KanbanAction =
    | { type: "ADD_COLUMN"; payload: { id: string; title: string } }
    | { type: "DELETE_COLUMN"; payload: { columnId: string } }
    | { type: "ADD_TASK"; payload: { columnId: string; task: Task } }
    | { type: "UPDATE_TASK"; payload: { columnId: string; taskId: string; updatedTask: Partial<Task> } }
    | { type: "DELETE_TASK"; payload: { columnId: string; taskId: string } }
    | { type: "MOVE_TASK"; payload: { sourceColumnId: string; targetColumnId: string; taskId: string } };

const initialState: KanbanState = {
    columns: [
        {
            id: "column-1",
            title: "To Do",
            tasks: [
                { id: "task-1", title: "🥦 Go to grocery" },
                { id: "task-2", title: "🦮 Walk the dog" },
            ],
        },
        { id: "column-2", title: "In Progress", tasks: [{ id: "task-3", title: "Exercise" }] },
        {
            id: "column-3",
            title: "✅ Compleated",
            tasks: [
                { id: "task-4", title: "Play guitar 🎸" },
                { id: "task-5", title: "💊 Take the pills" },
                { id: "task-6", title: "Water the plants 🪴" },
            ],
        },
    ],
};

function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
    switch (action.type) {
        case "ADD_COLUMN": {
            const { id, title } = action.payload;

            return { columns: [...state.columns, { id, title, tasks: [] }] };
        }
        case "DELETE_COLUMN": {
            const { columnId } = action.payload;

            return { columns: state.columns.filter((column) => column.id !== columnId) };
        }
        case "ADD_TASK": {
            const { columnId, task } = action.payload;

            return {
                columns: state.columns.map((column) =>
                    column.id === columnId ? { ...column, tasks: [...column.tasks, task] } : column,
                ),
            };
        }
        case "UPDATE_TASK": {
            const { columnId, taskId, updatedTask } = action.payload;

            return {
                columns: state.columns.map((column) =>
                    column.id === columnId
                        ? {
                              ...column,
                              tasks: column.tasks.map((task) =>
                                  task.id === taskId ? { ...task, ...updatedTask } : task,
                              ),
                          }
                        : column,
                ),
            };
        }
        case "DELETE_TASK": {
            const { columnId, taskId } = action.payload;

            return {
                columns: state.columns.map((column) =>
                    column.id === columnId
                        ? { ...column, tasks: column.tasks.filter((task) => task.id !== taskId) }
                        : column,
                ),
            };
        }
        case "MOVE_TASK": {
            const { sourceColumnId, targetColumnId, taskId } = action.payload;

            const sourceColumn = state.columns.find((column) => column.id === sourceColumnId);
            const targetColumn = state.columns.find((column) => column.id === targetColumnId);

            if (!sourceColumn || !targetColumn) return state;

            const taskToMove = sourceColumn.tasks.find((task) => task.id === taskId);
            if (!taskToMove) return state;

            return {
                columns: state.columns.map((column) => {
                    if (column.id === sourceColumnId) {
                        return {
                            ...column,
                            tasks: column.tasks.filter((task) => task.id !== taskId),
                        };
                    }

                    if (column.id === targetColumnId) {
                        return { ...column, tasks: [...column.tasks, taskToMove] };
                    }

                    return column;
                }),
            };
        }
        default:
            return state;
    }
}

export function KanbanProvider(props: PropsWithChildren) {
    const [state, dispatch] = useReducer(kanbanReducer, initialState); // TODO: get the initial data from the local storage.

    return <KanbanContext.Provider value={{ state, dispatch }}>{props.children}</KanbanContext.Provider>;
}
