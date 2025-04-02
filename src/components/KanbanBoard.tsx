import { useState } from "react";
import { createPortal } from "react-dom";
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

import { isColumn, isTask, type KanbanState } from "@/store/types";
import { useKanbanContext } from "@/contexts/KanbanContext";

import { KanbanColumn } from "./KanbanColumn";
import { KanbanTask } from "./KanbanTask";

export function KanbanBoard() {
    const { state, dispatch } = useKanbanContext();
    const [clonedKanbanState, setClonedKanbanState] = useState<KanbanState>(state);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        setClonedKanbanState(state);

        if (event.active.data.current?.type === "column") {
            dispatch({ type: "SET_ACTIVE", payload: { active: event.active.data.current.column } });
        } else if (event.active.data.current?.type === "task") {
            dispatch({ type: "SET_ACTIVE", payload: { active: event.active.data.current.task } });
        } else {
            console.warn(`Type ${event.active.data.current?.type} is not defined.`);
        }
    };

    const handleDragOver = ({ active, over }: DragOverEvent) => {
        if (active.data.current?.type !== "task" || !over) return;

        if (over.data.current?.type === "task") {
            if (active.data.current?.sortable.containerId !== over.data.current?.sortable.containerId) {
                const targetColumn = state.columns.find((column) => column.tasks.includes(over.id));

                if (!targetColumn) {
                    console.warn("No target-column found.");

                    return;
                }

                dispatch({
                    type: "MOVE_TASK",
                    payload: {
                        targetColumnId: targetColumn.id,
                        targetIndex: over.data.current?.sortable.index,
                        taskId: active.id,
                    },
                });
            }
        } else if (over.data.current?.type === "column") {
            dispatch({ type: "MOVE_TASK", payload: { targetColumnId: over.id, targetIndex: -1, taskId: active.id } });
        } else {
            console.warn(`Type ${over.data.current?.type} is not defined.`);
        }
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        dispatch({ type: "SET_ACTIVE", payload: { active: null } });

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
            onDragCancel={() => dispatch({ type: "SET_STATE", payload: clonedKanbanState })}
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
                    {isColumn(state.active) && <KanbanColumn column={state.active} className="rotate-2" />}
                    {isTask(state.active) && <KanbanTask task={state.active} className="rotate-6" />}
                </DragOverlay>,
                document.body,
            )}
        </DndContext>
    );
}
