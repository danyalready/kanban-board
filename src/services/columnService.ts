import { v4 as uuid } from "uuid";

import { db } from "@/db/db";
import type { Column } from "@/db/types";

import { deleteTask } from "./taskService";

export const COLUMN_POSITION_OFFSET = 10;

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

export const moveColumn = async (columnId: string, targetIndex: number) => {
    if (targetIndex === -1) return;

    const moving = await db.columns.get(columnId);
    if (!moving) return;

    // Work only within the same board and use sorted-by-position source of truth
    const boardColumns = await db.columns.where("boardId").equals(moving.boardId).sortBy("position");
    const withoutMoving = boardColumns.filter((c) => c.id !== columnId);

    // Clamp target index to valid range within simulated array
    const clampedIndex = Math.max(0, Math.min(targetIndex, withoutMoving.length));

    // Simulate the new order by inserting moving at clampedIndex
    const simulated = [...withoutMoving.slice(0, clampedIndex), moving, ...withoutMoving.slice(clampedIndex)];
    const newIndex = simulated.findIndex((c) => c.id === columnId);

    const before = simulated[newIndex - 1];
    const after = simulated[newIndex + 1];

    let newPosition: number;
    if (before && after) {
        newPosition = (before.position + after.position) / 2;
    } else if (before) {
        newPosition = before.position + COLUMN_POSITION_OFFSET;
    } else if (after) {
        newPosition = Math.max(0, after.position - COLUMN_POSITION_OFFSET);
    } else {
        // Only column in board
        newPosition = COLUMN_POSITION_OFFSET;
    }

    await updateColumn(columnId, { position: newPosition });
};

export const deleteColumn = async (columnId: string) => {
    const tasks = await db.tasks.where("columnId").equals(columnId).toArray();

    for (const task of tasks) {
        await deleteTask(task.id); // cascade
    }

    return await db.columns.delete(columnId);
};
