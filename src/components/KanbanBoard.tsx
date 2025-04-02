import { useCallback, useState } from "react";
import {
    rectIntersection,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { KanbanActionType, type KanbanState } from "@/store/types";
import { useKanbanContext } from "@/contexts/kanbanContext";

import KanbanColumn from "./KanbanColumn";
import KanbanDragOverlay from "./KanbanDragOverlay";

export default function KanbanBoard() {
    const { state, dispatch } = useKanbanContext();
    const [clonedKanbanState, setClonedKanbanState] = useState<KanbanState>(state);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const setActiveItem = useCallback(
        (event: DragStartEvent) => {
            const { current } = event.active.data;

            if (current) {
                switch (current.type) {
                    case "column":
                        dispatch({ type: KanbanActionType.SetActive, payload: { active: current.column } });
                        break;
                    case "task":
                        dispatch({ type: KanbanActionType.SetActive, payload: { active: current.task } });
                        break;
                    default:
                        console.warn(`Type ${current.type} is not defined.`);
                }
            }
        },
        [dispatch],
    );

    const moveColumn = useCallback(
        (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
            const targetIndex = state.columns.findIndex((column) => column.id === overId);
            dispatch({ type: KanbanActionType.MoveColumn, payload: { columnId: activeId, targetIndex } });
        },
        [dispatch, state.columns],
    );

    const moveTask = useCallback(
        (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
            const targetColumn = state.columns.find((column) => column.id === overId || column.tasks.includes(overId));

            if (targetColumn) {
                const targetTaskIndex = targetColumn.tasks.findIndex((taskId) => taskId === overId);

                dispatch({
                    type: "MOVE_TASK",
                    payload: {
                        targetIndex: targetTaskIndex,
                        targetColumnId: targetColumn.id,
                        taskId: activeId,
                    },
                });
            }
        },
        [dispatch, state.columns],
    );

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            setClonedKanbanState(state);
            setActiveItem(event);
        },
        [setActiveItem, state],
    );

    const handleDragOver = useCallback(
        ({ active, over }: DragOverEvent) => {
            if (active.data.current?.type !== "task" || !over) return;

            switch (over.data.current?.type) {
                case "task": {
                    if (active.data.current?.sortable.containerId !== over.data.current?.sortable.containerId) {
                        const targetColumn = state.columns.find((column) => column.tasks.includes(over.id));

                        if (targetColumn) {
                            dispatch({
                                type: "MOVE_TASK",
                                payload: {
                                    targetColumnId: targetColumn.id,
                                    targetIndex: over.data.current?.sortable.index,
                                    taskId: active.id,
                                },
                            });
                        }
                    }

                    break;
                }
                case "column": {
                    dispatch({
                        type: "MOVE_TASK",
                        payload: { targetColumnId: over.id, targetIndex: -1, taskId: active.id },
                    });

                    break;
                }
                default: {
                    console.warn(`Type ${over.data.current?.type} is not defined.`);
                }
            }
        },
        [dispatch, state.columns],
    );

    const handleDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            dispatch({ type: KanbanActionType.SetActive, payload: { active: null } });

            if (over) {
                if (active.data.current?.type === "column" && over.data.current?.type === "column") {
                    moveColumn(active.id, over.id);
                } else if (active.data.current?.type === "task") {
                    moveTask(active.id, over.id);
                }
            }
        },
        [dispatch, moveColumn, moveTask],
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragCancel={() => dispatch({ type: KanbanActionType.SetState, payload: { state: clonedKanbanState } })}
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

            <KanbanDragOverlay active={state.active} />
        </DndContext>
    );
}
