import { useRef } from "react";

import type { TaskPriority } from "@/db/types";
import { useEditable } from "@/hooks/useEditable";
import { Input } from "@/components/ui/input";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import RichTextEditor from "../../../components/RichTextEditor";

interface Inputs {
    title: string;
    description: string;
    priority: TaskPriority;
}

interface Props {
    open: boolean;
    initialValues: Inputs;
    isEdit: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function TaskFormDialog(props: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { value, editing, setValue, startEdit, saveEdit, cancelEdit } = useEditable({
        value: props.initialValues.title,
        inputRef: inputRef,
        onChange: () => {},
    });

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    {editing ? (
                        <Input
                            ref={inputRef}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                                e.stopPropagation();

                                if (e.key === "Enter") saveEdit();
                                if (e.key === "Escape") cancelEdit();
                            }}
                        />
                    ) : (
                        <DialogTitle onClick={startEdit}>{props.initialValues.title}</DialogTitle>
                    )}
                </DialogHeader>

                <section>
                    <h3 className="font-semibold">Description</h3>
                    <RichTextEditor value={""} onChange={() => {}} />
                </section>

                <section>
                    <h3 className="font-semibold">Comments</h3>
                </section>
            </DialogContent>
        </Dialog>
    );
}
