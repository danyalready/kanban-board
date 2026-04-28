import { v4 as uuid } from "uuid";

import { db } from "@/db/db";
import type { Comment } from "@/db/types";

export const createComment = async (taskId: string, text: string) => {
    const trimmedText = text.trim();

    if (!trimmedText.length) throw new Error("Text cannot be empty.");

    const comment: Comment = {
        id: uuid(),
        taskId,
        text,
        createdAt: Date.now(),
    };
    await db.comments.add(comment);

    return comment;
};

export const getCommentsByTask = async (taskId: string) => {
    return await db.comments.where("taskId").equals(taskId).sortBy("createdAt");
};

export const updateComment = async (id: string, updates: Partial<Comment>) => {
    return await db.comments.update(id, updates);
};

export const deleteComment = async (id: string) => {
    await db.comments.delete(id);
};
