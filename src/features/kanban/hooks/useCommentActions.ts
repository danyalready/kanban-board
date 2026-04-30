import { useCallback } from "react";
import { toast } from "sonner";

import type { Comment } from "@/domain/kanban/types";
import { KanbanActionType } from "@/app/kanban/types";
import {
    createComment as svcCreateComment,
    deleteComment as svcDeleteComment,
    updateComment as svcUpdateComment,
} from "@/domain/kanban/services/commentService";
import {
    getValidationMessage,
    validateCreateCommentInput,
    validateUpdateCommentInput,
} from "@/domain/kanban/validation";
import { useKanban } from "@/app/kanban/useKanban";
import { t } from "@/shared/i18n";

export function useCommentActions() {
    const { dispatch, state } = useKanban();

    const addComment = useCallback(
        async (taskId: string, text: string) => {
            let validData: ReturnType<typeof validateCreateCommentInput>;

            try {
                validData = validateCreateCommentInput(taskId, text);
            } catch (error) {
                toast.error(getValidationMessage(error) ?? t("feedback.invalidCommentData"), {
                    position: "top-center",
                });
                return;
            }

            try {
                const comment = await svcCreateComment(validData.taskId, validData.text);

                dispatch({ type: KanbanActionType.AddComment, payload: { comment } });
            } catch (error) {
                console.error(error);
                toast.error(getValidationMessage(error) ?? t("feedback.addCommentFailed"), {
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

            let updates: ReturnType<typeof validateUpdateCommentInput>;

            try {
                updates = validateUpdateCommentInput(data);
            } catch (error) {
                toast.error(getValidationMessage(error) ?? t("feedback.invalidCommentData"), {
                    position: "top-center",
                });
                return;
            }

            if (Object.keys(updates).length === 0) return;

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
                toast.error(t("feedback.updateCommentFailed"), {
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
                toast.error(t("feedback.deleteCommentFailed"), {
                    position: "top-center",
                });
            }
        },
        [dispatch, state.comments],
    );

    return { addComment, updateComment, deleteComment };
}
