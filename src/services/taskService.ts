import { v4 as uuid } from "uuid";

import { db } from "@/db/db";
import type { Task, TaskPriority } from "@/db/types";

export const TASK_POSITION_OFFSET = 1e4;
export const TASK_MIN_GAP = 1e-4;
export const TASK_MOVE_THRESHOLD = 10;

export const createTask = async (
    columnId: string,
    {
        title,
        description,
        priority,
        position,
    }: { title: string; description: string; priority: TaskPriority; position: number },
) => {
    const newTask: Task = {
        id: uuid(),
        columnId,
        title,
        description,
        priority,
        createdAt: Date.now(),
        position,
    };

    await db.tasks.add(newTask);

    return newTask;
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
// const moveCountMap = new Map<string, number>();

// const trackMoves = async (columnId: string) => {
//     const count = moveCountMap.get(columnId) || 0;

//     moveCountMap.set(columnId, count + 1);

//     if (count + 1 >= TASK_MOVE_THRESHOLD) {
//         await normalizeTaskPositions(columnId);
//         moveCountMap.set(columnId, 0);
//     }
// };

export const normalizeTaskPositions = async (columnId: string) => {
    const tasks = await db.tasks.where("columnId").equals(columnId).sortBy("position");

    for (let i = 0; i < tasks.length; i++) {
        await updateTask(tasks[i].id, { position: i * TASK_POSITION_OFFSET });
    }
};
