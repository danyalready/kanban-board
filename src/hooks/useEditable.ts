import { useState, useCallback } from "react";

type UseEditableOptions = {
    value: string;
    onChange: (v: string) => void;
    onSave?: (v: string) => void;
    onCancel?: () => void;
};

export function useEditable({ value, onChange, onSave, onCancel }: UseEditableOptions) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const startEdit = useCallback(() => {
        setDraft(value);
        setEditing(true);
    }, [value]);

    const cancelEdit = useCallback(() => {
        setDraft(value);
        setEditing(false);
        onCancel?.();
    }, [value, onCancel]);

    const saveEdit = useCallback(() => {
        if (draft !== value) {
            onChange(draft);
            onSave?.(draft);
        }
        setEditing(false);
    }, [draft, value, onChange, onSave]);

    return {
        value: draft,
        editing,
        setValue: setDraft,
        startEdit,
        cancelEdit,
        saveEdit,
    };
}
