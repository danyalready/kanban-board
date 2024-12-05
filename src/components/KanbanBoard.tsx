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
import { useState } from "react";
import { createPortal } from "react-dom";

import { useKanbanContext } from "@/kanbanContext";
import type { Column, Task } from "@/kanbanReducer";

import { KanbanColumn } from "./KanbanColumn";
import { KanbanTask } from "./KanbanTask";

export function KanbanBoard() {
    const { state, dispatch } = useKanbanContext();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

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

        if (active.data.current?.type === "column" && over.data.current?.type === "column") {
            const activeIndex = state.columns.findIndex((column) => column.id === activeId);
            const overIndex = state.columns.findIndex((column) => column.id === overId);

            if (activeIndex !== -1 && overIndex !== -1) {
                dispatch({
                    type: "MOVE_COLUMN",
                    payload: { columnId: active.id.toString(), targetIndex: overIndex },
                });
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={state.columns.map((item) => item.id)} strategy={horizontalListSortingStrategy}>
                <div className="flex items-start gap-3 overflow-hidden bg-background p-6">
                    {state.columns.map((column) => (
                        <KanbanColumn key={column.id} column={column} className="w-80" />
                    ))}
                </div>
            </SortableContext>

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
                    {activeColumn && <KanbanColumn column={activeColumn} className="rotate-3" />}
                    {activeTask && <KanbanTask task={activeTask} className="rotate-6" />}
                </DragOverlay>,
                document.body,
            )}
        </DndContext>
    );
}
