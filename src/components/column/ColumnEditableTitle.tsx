import { useEffect, useRef } from "react";

import { useEditable } from "@/hooks/useEditable";

import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

interface Props {
    title: string;
    count: number;
    onChange: (value: string) => void;
}

export default function ColumnEditableTitle(props: Props) {
    const { value, editing, setValue, startEdit, saveEdit, cancelEdit } = useEditable({
        value: props.title,
        onChange: props.onChange,
    });

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    if (editing) {
        return (
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
        );
    }

    return (
        <div className="flex w-full items-center gap-2" onClick={startEdit}>
            <h2 className="text-sm font-semibold">{props.title}</h2>
            <Badge variant="outline">{props.count}</Badge>
        </div>
    );
}
