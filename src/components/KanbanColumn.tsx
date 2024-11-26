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
                className="w-[340px] rounded-xl px-4 pb-12 pt-3 shadow-sm ring-1 ring-inset ring-gray-200"
            >
                <h2 className="pb-4">{props.column.title}</h2>

                <div className="flex flex-col gap-4">
                    {props.column.tasks.map((task) => (
                        <KanbanTask key={task.id} task={task} />
                    ))}
                </div>
            </div>
        </SortableContext>
    );
}
