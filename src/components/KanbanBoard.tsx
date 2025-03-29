import { useState } from "react";
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
    type DragOverEvent,
} from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { type Target } from "@/store/kanbanReducer";
import { useKanbanContext } from "@/contexts/KanbanContext";

import { KanbanColumn } from "./KanbanColumn";

export function KanbanBoard() {
    const { state, dispatch } = useKanbanContext();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );
    const [target, setTarget] = useState<null | Target>(null);

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "column") {
            dispatch({ type: "SET_ACTIVE", payload: { active: event.active.data.current.column } });

            return;
        }

        if (event.active.data.current?.type === "task") {
            dispatch({ type: "SET_ACTIVE", payload: { active: event.active.data.current.task } });

            return;
        }
    };

    const handleDragOver = ({ over }: DragOverEvent) => {
        if (!over) return;

        if (over.data.current?.type === "task") {
            const column = state.columns.find((column) => column.tasks.includes(over.id));

            if (column) {
                const targetIndex = column.tasks.findIndex((taskId) => taskId === over.id);

                setTarget({ columnId: column.id, index: targetIndex });

                return;
            }
        }

        if (over.data.current?.type === "column") {
            setTarget({ columnId: over.id, index: -1 });

            return;
        }
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        dispatch({ type: "SET_ACTIVE", payload: { active: null } });
        setTarget(null);

        if (!over) return;

        // NOTE: Moves the column
        if (active.data.current?.type === "column" && over.data.current?.type === "column") {
            const targetColumnIndex = state.columns.findIndex((column) => column.id === over.id);

            dispatch({ type: "MOVE_COLUMN", payload: { columnId: active.id, targetIndex: targetColumnIndex } });

            return;
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

            return;
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
                        <KanbanColumn key={column.id} column={column} target={target} />
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
                {state.active && <KanbanColumn column={activeColumn} className="rotate-2" />}
                {state.active && <KanbanTask task={state.activeTask} className="rotate-6" />}
            </DragOverlay>
        </DndContext>
    );
}
