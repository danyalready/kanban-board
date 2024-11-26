import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { type Task } from "@/kanbanReducer";

interface KanbanTaskProps {
    task: Task;
}

export function KanbanTask(props: KanbanTaskProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.task.id });

    const style = {
        opacity: isDragging ? 0 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex flex-col bg-gray-100 px-4 py-3 ring-1 ring-inset ring-gray-200"
        >
            <h3>{props.task.title}</h3>
        </div>
    );
}
