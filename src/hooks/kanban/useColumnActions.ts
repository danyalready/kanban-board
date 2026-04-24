import { useCallback } from "react";

import { useKanbanContext } from "@/contexts/kanbanContext";
import {
    createColumn as svcCreateColumn,
    updateColumn as svcUpdateColumn,
    deleteColumn as svcDeleteColumn,
    COLUMN_POSITION_OFFSET,
} from "@/services/columnService";
import { KanbanActionType } from "@/reducers/kanbanTypes";
import { toast } from "sonner";
import { calculateColumnPosition } from "@/model/column-ordering";

export function useColumnActions() {
    const { dispatch, state } = useKanbanContext();

    const addColumn = useCallback(
        async (boardId: string, name: string) => {
            const columnsInBoard = state.columns.filter((c) => c.boardId === boardId);
            const maxPosition = columnsInBoard.length
                ? Math.max(...columnsInBoard.map((c) => c.position))
                : 0;
            const position = maxPosition + COLUMN_POSITION_OFFSET;

            try {
                const column = await svcCreateColumn(boardId, name, position);

                dispatch({
                    type: KanbanActionType.SetColumns,
                    payload: { columns: [...state.columns, column] },
                });

                toast.success("Column has been created 🎉", { position: "top-center" });
            } catch {
                toast.error("Something went wrong.", { position: "top-center" });
            }
        },
        [dispatch, state.columns],
    );

    const updateColumn = useCallback(
        async (columnId: string, data: Partial<{ name: string; position: number }>) => {
            try {
                await svcUpdateColumn(columnId, data);

                dispatch({ type: KanbanActionType.UpdateColumn, payload: { columnId, data } });

                toast.success("Column has been updated", { position: "top-center" });
            } catch {
                toast.error("Something went wrong.", { position: "top-center" });
            }
        },
        [dispatch],
    );

    const moveColumn = useCallback(
        async (columnId: string, targetIndex: number) => {
            const activeIndex = state.columns.findIndex((column) => column.id === columnId);
            const updatedPosition = calculateColumnPosition(
                state.columns,
                activeIndex,
                targetIndex,
            );

            // Optimistically reorder in UI first
            dispatch({
                type: KanbanActionType.UpdateColumn,
                payload: { columnId, data: { position: updatedPosition } },
            });

            const prevState = structuredClone(state);

            try {
                await svcUpdateColumn(columnId, { position: updatedPosition });
            } catch (error) {
                dispatch({ type: KanbanActionType.SetState, payload: { state: prevState } });
                console.error("error", error);
            }
        },
        [dispatch, state],
    );

    const deleteColumn = useCallback(
        async (columnId: string) => {
            try {
                await svcDeleteColumn(columnId);

                dispatch({ type: KanbanActionType.DeleteColumn, payload: { columnId } });

                toast.success("Column has been deleted.", { position: "top-center" });
            } catch (error) {
                console.error(error);
                toast.error("Something went wrong.", { position: "top-center" });
            }
        },
        [dispatch],
    );

    return { addColumn, updateColumn, moveColumn, deleteColumn };
}
