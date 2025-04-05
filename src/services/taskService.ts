import { v4 as uuid } from "uuid";

import { db } from "@/db/db";
import type { Task } from "@/db/types";

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
