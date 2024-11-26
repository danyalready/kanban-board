import {
    closestCorners,
    defaultDropAnimationSideEffects,
    DndContext,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";

import { useKanbanContext } from "@/kanbanContext";
import { type Task } from "@/kanbanReducer";

import { KanbanColumn } from "./KanbanColumn";
import { useState } from "react";
import { KanbanTask } from "./KanbanTask";

export function KanbanBoard() {
    const { state, dispatch } = useKanbanContext();
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const [activeTask, setActiveTask] = useState<null | Task>(null);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-5 px-4 py-3">
                {state.columns.map((column) => (
                    <KanbanColumn key={column.id} column={column} />
                ))}
            </div>
            <DragOverlay
                dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: {
                                opacity: "0.3",
                            },
                        },
                    }),
                }}
            >
                {activeTask ? <KanbanTask task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );

    function findColumn(id: string) {
        if (state.columns.map((column) => column.id).includes(id)) {
            return state.columns.find((column) => column.id === id);
        }

        return state.columns.find((column) => column.tasks.some((task) => task.id === id));
    }

    function handleDragStart(event: DragStartEvent) {
        const activeColumn = findColumn(event.active.id.toString());

        if (!activeColumn) {
            return;
        }

        const task = activeColumn.tasks.find((task) => task.id === event.active.id.toString());

        if (task) {
            setActiveTask(task);
        }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;

        if (!over) {
            return;
        }

        const activeColumn = findColumn(active.id.toString());
        const overColumn = findColumn(over.id.toString());

        if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
            return;
        }

        dispatch({
            type: "MOVE_TASK",
            payload: { sourceColumnId: activeColumn.id, targetColumnId: overColumn.id, taskId: active.id.toString() },
        });
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        const activeColumn = findColumn(active.id.toString());
        const overColumn = findColumn(over.id.toString());

        if (!activeColumn || !overColumn || activeColumn.id !== overColumn.id) {
            setActiveTask(null);
            return;
        }

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

        setActiveTask(null);
    }
}
