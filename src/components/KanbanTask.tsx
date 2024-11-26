import { useDraggable } from "@dnd-kit/core";

import { type Task } from "@/kanbanReducer";

interface KanbanTaskProps {
    task: Task;
}

export function KanbanTask(props: KanbanTaskProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: props.task.id });
    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : undefined;

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
