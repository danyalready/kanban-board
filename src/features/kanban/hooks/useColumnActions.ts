import { useCallback } from "react";
import { toast } from "sonner";

import {
    createColumn as svcCreateColumn,
    updateColumn as svcUpdateColumn,
    deleteColumn as svcDeleteColumn,
    normalizeColumnsPositions as svcNormalizeColumnsPositions,
} from "@/domain/kanban/services/columnService";
import { KanbanActionType } from "@/app/kanban/types";
import { COLUMN_POSITION_OFFSET } from "@/domain/kanban/constants";
import {
    calculateColumnPosition,
    needsColumnPositionNormalization,
} from "@/domain/kanban/columnOrdering";
import {
    getValidationMessage,
    validateCreateColumnInput,
    validateUpdateColumnInput,
} from "@/domain/kanban/validation";
import { useKanban } from "@/app/kanban/useKanban";
import { t } from "@/shared/i18n";

export function useColumnActions() {
    const { dispatch, state } = useKanban();

    const addColumn = useCallback(
        async (boardId: string, name: string) => {
            const columnsInBoard = state.columns.filter((c) => c.boardId === boardId);
            const maxPosition = columnsInBoard.length
                ? Math.max(...columnsInBoard.map((c) => c.position))
                : 0;
            const position = maxPosition + COLUMN_POSITION_OFFSET;
            let validData: ReturnType<typeof validateCreateColumnInput>;

            try {
                validData = validateCreateColumnInput(boardId, name, position);
            } catch (error) {
                toast.error(getValidationMessage(error) ?? t("feedback.invalidColumnData"), {
                    position: "top-center",
                });
                return;
            }

            try {
                const column = await svcCreateColumn(
                    validData.boardId,
                    validData.name,
                    validData.position,
                );

                dispatch({
                    type: KanbanActionType.SetColumns,
                    payload: { columns: [...state.columns, column] },
                });

                toast.success(t("feedback.columnCreated"), { position: "top-center" });
            } catch (error) {
                toast.error(getValidationMessage(error) ?? t("feedback.somethingWentWrong"), {
                    position: "top-center",
                });
            }
        },
        [dispatch, state.columns],
    );

    const updateColumn = useCallback(
        async (columnId: string, data: Partial<{ name: string; position: number }>) => {
            let validData: ReturnType<typeof validateUpdateColumnInput>;

            try {
                validData = validateUpdateColumnInput(data);
            } catch (error) {
                toast.error(getValidationMessage(error) ?? t("feedback.invalidColumnData"), {
                    position: "top-center",
                });
                return;
            }

            if (Object.keys(validData).length === 0) return;

            try {
                await svcUpdateColumn(columnId, validData);

                dispatch({
                    type: KanbanActionType.UpdateColumn,
                    payload: { columnId, data: validData },
                });

                toast.success(t("feedback.columnUpdated"), { position: "top-center" });
            } catch (error) {
                toast.error(getValidationMessage(error) ?? t("feedback.somethingWentWrong"), {
                    position: "top-center",
                });
            }
        },
        [dispatch],
    );

    const moveColumn = useCallback(
        async (columnId: string, targetIndex: number) => {
            const activeColumn = state.columns.find((column) => column.id === columnId);

            if (!activeColumn) return;

            const columnsInBoard = state.columns
                .filter((column) => column.boardId === activeColumn.boardId)
                .sort((a, b) => a.position - b.position);
            const activeIndex = columnsInBoard.findIndex((column) => column.id === columnId);

            if (activeIndex === -1 || targetIndex === -1 || activeIndex === targetIndex) return;

            const updatedPosition = calculateColumnPosition(
                columnsInBoard,
                activeIndex,
                targetIndex,
            );
            let validMoveData: ReturnType<typeof validateUpdateColumnInput>;

            try {
                validMoveData = validateUpdateColumnInput({ position: updatedPosition });
            } catch (error) {
                toast.error(getValidationMessage(error) ?? t("feedback.invalidColumnPosition"), {
                    position: "top-center",
                });
                return;
            }

            const prevState = structuredClone(state);

            // Optimistically reorder in UI first
            dispatch({
                type: KanbanActionType.UpdateColumn,
                payload: { columnId, data: validMoveData },
            });

            try {
                await svcUpdateColumn(columnId, validMoveData);

                const nextBoardColumns = columnsInBoard
                    .map((column) =>
                        column.id === columnId ? { ...column, ...validMoveData } : column,
                    )
                    .sort((a, b) => a.position - b.position);

                if (needsColumnPositionNormalization(nextBoardColumns)) {
                    const normalizedColumns = await svcNormalizeColumnsPositions(
                        activeColumn.boardId,
                    );
                    const normalizedColumnMap = new Map(
                        normalizedColumns.map((column) => [column.id, column]),
                    );

                    dispatch({
                        type: KanbanActionType.SetColumns,
                        payload: {
                            columns: state.columns.map(
                                (column) => normalizedColumnMap.get(column.id) ?? column,
                            ),
                        },
                    });
                }
            } catch (error) {
                dispatch({ type: KanbanActionType.SetState, payload: { state: prevState } });
                toast.error(t("feedback.moveColumnFailed", { name: activeColumn.name }));

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

                toast.success(t("feedback.columnDeleted"), { position: "top-center" });
            } catch (error) {
                console.error(error);
                toast.error(t("feedback.somethingWentWrong"), { position: "top-center" });
            }
        },
        [dispatch],
    );

    return { addColumn, updateColumn, moveColumn, deleteColumn };
}
