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

import { PRIORITY_OPTIONS } from "./options";

// Features:
// edit/delete task
// crud comments

interface Props {
    open: boolean;
    task?: Task;
    onOpenChange: (open: boolean) => void;
    onTaskChange: (data: Partial<Task>) => void;
}

export default function ViewEditTaskDialog(props: Props) {
    const [task, setTask] = useState<Task | undefined>(props.task);

    useEffect(() => {
        if (props.task) setTask(props.task);
    }, [props.task]);

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{task?.title}</DialogTitle>
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
