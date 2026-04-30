import { useEffect } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import RichTextEditor from "@/shared/ui/RichTextEditor";
import type { TaskPriority } from "@/domain/kanban/types";

import { PRIORITY_OPTIONS } from "./options";

export interface Inputs {
    title: string;
    description: string;
    priority: TaskPriority;
}

interface Props {
    open: boolean;
    onSubmit: SubmitHandler<Inputs>;
    onOpenChange: (open: boolean) => void;
}

export default function CreateTaskFormDialog(props: Props) {
    const { register, control, handleSubmit, reset } = useForm<Inputs>({
        values: {
            title: "",
            priority: "low",
            description: "",
        },
    });

    useEffect(() => {
        if (props.open) reset({ title: "", description: "", priority: "low" });
    }, [props.open, reset]);

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(props.onSubmit)}>
                    <div className="mb-4">
                        <Label htmlFor="title" required>
                            Summary
                        </Label>
                        <Input
                            id="title"
                            {...register("title", {
                                required: true,
                                validate: (value) => value.trim().length > 0,
                            })}
                        />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="priority" required>
                            Priority
                        </Label>
                        <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="priority" className="w-full max-w-32">
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
                            )}
                        />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="description" aria-required>
                            Description
                        </Label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <RichTextEditor value={field.value} onChange={field.onChange} />
                            )}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => props.onOpenChange(false)}
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
