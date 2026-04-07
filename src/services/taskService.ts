import { v4 as uuid } from "uuid";

import { db } from "@/db/db";
import type { Task } from "@/db/types";
import { calculateTaskPosition } from "@/model/task-ordering";

export const TASK_POSITION_OFFSET = 1e4;
export const TASK_MIN_GAP = 1e-4;
export const TASK_MOVE_THRESHOLD = 10;

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

// TODO: store in local-storage
const moveCountMap = new Map<string, number>();

const trackMoves = async (columnId: string) => {
    const count = moveCountMap.get(columnId) || 0;

    moveCountMap.set(columnId, count + 1);

    if (count + 1 >= TASK_MOVE_THRESHOLD) {
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
    targetIndex,
    sourceColumnId,
    targetColumnId,
}: {
    taskId: string;
    targetIndex: number;
    sourceColumnId: string;
    targetColumnId: string;
}) => {
    const sourceTasks = await getTasksByColumn(sourceColumnId);
    const targetTasks =
        sourceColumnId === targetColumnId ? sourceTasks : await getTasksByColumn(targetColumnId);

    const index = targetIndex === -1 ? targetTasks.length : targetIndex;
    const newPosition = calculateTaskPosition(targetTasks, index);

    await updateTask(taskId, {
        columnId: targetColumnId,
        position: newPosition,
    });

    await trackMoves(targetColumnId);
};
