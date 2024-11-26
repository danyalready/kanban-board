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
    | { type: "UPDATE_COLUMN"; payload: { columnId: string; updatedColumn: Partial<Column> } }
    | { type: "DELETE_COLUMN"; payload: { columnId: string } }
    | { type: "ADD_TASK"; payload: { columnId: string; task: Task } }
    | { type: "UPDATE_TASK"; payload: { columnId: string; taskId: string; updatedTask: Partial<Task> } }
    | { type: "DELETE_TASK"; payload: { columnId: string; taskId: string } }
    | { type: "MOVE_TASK"; payload: { sourceColumnId: string; targetColumnId: string; taskId: string } };

export function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
    switch (action.type) {
        case "ADD_COLUMN": {
            const { id, title } = action.payload;

            return { columns: [...state.columns, { id, title, tasks: [] }] };
        }
        case "UPDATE_COLUMN": {
            const { columnId, updatedColumn } = action.payload;

            return {
                columns: state.columns.map((column) => {
                    if (column.id === columnId) {
                        return {
                            ...column,
                            ...updatedColumn,
                        };
                    }

                    return column;
                }),
            };
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
