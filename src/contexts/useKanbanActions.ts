import { createColumn, updateColumn, getColumnsByBoard, deleteColumn } from "@/services/columnService";
import { createTask, updateTask, deleteTask, moveTask as svcMoveTask } from "@/services/taskService";
import { KanbanActionType } from "@/reducers/kanbanTypes";

import { useKanbanContext } from "./kanbanContext";

export const useKanbanActions = () => {
    const { dispatch } = useKanbanContext();

    const addColumn = async (boardId: string, name: string) => {
        const cols = await getColumnsByBoard(boardId);
        const last = cols.at(-1);
        const position = last ? last.position + 10 : 10;
        const column = await createColumn(boardId, name, position);

        dispatch({ type: KanbanActionType.AddColumn, payload: { name: column.name, boardId } });
    };

    const moveTask = async (args: {
        taskId: string;
        targetColumnId: string;
        targetIndex: number;
        sourceColumnId: string;
    }) => {
        dispatch({ type: KanbanActionType.MoveTask, payload: args }); // optimistic

        await svcMoveTask({ taskId: args.taskId, newColumnId: args.targetColumnId }); // persists
    };

    return { addColumn, moveTask, updateColumn, deleteColumn, createTask, updateTask, deleteTask };
};
