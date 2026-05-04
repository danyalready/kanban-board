import { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";

import { t } from "@/shared/i18n";
import { formatDate } from "@/shared/utils/formatDate";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { Comment as CommentT } from "@/domain/kanban/types";

import CommentActions from "./CommentActions";

interface Props {
    comment: CommentT;
    isEditing: boolean;
    onClickEdit: () => void;
    onClickSave: (comment: string) => void;
    onClickCancel: () => void;
    onClickDelete: () => void;
}

export default function Comment(props: Props) {
    const [editingCommentDraft, setEditingCommentDraft] = useState(props.comment.text);

    const saveCommentChange = () => {
        if (!editingCommentDraft.trim()) return;

        props.onClickSave(editingCommentDraft);
        props.onClickCancel();
    };

    return (
        <div
            key={props.comment.id}
            className="rounded-md border bg-card p-3 pt-1 text-card-foreground"
        >
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                    {formatDate(props.comment.createdAt)}
                </span>

                <div className="flex items-center gap-1">
                    {props.isEditing ? (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={!editingCommentDraft.trim()}
                                onClick={saveCommentChange}
                                aria-label={t("action.saveComment")}
                            >
                                <CheckIcon />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={props.onClickCancel}
                                aria-label={t("action.cancelCommentEdit")}
                            >
                                <XIcon />
                            </Button>
                        </>
                    ) : (
                        <CommentActions
                            onClickEdit={props.onClickEdit}
                            onClickDelete={props.onClickDelete}
                        />
                    )}
                </div>
            </div>

            {props.isEditing ? (
                <Input
                    autoFocus
                    value={editingCommentDraft}
                    onChange={(e) => setEditingCommentDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") saveCommentChange();

                        if (e.key === "Escape") props.onClickCancel();
                    }}
                />
            ) : (
                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                    {props.comment.text}
                </p>
            )}
        </div>
    );
}
