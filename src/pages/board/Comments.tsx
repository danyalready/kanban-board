import { useState } from "react";
import { SendIcon } from "lucide-react";

import { t } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { Comment as CommentT } from "@/domain/kanban/types";

import Comment from "./Comment";

interface Props {
    comments: CommentT[];
    onAdd: (text: string) => void;
    onChange: (id: string, data: Partial<Pick<CommentT, "text">>) => void;
    onDelete: (id: string) => void;
}

export default function Comments(props: Props) {
    const [commentDraft, setCommentDraft] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

    const handleAddComment = () => {
        if (!commentDraft.trim()) return;

        props.onAdd(commentDraft);
        setCommentDraft("");
    };

    return (
        <div>
            <Label htmlFor="comment">{t("comment.title")}</Label>
            <div className="flex gap-2">
                <Input
                    id="comment"
                    value={commentDraft}
                    placeholder={t("comment.placeholder")}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment();
                    }}
                />
                <Button
                    type="button"
                    size="icon"
                    disabled={!commentDraft.trim()}
                    onClick={handleAddComment}
                    aria-label={t("action.addComment")}
                    className="shrink-0"
                >
                    <SendIcon />
                </Button>
            </div>

            <div className="mt-2 space-y-2">
                {props.comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("comment.empty")}</p>
                ) : (
                    props.comments.map((comment) => {
                        const isEditingComment = editingCommentId === comment.id;

                        return (
                            <Comment
                                isEditing={isEditingComment}
                                comment={comment}
                                onClickEdit={() => setEditingCommentId(comment.id)}
                                onClickSave={(text) => props.onChange(comment.id, { text })}
                                onClickCancel={() => setEditingCommentId(null)}
                                onClickDelete={() => props.onDelete(comment.id)}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}
