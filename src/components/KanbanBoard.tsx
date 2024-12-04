import {
    closestCorners,
    defaultDropAnimationSideEffects,
    DndContext,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";

import { useKanbanContext } from "@/kanbanContext";
import { type Task, type Column } from "@/kanbanReducer";

import { KanbanColumn } from "./KanbanColumn";
import { KanbanTask } from "./KanbanTask";
import { createPortal } from "react-dom";

export function KanbanBoard() {
    const { state } = useKanbanContext();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const columnIds = useMemo(() => state.columns.map((item) => item.id), [state.columns]);

    const [activeColumn, setActiveColumn] = useState<null | Column>(null);
    const [activeTask, setActiveTask] = useState<null | Task>(null);

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        if (!event.over) return;
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveColumn(null);
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-3 overflow-hidden bg-background p-6">
                <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                    {state.columns.map((column) => (
                        <KanbanColumn key={column.id} column={column} className="w-80" />
                    ))}
                </SortableContext>
            </div>
            {createPortal(
                <DragOverlay
                    dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: {
                                active: {
                                    visibility: "hidden",
                                },
                            },
                        }),
                    }}
                >
                    {activeTask && <KanbanTask task={activeTask} className="rotate-6" />}
                    {activeColumn && <KanbanColumn column={activeColumn} className="rotate-3" />}
                </DragOverlay>,
                document.body,
            )}
        </DndContext>
    );
}
