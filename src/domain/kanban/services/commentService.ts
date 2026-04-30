import { v4 as uuid } from "uuid";

import { db } from "@/shared/lib/db";
import type { Comment } from "@/domain/kanban/types";
import {
    validateCreateCommentInput,
    validateRecordId,
    validateUpdateCommentInput,
} from "@/domain/kanban/validation";

export const createComment = async (taskId: string, text: string) => {
    const validData = validateCreateCommentInput(taskId, text);

    const comment: Comment = {
        id: uuid(),
        taskId: validData.taskId,
        text: validData.text,
        createdAt: Date.now(),
    };
    await db.comments.add(comment);

    return comment;
};

export const getCommentsByTask = async (taskId: string) => {
    return await db.comments.where("taskId").equals(taskId).sortBy("createdAt");
};

export const updateComment = async (id: string, updates: Partial<Comment>) => {
    const validId = validateRecordId(id, "Comment ID");
    const validUpdates = validateUpdateCommentInput(updates);

    if (Object.keys(validUpdates).length === 0) return 0;

    return await db.comments.update(validId, validUpdates);
};

export const deleteComment = async (id: string) => {
    await db.comments.delete(id);
};
