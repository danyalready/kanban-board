import { v4 as uuid } from "uuid";

import { db } from "@/db/db";
import type { Board } from "@/db/types";
import {
    validateCreateBoardInput,
    validateRecordId,
    validateUpdateBoardInput,
} from "@/model/validation";

import { deleteColumn } from "./columnService";

export const createBoard = async (name: string) => {
    const validName = validateCreateBoardInput(name);

    const board = { id: uuid(), name: validName, createdAt: Date.now() };
    await db.boards.add(board);

    return board;
};

export const getAllBoards = async () => {
    return await db.boards.toArray();
};

export const getBoard = async (id: string) => {
    return await db.boards.get(id);
};

export const updateBoard = async (id: string, updates: Partial<Board>) => {
    const validId = validateRecordId(id, "Board ID");
    const validUpdates = validateUpdateBoardInput(updates);

    if (Object.keys(validUpdates).length === 0) return 0;

    return await db.boards.update(validId, validUpdates);
};

export const deleteBoard = async (boardId: string) => {
    await db.transaction("rw", db.comments, db.tasks, db.columns, db.boards, async () => {
        const columns = await db.columns.where("boardId").equals(boardId).toArray();

        for (const column of columns) {
            await deleteColumn(column.id);
        }

        await db.boards.delete(boardId);
    });
};
