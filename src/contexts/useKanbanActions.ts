import { useCallback } from "react";

import { KanbanActionType, type KanbanState } from "@/reducers/kanbanTypes";
import {
    createColumn as svcCreateColumn,
    moveColumn as svcMoveColumn,
    updateColumn as svcUpdateColumn,
    deleteColumn as svcDeleteColumn,
} from "@/services/columnService";
import { COLUMN_POSITION_OFFSET } from "@/services/columnService";
import { getColumnsByBoard } from "@/services/columnService";
import { getTasksByColumn } from "@/services/taskService";
import { getCommentsByTask } from "@/services/commentService";

import { useKanbanContext } from "./kanbanContext";

export function useKanbanActions() {
    const { dispatch, state } = useKanbanContext();

    const setActive = useCallback(
        (active: KanbanState["active"]) => {
            dispatch({ type: KanbanActionType.SetActive, payload: { active } });
        },
        [dispatch],
    );

    const setState = useCallback(
        (state: KanbanState) => {
            dispatch({ type: KanbanActionType.SetState, payload: { state } });
        },
        [dispatch],
    );

    // On-demand loaders
    const loadBoardData = useCallback(
        async (boardId: string) => {
            const columns = await getColumnsByBoard(boardId);
            dispatch({ type: KanbanActionType.SetColumns, payload: { columns } });

            // Load tasks for those columns
            const allTasks = (await Promise.all(columns.map((c) => getTasksByColumn(c.id)))).flat();
            dispatch({ type: KanbanActionType.SetTasks, payload: { tasks: allTasks } });

            // Load comments for those tasks
            const allComments = (await Promise.all(allTasks.map((t) => getCommentsByTask(t.id)))).flat();
            dispatch({ type: KanbanActionType.SetComments, payload: { comments: allComments } });
        },
        [dispatch],
    );

    const clearBoardData = useCallback(() => {
        dispatch({ type: KanbanActionType.ClearBoardData });
    }, [dispatch]);

    const moveColumn = useCallback(
        async (columnId: string, targetIndex: number) => {
            // Optimistic reorder in UI
            dispatch({ type: KanbanActionType.MoveColumn, payload: { columnId, targetIndex } });

            // Compute new position within the same board and persist
            const moving = state.columns.find((c) => c.id === columnId);
            if (!moving) return;

            await svcMoveColumn(columnId, targetIndex);
        },
        [dispatch, state.columns],
    );

    const moveTask = useCallback(
        (args: { taskId: string; targetIndex: number; sourceColumnId: string; targetColumnId: string }) => {
            dispatch({ type: KanbanActionType.MoveTask, payload: args });
        },
        [dispatch],
    );

    const addColumn = useCallback(
        async (boardId: string, name: string) => {
            const columnsInBoard = state.columns.filter((c) => c.boardId === boardId);
            const maxPosition = columnsInBoard.length ? Math.max(...columnsInBoard.map((c) => c.position)) : 0;
            const position = maxPosition + COLUMN_POSITION_OFFSET;

            await svcCreateColumn(boardId, name, position);
        },
        [state.columns],
    );

    const updateColumn = useCallback(
        async (columnId: string, data: Partial<{ name: string; position: number }>) => {
            await svcUpdateColumn(columnId, data);

            dispatch({ type: KanbanActionType.UpdateColumn, payload: { columnId, data } });
        },
        [dispatch],
    );

    const deleteColumn = useCallback(
        async (columnId: string) => {
            await svcDeleteColumn(columnId);

            dispatch({ type: KanbanActionType.DeleteColumn, payload: { columnId } });
        },
        [dispatch],
    );

    return {
        setActive,
        setState,
        loadBoardData,
        clearBoardData,
        moveColumn,
        moveTask,
        addColumn,
        updateColumn,
        deleteColumn,
    };
}
