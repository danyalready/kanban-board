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

export function useBoardActions() {
    const addBoard = useCallback(async (name: string) => {
        let validName: string;

        try {
            validName = validateCreateBoardInput(name);
        } catch (error) {
            toast.error(getValidationMessage(error) ?? "Invalid board data.", {
                position: "top-center",
            });
            return;
        }

        try {
            await createBoard(validName);

            toast.success("Board has been created 🎉", { position: "top-center" });
        } catch (error) {
            toast.error(getValidationMessage(error) ?? "Something went wrong.", {
                position: "top-center",
            });
        }
    }, []);

    const updateBoard = useCallback(async (boardId: string, updates: Partial<Board>) => {
        let validUpdates: Partial<Board>;

        try {
            validUpdates = validateUpdateBoardInput(updates);
        } catch (error) {
            toast.error(getValidationMessage(error) ?? "Invalid board data.", {
                position: "top-center",
            });
            return;
        }

        if (Object.keys(validUpdates).length === 0) return;

        try {
            await svcUpdateBoard(boardId, validUpdates);

            toast.success("Board has been updated.", { position: "top-center" });
        } catch (error) {
            toast.error(getValidationMessage(error) ?? "Something went wrong.", {
                position: "top-center",
            });
        }
    }, []);

    const deleteBoard = useCallback(async (boardId: string) => {
        try {
            await svcDeleteBoard(boardId);

            toast.success("Board has been deleted.", { position: "top-center" });
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.", { position: "top-center" });
        }
    }, []);

    return { addBoard, updateBoard, deleteBoard };
}
