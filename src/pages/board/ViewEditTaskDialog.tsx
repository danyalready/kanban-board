import { useEffect, useState } from "react";
import { CheckIcon, PencilIcon, SendIcon, Trash2Icon, XIcon } from "lucide-react";

import RichTextEditor from "@/shared/ui/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { formatDate } from "@/shared/utils/formatDate";
import type { Comment, Task, TaskPriority } from "@/domain/kanban/types";

import { PRIORITY_OPTIONS } from "./options";

interface Props {
    open: boolean;
    task?: Task;
    comments: Comment[];
    onOpenChange: (open: boolean) => void;
    onTaskChange: (id: string, data: Partial<Task>) => void;
    onAddComment: (taskId: string, text: string) => void;
    onCommentChange: (id: string, data: Partial<Pick<Comment, "text">>) => void;
    onDeleteComment: (id: string) => void;
    onDeleteTask: () => void;
}

export default function ViewEditTaskDialog(props: Props) {
    const [task, setTask] = useState<Task | undefined>(props.task);
    const [localComments, setLocalComments] = useState(props.comments);

    const [editing, setEditing] = useState(false);
    const [titleDraft, setTitleDraft] = useState("");
    const [descDraft, setDescDraft] = useState("");
    const [commentDraft, setCommentDraft] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentDraft, setEditingCommentDraft] = useState("");
    const debauncedDescDraft = useDebounce(descDraft);

    const saveTitleChange = () => {
        setEditing(false);

        if (!titleDraft) {
            setTitleDraft(task!.title);
        } else if (titleDraft !== task!.title) {
            props.onTaskChange(task!.id, { title: titleDraft });
        }
    };

    const cancelTitleChange = () => {
        setEditing(false);
        setTitleDraft(task!.title);
    };

    const handlePriorityChange = (priority: TaskPriority) => {
        props.onTaskChange(task!.id, { priority });
        setTask({ ...task!, priority });
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && task) {
            props.onTaskChange(task.id, { description: descDraft });
        }

        props.onOpenChange(open);
    };

    const handleAddComment = () => {
        if (!task || !commentDraft.trim()) return;

        props.onAddComment(task.id, commentDraft);
        setCommentDraft("");
    };

    const startEditingComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentDraft(comment.text);
    };

    const cancelEditingComment = () => {
        setEditingCommentId(null);
        setEditingCommentDraft("");
    };

    const saveCommentChange = (commentId: string) => {
        if (!editingCommentDraft.trim()) return;

        props.onCommentChange(commentId, { text: editingCommentDraft });
        cancelEditingComment();
    };

    useEffect(() => {
        if (!task?.id) return;

        props.onTaskChange(task.id, { description: debauncedDescDraft });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debauncedDescDraft, task?.id]);

    useEffect(() => {
        if (props.task?.id) {
            setTask(props.task);
            setTitleDraft(props.task.title);
            setDescDraft(props.task.description);
            setCommentDraft("");
            cancelEditingComment();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.task?.id]);

    useEffect(() => {
        if (props.open) setLocalComments(props.comments);
    }, [props.comments, props.open]);

    return (
        <Dialog open={props.open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    {editing ? (
                        <Input
                            autoFocus
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            onBlur={saveTitleChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") saveTitleChange();
                                if (e.key === "Escape") cancelTitleChange();
                            }}
                        />
                    ) : (
                        <DialogTitle onClick={() => setEditing(true)}>{titleDraft}</DialogTitle>
                    )}
                </DialogHeader>

                <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={task?.priority} onValueChange={handlePriorityChange}>
                        <SelectTrigger id="priority" className="h-8 w-full max-w-32">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>

                        <SelectContent>
                            {PRIORITY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="description" aria-required>
                        Description
                    </Label>
                    <RichTextEditor id="description" value={descDraft} onChange={setDescDraft} />
                </div>

                <div>
                    <Label htmlFor="comment">Comments</Label>
                    <div className="flex gap-2">
                        <Input
                            id="comment"
                            value={commentDraft}
                            placeholder="Add a comment"
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
                            aria-label="Add comment"
                            className="shrink-0"
                        >
                            <SendIcon />
                        </Button>
                    </div>

                    <div className="mt-2 space-y-2">
                        {localComments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No comments yet.</p>
                        ) : (
                            localComments.map((comment) => {
                                const isEditingComment = editingCommentId === comment.id;

                                return (
                                    <div
                                        key={comment.id}
                                        className="rounded-md border bg-card p-3 text-card-foreground"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(comment.createdAt)}
                                            </span>

                                            <div className="flex items-center gap-1">
                                                {isEditingComment ? (
                                                    <>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            disabled={!editingCommentDraft.trim()}
                                                            onClick={() =>
                                                                saveCommentChange(comment.id)
                                                            }
                                                            aria-label="Save comment"
                                                        >
                                                            <CheckIcon />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={cancelEditingComment}
                                                            aria-label="Cancel comment edit"
                                                        >
                                                            <XIcon />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                startEditingComment(comment)
                                                            }
                                                            aria-label="Edit comment"
                                                        >
                                                            <PencilIcon />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                props.onDeleteComment(comment.id)
                                                            }
                                                            aria-label="Delete comment"
                                                        >
                                                            <Trash2Icon />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {isEditingComment ? (
                                            <Input
                                                autoFocus
                                                value={editingCommentDraft}
                                                onChange={(e) =>
                                                    setEditingCommentDraft(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        saveCommentChange(comment.id);
                                                    }
                                                    if (e.key === "Escape") {
                                                        cancelEditingComment();
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <p className="whitespace-pre-wrap break-words text-sm">
                                                {comment.text}
                                            </p>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-4 sm:justify-between">
                    <Button size="sm" variant="destructive" onClick={props.onDeleteTask}>
                        Delete
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => props.onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
