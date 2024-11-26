import { useDraggable } from "@dnd-kit/core";

interface KanbanItemProps {
    id: string;
    content: string;
}

export function KanbanItem(props: KanbanItemProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: props.id });
    const style = { transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined };

    return (
        <div ref={setNodeRef} style={style} className="kanban-item" {...listeners} {...attributes}>
            {props.content}
        </div>
    );
}
