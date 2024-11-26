import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

import { type Column } from "@/kanbanReducer";

import { KanbanTask } from "./KanbanTask";

interface ColumnProps {
    column: Column;
}

export function KanbanColumn(props: ColumnProps) {
    const { isOver, setNodeRef } = useDroppable({ id: props.column.id });
    const style = { color: isOver ? "green" : undefined };

    return (
        <SortableContext id={props.column.id} items={props.column.tasks}>
            <div
                ref={setNodeRef}
                style={style}
                className="flex w-[320px] flex-col gap-3 rounded-xl bg-secondary py-3 shadow-sm ring-1 ring-inset ring-border"
            >
                <div className="flex items-start justify-between px-4">
                    <h2 className="text-sm font-semibold">{props.column.title}</h2>
                </div>

                <div className="flex flex-col gap-1.5 px-1">
                    {props.column.tasks.map((task) => (
                        <KanbanTask key={task.id} task={task} />
                    ))}
                </div>
            </div>
        </SortableContext>
    );
}
