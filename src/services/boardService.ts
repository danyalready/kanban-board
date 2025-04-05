import { v4 as uuid } from "uuid";

import { db } from "@/db/db";
import type { Board } from "@/db/types";

export const createBoard = async (name: string) => {
    const board = { id: uuid(), name, createdAt: Date.now() };
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
    return await db.boards.update(id, updates);
};

export const deleteBoard = async (id: string) => {
    await db.columns.where("boardId").equals(id).delete(); // cascade
    return await db.boards.delete(id);
};
