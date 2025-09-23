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

export const moveColumn = async (columnId: string, targetIndex: number, columns: Column[]) => {
    const currentIndex = columns.findIndex((c) => c.id === columnId);
    if (currentIndex === -1 || targetIndex === -1) return;

    let newPosition: number;

    if (targetIndex === 0) {
        // Move to start: place before the first column
        const first = columns[0];
        newPosition = first ? first.position - COLUMN_POSITION_OFFSET : COLUMN_POSITION_OFFSET;
    } else if (targetIndex >= columns.length - 1) {
        // Move to end: place after the last column
        const last = columns[columns.length - 1];
        newPosition = last ? last.position + COLUMN_POSITION_OFFSET : COLUMN_POSITION_OFFSET;
    } else {
        // Move between two columns (fix for left-to-right move)
        let before, after;
        if (targetIndex > currentIndex) {
            // Moving right: after dropping, the column will be at targetIndex,
            // so before = columns[targetIndex], after = columns[targetIndex + 1]
            before = columns[targetIndex];
            after = columns[targetIndex + 1];
        } else {
            // Moving left or to same: before = columns[targetIndex - 1], after = columns[targetIndex]
            before = columns[targetIndex - 1];
            after = columns[targetIndex];
        }

        if (before && after) {
            newPosition = (before.position + after.position) / 2;
        } else if (before) {
            newPosition = before.position + COLUMN_POSITION_OFFSET;
        } else if (after) {
            newPosition = Math.max(0, after.position - COLUMN_POSITION_OFFSET);
        } else {
            newPosition = COLUMN_POSITION_OFFSET;
        }
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
