import { useEffect, useState } from "react";

import RichTextEditor from "@/components/RichTextEditor";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import type { Task, TaskPriority } from "@/db/types";

import { PRIORITY_OPTIONS } from "./options";

// Features:
// crud comments

interface Props {
    open: boolean;
    task?: Task;
    onOpenChange: (open: boolean) => void;
    onTaskChange: (id: string, data: Partial<Task>) => void;
    onDeleteTask: () => void;
}

export default function ViewEditTaskDialog(props: Props) {
    const [task, setTask] = useState<Task | undefined>(props.task);

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

                <DialogFooter className="sm:justify-between">
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
