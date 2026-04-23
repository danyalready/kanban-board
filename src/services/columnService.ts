import { v4 as uuid } from "uuid";

import { db } from "@/db/db";
import type { Column } from "@/db/types";

import { deleteTask } from "./taskService";

export const COLUMN_POSITION_OFFSET = 1e4;

export const createColumn = async (boardId: string, name: string, position: number) => {
    const column: Column = { id: uuid(), boardId, name, position, createdAt: Date.now() };

    await db.columns.add(column);

    return column;
};

export const getColumnsByBoard = async (boardId: string) => {
    return await db.columns.where("boardId").equals(boardId).sortBy("position");
};

export const updateColumn = async (id: string, updates: Partial<Column>) => {
    return await db.columns.update(id, updates);
};

export const normalizeColumnsPositions = async (boardId: string) => {
    const columns = await getColumnsByBoard(boardId);

    for (let i = 0; i < columns.length; i++) {
        await updateColumn(columns[i].id, { position: i * COLUMN_POSITION_OFFSET });
    }
};

export const deleteColumn = async (columnId: string) => {
    await db.transaction("rw", db.comments, db.tasks, db.columns, async () => {
        const tasks = await db.tasks.where("columnId").equals(columnId).toArray();

        for (const task of tasks) {
            await deleteTask(task.id);
        }

        await db.columns.delete(columnId);
    });
};
