import {
    closestCorners,
    defaultDropAnimationSideEffects,
    DndContext,
    DragOverEvent,
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

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) return;

        if (active.data.current?.type === "task" && over.data.current?.type === "task") {
            const sourceColumn = state.columns.find((column) => column.id === active.data.current?.task.columnId);
            const targetColumn = state.columns.find((column) => column.id === over.data.current?.task.columnId);

            if (!sourceColumn || !targetColumn) return;

            if (sourceColumn.id !== targetColumn.id) {
                // const activeTaskIndex = sourceColumn.tasks.findIndex((taskId) => taskId === active.id);
                // const targetTaskIndex = targetColumn.tasks.findIndex((taskId) => taskId === over.id);

                const activeTask = state.tasks.find((task) => task.id === active.id);
                const targetTask = state.tasks.find((task) => task.id === over.id);

                if (!activeTask || !targetTask) return;

                activeTask.columnId = targetTask.columnId;
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveColumn(null);
        setActiveTask(null);

        if (!over) return;

        // NOTE: To move "columns"
        if (active.data.current?.type === "column" && over.data.current?.type === "column") {
            const activeColumnIndex = state.columns.findIndex((column) => column.id === active.id);
            const targetColumnIndex = state.columns.findIndex((column) => column.id === over.id);

            if (activeColumnIndex !== -1 && targetColumnIndex !== -1) {
                dispatch({
                    type: "MOVE_COLUMN",
                    payload: { columnId: active.id, targetIndex: targetColumnIndex },
                });
            }
        }

        // NOTE: To move "tasks"
        if (active.data.current?.type === "task" && over.data.current?.type === "task") {
            const sourceColumn = state.columns.find((column) => column.id === active.data.current?.task.columnId);
            const targetColumn = state.columns.find((column) => column.id === over.data.current?.task.columnId);

            if (!sourceColumn || !targetColumn) return;

            const activeTaskIndex = sourceColumn.tasks.findIndex((taskId) => taskId === active.id);
            const targetTaskIndex = targetColumn.tasks.findIndex((taskId) => taskId === over.id);

            if (activeTaskIndex !== -1 && targetTaskIndex !== -1) {
                dispatch({
                    type: "MOVE_TASK",
                    payload: {
                        activeIndex: activeTaskIndex,
                        targetIndex: targetTaskIndex,
                        sourceColumnId: sourceColumn.id,
                        targetColumnId: targetColumn.id,
                        taskId: active.id,
                    },
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
