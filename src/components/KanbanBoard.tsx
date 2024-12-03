import {
    closestCorners,
    defaultDropAnimationSideEffects,
    DndContext,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { useState, useCallback } from "react";

import { useKanbanContext } from "@/kanbanContext";
import { type Task } from "@/kanbanReducer";

import { KanbanColumn } from "./KanbanColumn";
import { KanbanTask } from "./KanbanTask";

export function KanbanBoard() {
    const { state, dispatch } = useKanbanContext();
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const [activeTask, setActiveTask] = useState<null | Task>(null);

    const findColumn = useCallback(
        (id: string) => state.columns.find((column) => column.id === id || column.tasks.some((task) => task.id === id)),
        [state.columns],
    );

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const activeColumn = findColumn(event.active.id.toString());

            if (!activeColumn) {
                return;
            }

            const task = activeColumn.tasks.find((task) => task.id === event.active.id.toString());

            if (task) {
                setActiveTask(task);
            }
        },
        [findColumn],
    );

    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            const { active, over } = event;

            if (!over) {
                return;
            }

            const activeColumn = findColumn(active.id.toString());
            const overColumn = findColumn(over.id.toString());

            if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
                return;
            }

            // Only visually indicate potential drop area; actual move happens in handleDragEnd
        },
        [findColumn],
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over) {
                setActiveTask(null);
                return;
            }

            const activeColumn = findColumn(active.id.toString());
            const overColumn = findColumn(over.id.toString());

            if (!activeColumn || !overColumn) {
                setActiveTask(null);
                return;
            }

            if (activeColumn.id === overColumn.id) {
                const activeIndex = activeColumn.tasks.map((task) => task.id).indexOf(active.id.toString());
                const overIndex = activeColumn.tasks.map((task) => task.id).indexOf(over.id.toString());

                if (activeIndex !== overIndex) {
                    dispatch({
                        type: "UPDATE_COLUMN",
                        payload: {
                            columnId: activeColumn.id,
                            updatedColumn: { tasks: arrayMove(activeColumn.tasks, activeIndex, overIndex) },
                        },
                    });
                }
            } else {
                const activeIndex = activeColumn.tasks.map((task) => task.id).indexOf(active.id.toString());
                const overIndex = overColumn.tasks.map((task) => task.id).indexOf(over.id.toString());

                const updatedActiveTasks = [...activeColumn.tasks];
                const [movedTask] = updatedActiveTasks.splice(activeIndex, 1);

                const updatedOverTasks = [...overColumn.tasks];
                updatedOverTasks.splice(overIndex + 1, 0, movedTask);

                dispatch({
                    type: "UPDATE_COLUMN",
                    payload: {
                        columnId: activeColumn.id,
                        updatedColumn: { tasks: updatedActiveTasks },
                    },
                });

                dispatch({
                    type: "UPDATE_COLUMN",
                    payload: {
                        columnId: overColumn.id,
                        updatedColumn: { tasks: updatedOverTasks },
                    },
                });
            }

            setActiveTask(null);
        },
        [findColumn, dispatch],
    );

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
                                opacity: "0",
                                visibility: "hidden",
                            },
                        },
                    }),
                }}
            >
                {activeTask ? <KanbanTask task={activeTask} className="rotate-6" /> : null}
            </DragOverlay>
        </DndContext>
    );
}
