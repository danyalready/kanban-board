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

    const [activeId, setActiveId] = useState<null | string>(null);

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
                                opacity: "0.4",
                            },
                        },
                    }),
                }}
            >
                {activeId ? <KanbanTask task={{ id: "dragged", title: "Dragged" }} /> : null}
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
        setActiveId(event.active.id.toString());
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
            setActiveId(null);
            return;
        }

        const activeColumn = findColumn(active.id.toString());
        const overColumn = findColumn(over.id.toString());

        if (!activeColumn || !overColumn || activeColumn.id !== overColumn.id) {
            setActiveId(null);
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

        setActiveId(null);
    }
}
