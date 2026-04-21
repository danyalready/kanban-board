import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import type { TaskPriority } from "@/db/types";

interface PriorityOption {
    label: string;
    value: TaskPriority;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
];

interface Inputs {
    name: string;
    description: string;
    priority: TaskPriority;
}

interface Props {
    open: boolean;
    onSubmit: SubmitHandler<Inputs>;
    onOpenChange: (open: boolean) => void;
}

export default function CreateTaskFormDialog(props: Props) {
    const { register, handleSubmit, watch, setValue, reset } = useForm<Inputs>({
        values: {
            name: "",
            priority: "low",
            description: "",
        },
    });

    useEffect(() => {
        register("description");
    }, [register]);

    useEffect(() => {
        if (props.open) reset({ name: "", description: "", priority: "low" });
    }, [props.open, reset]);

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(props.onSubmit)}>
                    <div className="mb-4">
                        <Label htmlFor="name" required>
                            Summary
                        </Label>
                        <Input id="name" {...(register("name"), { required: true })} />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="name" required>
                            Priority
                        </Label>
                        <Select
                            defaultValue={watch("priority")}
                            onValueChange={(value) => setValue("priority", value as TaskPriority)}
                        >
                            <SelectTrigger className="w-full max-w-48">
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

                    <div className="mb-4">
                        <Label htmlFor="description" aria-required>
                            Description
                        </Label>
                        <RichTextEditor
                            value={watch("description")}
                            onChange={(value) => setValue("description", value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button onClick={() => props.onOpenChange(false)} variant="secondary">
                            Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
