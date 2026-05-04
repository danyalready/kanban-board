import { useEffect, useState } from "react";

import RichTextEditor from "@/shared/ui/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { Comment, Task, TaskPriority } from "@/domain/kanban/types";
import { t } from "@/shared/i18n";

import { PRIORITY_OPTIONS } from "./options";
import Comments from "./Comments";

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
                    <Label htmlFor="priority">{t("task.form.priority")}</Label>
                    <Select value={task?.priority} onValueChange={handlePriorityChange}>
                        <SelectTrigger id="priority" className="h-8 w-full max-w-32">
                            <SelectValue placeholder={t("task.form.priorityPlaceholder")} />
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
                        {t("task.form.description")}
                    </Label>
                    <RichTextEditor id="description" value={descDraft} onChange={setDescDraft} />
                </div>

                <Comments
                    comments={localComments}
                    onAdd={(comment) => task?.id && props.onAddComment(task.id, comment)}
                    onChange={props.onCommentChange}
                    onDelete={props.onDeleteComment}
                />

                <DialogFooter className="mt-4 sm:justify-between">
                    <Button size="sm" variant="destructive" onClick={props.onDeleteTask}>
                        {t("action.delete")}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => props.onOpenChange(false)}>
                        {t("action.close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
