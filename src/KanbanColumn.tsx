import { useDroppable } from '@dnd-kit/core';
import { type PropsWithChildren } from 'react';
import { KanbanItem } from './KanbanContext';

interface ColumnProps {
    id: string;
    name: string;
    items: KanbanItem[];

    handleAddItem: () => void;
}

export function KanbanColumn(props: PropsWithChildren<ColumnProps>) {
    const { isOver, setNodeRef } = useDroppable({ id: props.name });
    const style = { color: isOver ? 'green' : undefined };

    return (
        <div ref={setNodeRef} style={style}>
            <h2>{props.name}</h2>

            <div className="flex flex-col gap-4">{props.children}</div>
        </div>
    );
}
