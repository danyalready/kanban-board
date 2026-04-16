import { useEffect, useRef, useState } from "react";

import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

interface Props {
    title: string;
    count: number;
    onChange: (value: string) => void;
}

export default function ColumnEditableTitle(props: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(props.title);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        if (draft !== props.title) props.onChange(draft);
    };

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") {
                        setDraft(props.title);
                        setIsEditing(false);
                    }
                }}
            />
        );
    }

    return (
        <div className="flex w-full items-center gap-2" onClick={() => setIsEditing(true)}>
            <h2 className="text-sm font-semibold">{props.title}</h2>
            <Badge variant="outline">{props.count}</Badge>
        </div>
    );
}
