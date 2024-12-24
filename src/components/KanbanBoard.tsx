import {
    closestCorners,
    defaultDropAnimationSideEffects,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";

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

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        setActiveColumn(null);
        setActiveTask(null);

        if (!over) return;

        // NOTE: Moves the column
        if (active.data.current?.type === "column" && over.data.current?.type === "column") {
            const targetColumnIndex = state.columns.findIndex((column) => column.id === over.id);

            if (targetColumnIndex !== -1) {
                dispatch({
                    type: "MOVE_COLUMN",
                    payload: { columnId: active.id, targetIndex: targetColumnIndex },
                });
            }
        }

        // NOTE: Moves the tasks between columns and reorders
        if (active.data.current?.type === "task") {
            const targetColumn = state.columns.find(
                (column) => column.id === over.id || column.tasks.includes(over.id),
            );

            if (!targetColumn) return;

            const targetTaskIndex = targetColumn.tasks.findIndex((taskId) => taskId === over.id);

            dispatch({
                type: "MOVE_TASK",
                payload: {
                    targetIndex: targetTaskIndex,
                    targetColumnId: targetColumn.id,
                    taskId: active.id,
                },
            });
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex min-h-screen gap-3 overflow-x-auto overflow-y-hidden bg-background p-6">
                <SortableContext items={state.columns.map((item) => item.id)} strategy={horizontalListSortingStrategy}>
                    {state.columns.map((column) => (
                        <KanbanColumn key={column.id} column={column} />
                    ))}
                </SortableContext>
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
                {activeColumn && <KanbanColumn column={activeColumn} className="rotate-2" />}
                {activeTask && <KanbanTask task={activeTask} className="rotate-6" />}
            </DragOverlay>
        </DndContext>
    );
}
