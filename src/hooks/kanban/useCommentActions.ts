import { useCallback } from "react";
import { toast } from "sonner";

import { useKanbanContext } from "@/contexts/kanbanContext";
import type { Comment } from "@/db/types";
import { KanbanActionType } from "@/reducers/kanbanTypes";
import {
    createComment as svcCreateComment,
    deleteComment as svcDeleteComment,
    updateComment as svcUpdateComment,
} from "@/services/commentService";

export function useCommentActions() {
    const { dispatch, state } = useKanbanContext();

    const addComment = useCallback(
        async (taskId: string, text: string) => {
            const trimmedText = text.trim();

            if (!trimmedText) return;

            try {
                const comment = await svcCreateComment(taskId, trimmedText);

                dispatch({ type: KanbanActionType.AddComment, payload: { comment } });
            } catch (error) {
                console.error(error);
                toast.error("Something went wrong while adding comment.", {
                    position: "top-center",
                });
            }
        },
        [dispatch],
    );

    const updateComment = useCallback(
        async (commentId: string, data: Partial<Pick<Comment, "text">>) => {
            const prevComment = state.comments.find((comment) => comment.id === commentId);

            if (!prevComment) return;

            const nextText = data.text?.trim();

            if (!nextText) {
                toast.error("Comment cannot be empty.", { position: "top-center" });
                return;
            }

            const updates = { ...data, text: nextText };

            dispatch({
                type: KanbanActionType.UpdateComment,
                payload: { commentId, data: updates },
            });

            try {
                await svcUpdateComment(commentId, updates);
            } catch (error) {
                dispatch({
                    type: KanbanActionType.UpdateComment,
                    payload: { commentId, data: { text: prevComment.text } },
                });
                console.error(error);
                toast.error("Something went wrong while updating comment.", {
                    position: "top-center",
                });
            }
        },
        [dispatch, state.comments],
    );

    const deleteComment = useCallback(
        async (commentId: string) => {
            const prevComments = state.comments;

            dispatch({ type: KanbanActionType.DeleteComment, payload: { commentId } });

            try {
                await svcDeleteComment(commentId);
            } catch (error) {
                dispatch({
                    type: KanbanActionType.SetComments,
                    payload: { comments: prevComments },
                });
                console.error(error);
                toast.error("Something went wrong while deleting comment.", {
                    position: "top-center",
                });
            }
        },
        [dispatch, state.comments],
    );

    return { addComment, updateComment, deleteComment };
}
