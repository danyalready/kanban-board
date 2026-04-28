import type { Comment } from "@/db/types";

export const countCommentsByTaskId = (taskId: string, comments: Comment[]) =>
    comments.reduce((p, c) => (c.taskId === taskId ? p + 1 : p), 0);
