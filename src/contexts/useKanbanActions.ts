import { useKanbanContext } from "./kanbanContext";
import { KanbanActionType, type KanbanState } from "@/reducers/kanbanTypes";
import {
    createColumn,
    updateColumn as svcUpdateColumn,
    deleteColumn as svcDeleteColumn,
} from "@/services/columnService";
import { COLUMN_POSITION_OFFSET } from "@/services/columnService";

export function useKanbanActions() {
    const { dispatch, state } = useKanbanContext();

    const setActive = (active: KanbanState["active"]) => {
        dispatch({ type: KanbanActionType.SetActive, payload: { active } });
    };

    const setState = (state: KanbanState) => {
        dispatch({ type: KanbanActionType.SetState, payload: { state } });
    };

    const moveColumn = async (columnId: string, targetIndex: number) => {
        // Optimistic reorder in UI
        dispatch({ type: KanbanActionType.MoveColumn, payload: { columnId, targetIndex } });

        // Compute new position within the same board and persist
        const moving = state.columns.find((c) => c.id === columnId);
        if (!moving) return;

        const inBoard = state.columns
            .filter((c) => c.boardId === moving.boardId)
            .sort((a, b) => a.position - b.position);

        const currentIndex = inBoard.findIndex((c) => c.id === columnId);
        if (currentIndex === -1 || targetIndex === -1) return;

        const before = inBoard[targetIndex - 1];
        const after = inBoard[targetIndex];

        let newPosition: number;
        if (before && after) {
            newPosition = (before.position + after.position) / 2;
        } else if (before) {
            newPosition = before.position + COLUMN_POSITION_OFFSET;
        } else if (after) {
            newPosition = Math.max(0, after.position - COLUMN_POSITION_OFFSET);
        } else {
            newPosition = COLUMN_POSITION_OFFSET;
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
        const created = await createColumn(boardId, name, position);
        dispatch({ type: KanbanActionType.AddColumn, payload: { name: created.name, boardId } });
    };

    const updateColumn = async (columnId: string, data: Partial<{ name: string; position: number }>) => {
        await svcUpdateColumn(columnId, data);
        dispatch({ type: KanbanActionType.UpdateColumn, payload: { columnId, data } });
    };

    const deleteColumn = async (columnId: string) => {
        await svcDeleteColumn(columnId);
        dispatch({ type: KanbanActionType.DeleteColumn, payload: { columnId } });
    };

    return { setActive, setState, moveColumn, moveTask, addColumn, updateColumn, deleteColumn };
}
