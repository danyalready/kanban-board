import { useRef } from "react";

import { useEditable } from "@/shared/hooks/useEditable";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";

interface Props {
    title: string;
    count: number;
    onChange: (value: string) => void;
}

export default function ColumnEditableTitle(props: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { value, editing, setValue, startEdit, saveEdit, cancelEdit } = useEditable({
        value: props.title,
        inputRef: inputRef,
        onChange: props.onChange,
    });

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
