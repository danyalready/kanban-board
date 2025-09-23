import { KanbanActionType, type KanbanState } from "@/reducers/kanbanTypes";
import {
    createColumn,
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

    const setActive = (active: KanbanState["active"]) => {
        dispatch({ type: KanbanActionType.SetActive, payload: { active } });
    };

    const setState = (state: KanbanState) => {
        dispatch({ type: KanbanActionType.SetState, payload: { state } });
    };

    // On-demand loaders
    const loadBoardData = async (boardId: string) => {
        const columns = await getColumnsByBoard(boardId);
        dispatch({ type: KanbanActionType.SetColumns, payload: { columns } });

        // Load tasks for those columns
        const allTasks = (await Promise.all(columns.map((c) => getTasksByColumn(c.id)))).flat();
        dispatch({ type: KanbanActionType.SetTasks, payload: { tasks: allTasks } });

        // Load comments for those tasks
        const allComments = (await Promise.all(allTasks.map((t) => getCommentsByTask(t.id)))).flat();
        dispatch({ type: KanbanActionType.SetComments, payload: { comments: allComments } });
    };

    const clearBoardData = () => {
        dispatch({ type: KanbanActionType.ClearBoardData });
    };

    const moveColumn = async (columnId: string, targetIndex: number) => {
        // Optimistic reorder in UI
        dispatch({ type: KanbanActionType.MoveColumn, payload: { columnId, targetIndex } });

        // Compute new position within the same board and persist
        const moving = state.columns.find((c) => c.id === columnId);
        if (!moving) return;

        const boardColumns = state.columns
            .filter((c) => c.boardId === moving.boardId)
            .sort((a, b) => a.position - b.position);

        const currentIndex = boardColumns.findIndex((c) => c.id === columnId);
        if (currentIndex === -1 || targetIndex === -1) return;

        let newPosition: number;

        if (targetIndex === 0) {
            // Move to start: place before the first column
            const first = boardColumns[0];
            newPosition = first ? first.position - COLUMN_POSITION_OFFSET : COLUMN_POSITION_OFFSET;
        } else if (targetIndex >= boardColumns.length - 1) {
            // Move to end: place after the last column
            const last = boardColumns[boardColumns.length - 1];
            newPosition = last ? last.position + COLUMN_POSITION_OFFSET : COLUMN_POSITION_OFFSET;
        } else {
            // Move between two columns (fix for left-to-right move)
            let before, after;
            if (targetIndex > currentIndex) {
                // Moving right: after dropping, the column will be at targetIndex,
                // so before = boardColumns[targetIndex], after = boardColumns[targetIndex + 1]
                before = boardColumns[targetIndex];
                after = boardColumns[targetIndex + 1];
            } else {
                // Moving left or to same: before = boardColumns[targetIndex - 1], after = boardColumns[targetIndex]
                before = boardColumns[targetIndex - 1];
                after = boardColumns[targetIndex];
            }

            if (before && after) {
                newPosition = (before.position + after.position) / 2;
            } else if (before) {
                newPosition = before.position + COLUMN_POSITION_OFFSET;
            } else if (after) {
                newPosition = Math.max(0, after.position - COLUMN_POSITION_OFFSET);
            } else {
                newPosition = COLUMN_POSITION_OFFSET;
            }
        }

        await svcUpdateColumn(columnId, { position: newPosition });
    };

    const moveTask = (args: {
        taskId: string;
        targetIndex: number;
        sourceColumnId: string;
        targetColumnId: string;
    }) => {
        dispatch({ type: KanbanActionType.MoveTask, payload: args });
    };

    const addColumn = async (boardId: string, name: string) => {
        const columnsInBoard = state.columns.filter((c) => c.boardId === boardId);
        const maxPosition = columnsInBoard.length ? Math.max(...columnsInBoard.map((c) => c.position)) : 0;
        const position = maxPosition + COLUMN_POSITION_OFFSET;

        await createColumn(boardId, name, position);
    };

    const updateColumn = async (columnId: string, data: Partial<{ name: string; position: number }>) => {
        await svcUpdateColumn(columnId, data);

        dispatch({ type: KanbanActionType.UpdateColumn, payload: { columnId, data } });
    };

    const deleteColumn = async (columnId: string) => {
        await svcDeleteColumn(columnId);

        dispatch({ type: KanbanActionType.DeleteColumn, payload: { columnId } });
    };

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
