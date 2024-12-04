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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";

import { useKanbanContext } from "@/kanbanContext";
import { type Task, type Column } from "@/kanbanReducer";

import { KanbanColumn } from "./KanbanColumn";
import { KanbanTask } from "./KanbanTask";

export function KanbanBoard() {
    const { state } = useKanbanContext();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const [, setActiveColumn] = useState<null | Column>(null);
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
        const { over } = event;

        if (!over) {
            setActiveColumn(null);
            setActiveTask(null);
            return;
        }

        setActiveColumn(null);
        setActiveTask(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-2 overflow-hidden bg-background p-6">
                {state.columns.map((column) => (
                    <div key={column.id} className="w-80">
                        <KanbanColumn column={column} />
                    </div>
                ))}
            </div>
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
            </DragOverlay>
        </DndContext>
    );
}
