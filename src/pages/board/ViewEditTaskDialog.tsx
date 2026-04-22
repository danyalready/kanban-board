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
import type { Task } from "@/db/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { PRIORITY_OPTIONS } from "./options";

// Features:
// edit/delete task
// crud comments

interface Props {
    open: boolean;
    task?: Task;
    onOpenChange: (open: boolean) => void;
    onTaskChange: (id: string, data: Partial<Task>) => void;
}

export default function ViewEditTaskDialog(props: Props) {
    const [task, setTask] = useState<Task | undefined>(props.task);

    const [editing, setEditing] = useState(false);
    const [titleDraft, setTitleDraft] = useState("");

    const save = () => {
        setEditing(false);

        if (!titleDraft) {
            setTitleDraft(task!.title);
        } else if (titleDraft !== task!.title) {
            props.onTaskChange(task!.id, { title: titleDraft });
        }
    };

    const cancel = () => {
        setEditing(false);
        setTitleDraft(task!.title);
    };

    useEffect(() => {
        if (props.task) {
            setTask(props.task);
            setTitleDraft(props.task.title);
        }
    }, [props.task]);

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    {editing ? (
                        <Input
                            autoFocus
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            onBlur={save}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") save();
                                if (e.key === "Escape") cancel();
                            }}
                        />
                    ) : (
                        <DialogTitle onClick={() => setEditing(true)}>{task?.title}</DialogTitle>
                    )}
                </DialogHeader>

                <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={task?.priority} onValueChange={() => {}}>
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
                    <RichTextEditor
                        id="description"
                        value={task?.description}
                        onChange={() => {}}
                    />
                </div>

                <DialogFooter></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
