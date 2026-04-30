import { useCallback } from "react";
import { toast } from "sonner";

import {
    createBoard,
    updateBoard as svcUpdateBoard,
    deleteBoard as svcDeleteBoard,
} from "@/domain/kanban/services/boardService";
import type { Board } from "@/domain/kanban/types";
import {
    getValidationMessage,
    validateCreateBoardInput,
    validateUpdateBoardInput,
} from "@/domain/kanban/validation";
import { t } from "@/shared/i18n";

export function useBoardActions() {
    const addBoard = useCallback(async (name: string) => {
        let validName: string;

        try {
            validName = validateCreateBoardInput(name);
        } catch (error) {
            toast.error(getValidationMessage(error) ?? t("feedback.invalidBoardData"), {
                position: "top-center",
            });
            return;
        }

        try {
            await createBoard(validName);

            toast.success(t("feedback.boardCreated"), { position: "top-center" });
        } catch (error) {
            toast.error(getValidationMessage(error) ?? t("feedback.somethingWentWrong"), {
                position: "top-center",
            });
        }
    }, []);

    const updateBoard = useCallback(async (boardId: string, updates: Partial<Board>) => {
        let validUpdates: Partial<Board>;

        try {
            validUpdates = validateUpdateBoardInput(updates);
        } catch (error) {
            toast.error(getValidationMessage(error) ?? t("feedback.invalidBoardData"), {
                position: "top-center",
            });
            return;
        }

        if (Object.keys(validUpdates).length === 0) return;

        try {
            await svcUpdateBoard(boardId, validUpdates);

            toast.success(t("feedback.boardUpdated"), { position: "top-center" });
        } catch (error) {
            toast.error(getValidationMessage(error) ?? t("feedback.somethingWentWrong"), {
                position: "top-center",
            });
        }
    }, []);

    const deleteBoard = useCallback(async (boardId: string) => {
        try {
            await svcDeleteBoard(boardId);

            toast.success(t("feedback.boardDeleted"), { position: "top-center" });
        } catch (error) {
            console.error(error);
            toast.error(t("feedback.somethingWentWrong"), { position: "top-center" });
        }
    }, []);

    return { addBoard, updateBoard, deleteBoard };
}
