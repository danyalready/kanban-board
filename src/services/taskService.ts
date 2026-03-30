import { v4 as uuid } from "uuid";

import { db } from "@/db/db";
import type { Task } from "@/db/types";

export const TASK_POSITION_OFFSET = 1e4;
export const TASK_MIN_GAP = 1e-4;

export const createTask = async (columnId: string, title: string, position: number) => {
    const task: Task = {
        id: uuid(),
        columnId,
        title,
        description: "",
        priority: "low",
        createdAt: Date.now(),
        position,
    };

    await db.tasks.add(task);

    return task;
};

export const getTasksByColumn = async (columnId: string) => {
    return await db.tasks.where("columnId").equals(columnId).sortBy("position");
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
    return await db.tasks.update(id, updates);
};

export const deleteTask = async (taskId: string) => {
    await db.comments.where("taskId").equals(taskId).delete(); // cascade

    return await db.tasks.delete(taskId);
};

const moveCountMap = new Map<string, number>();

const trackMoves = async (columnId: string) => {
    const count = moveCountMap.get(columnId) || 0;

    moveCountMap.set(columnId, count + 1);

    if (count + 1 >= 10) {
        await normalizeTaskPositions(columnId);
        moveCountMap.set(columnId, 0);
    }
};

export const normalizeTaskPositions = async (columnId: string) => {
    const tasks = await db.tasks.where("columnId").equals(columnId).sortBy("position");

    for (let i = 0; i < tasks.length; i++) {
        await updateTask(tasks[i].id, { position: i * TASK_POSITION_OFFSET });
    }
};

export const moveTask = async ({
    taskId,
    newColumnId,
    beforeTaskId,
    afterTaskId,
}: {
    taskId: string;
    newColumnId: string;
    beforeTaskId?: string;
    afterTaskId?: string;
}) => {
    const task = await db.tasks.get(taskId);

    if (!task) throw new Error("Task not found");

    let newPosition: number;

    if (beforeTaskId && afterTaskId) {
        const before = await db.tasks.get(beforeTaskId);
        const after = await db.tasks.get(afterTaskId);

        if (!before || !after) throw new Error("Reference task not found");

        newPosition = (before.position + after.position) / 2;
    } else if (beforeTaskId) {
        const before = await db.tasks.get(beforeTaskId);

        if (!before) throw new Error("Reference task not found");

        newPosition = before.position + TASK_POSITION_OFFSET;
    } else if (afterTaskId) {
        const after = await db.tasks.get(afterTaskId);

        if (!after) throw new Error("Reference task not found");

        newPosition = after.position - TASK_POSITION_OFFSET;
    } else {
        // insert at end
        const tasks = await db.tasks.where("columnId").equals(newColumnId).sortBy("position");

        newPosition = tasks.length
            ? tasks[tasks.length - 1].position + TASK_POSITION_OFFSET
            : TASK_POSITION_OFFSET;
    }

    await db.tasks.update(taskId, {
        columnId: newColumnId,
        position: newPosition,
    });

    await trackMoves(newColumnId);
};
