import { useCallback } from "react";
import { toast } from "sonner";

import {
    createBoard,
    updateBoard as svcUpdateBoard,
    deleteBoard as svcDeleteBoard,
} from "@/services/boardService";
import type { Board } from "@/db/types";

export function useBoardActions() {
    const addBoard = useCallback(async (name: string) => {
        const trimmedName = name.trim();

        if (!trimmedName) return;

        try {
            await createBoard(trimmedName);

            toast.success("Board has been created 🎉", { position: "top-center" });
        } catch {
            toast.error("Something went wrong.", { position: "top-center" });
        }
    }, []);

    const updateBoard = useCallback(async (boardId: string, updates: Partial<Board>) => {
        try {
            await svcUpdateBoard(boardId, updates);

            toast.success("Board has been updated.", { position: "top-center" });
        } catch {
            toast.error("Something went wrong.", { position: "top-center" });
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
