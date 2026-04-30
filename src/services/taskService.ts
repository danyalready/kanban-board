import { v4 as uuid } from "uuid";

import { db } from "@/db/db";
import type { Task, TaskPriority } from "@/db/types";
import {
    validateCreateTaskInput,
    validateRecordId,
    validateUpdateTaskInput,
} from "@/model/validation";

import { deleteComment } from "./commentService";

export const TASK_POSITION_OFFSET = 1e4;
export const TASK_MIN_GAP = 1e-4;
export const TASK_MOVE_THRESHOLD = 10;

export interface CreateTaskInput {
    title: string;
    description: string;
    priority: TaskPriority;
    position: number;
}

export const createTask = async (columnId: string, data: CreateTaskInput) => {
    const validInput = validateCreateTaskInput(columnId, data);

    const newTask: Task = {
        id: uuid(),
        columnId: validInput.columnId,
        createdAt: Date.now(),
        ...validInput.data,
    };
    await db.tasks.add(newTask);

    return newTask;
};

export const getTasksByColumn = async (columnId: string) => {
    return await db.tasks.where("columnId").equals(columnId).sortBy("position");
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
    const validId = validateRecordId(id, "Task ID");
    const validUpdates = validateUpdateTaskInput(updates);

    if (Object.keys(validUpdates).length === 0) return 0;

    return await db.tasks.update(validId, validUpdates);
};

export const deleteTask = async (taskId: string) => {
    await db.transaction("rw", db.comments, db.tasks, async () => {
        const comments = await db.comments.where("taskId").equals(taskId).toArray();

        for (const comment of comments) {
            await deleteComment(comment.id);
        }

        await db.tasks.delete(taskId);
    });
};

export const normalizeTaskPositions = async (columnId: string) => {
    return await db.transaction("rw", db.tasks, async () => {
        const tasks = await db.tasks.where("columnId").equals(columnId).sortBy("position");
        const updates = tasks.map((task, index) => ({
            ...task,
            position: (index + 1) * TASK_POSITION_OFFSET,
        }));

        await db.tasks.bulkPut(updates);

        return updates;
    });
};
