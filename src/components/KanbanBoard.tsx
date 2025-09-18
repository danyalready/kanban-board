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
} from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { KanbanActionType, type KanbanState } from "@/reducers/kanbanTypes";
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
        (activeId: string, overId: string) => {
            const targetIndex = state.columns.findIndex((column) => column.id === overId);
            dispatch({ type: KanbanActionType.MoveColumn, payload: { columnId: activeId, targetIndex } });
        },
        [dispatch, state.columns],
    );

    const moveTask = useCallback(
        (activeId: string, overId: string) => {
            // Determine the target column and target index within that column
            const overTask = state.tasks.find((task) => task.id === overId);
            const targetColumn =
                state.columns.find((column) => column.id === overId) ||
                (overTask ? state.columns.find((column) => column.id === overTask.columnId) : undefined);

            if (targetColumn) {
                const tasksInTargetColumn = state.tasks
                    .filter((task) => task.columnId === targetColumn.id)
                    .sort((a, b) => a.position - b.position);

                const targetTaskIndex = overTask
                    ? tasksInTargetColumn.findIndex((task) => task.id === overTask.id)
                    : -1;

                const activeTask = state.tasks.find((task) => task.id === activeId);
                const sourceColumnId = activeTask ? activeTask.columnId : targetColumn.id;

                dispatch({
                    type: KanbanActionType.MoveTask,
                    payload: {
                        targetIndex: targetTaskIndex,
                        targetColumnId: targetColumn.id,
                        taskId: activeId,
                        sourceColumnId,
                    },
                });
            }
        },
        [dispatch, state.columns, state.tasks],
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
                        const overTask = state.tasks.find((task) => task.id === over.id);
                        const targetColumn = overTask
                            ? state.columns.find((column) => column.id === overTask.columnId)
                            : state.columns.find((column) => column.id === over.id);

                        if (targetColumn) {
                            const activeTask = state.tasks.find((t) => t.id === active.id);
                            dispatch({
                                type: KanbanActionType.MoveTask,
                                payload: {
                                    targetColumnId: targetColumn.id,
                                    targetIndex: over.data.current?.sortable.index,
                                    taskId: active.id.toString(),
                                    sourceColumnId: activeTask ? activeTask.columnId : targetColumn.id,
                                },
                            });
                        }
                    }

                    break;
                }
                case "column": {
                    const activeTask = state.tasks.find((t) => t.id === active.id);
                    dispatch({
                        type: KanbanActionType.MoveTask,
                        payload: {
                            targetColumnId: over.id.toString(),
                            targetIndex: -1,
                            taskId: active.id.toString(),
                            sourceColumnId: activeTask ? activeTask.columnId : over.id.toString(),
                        },
                    });

                    break;
                }
                default: {
                    console.warn(`Type ${over.data.current?.type} is not defined.`);
                }
            }
        },
        [dispatch, state.columns, state.tasks],
    );

    const handleDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            dispatch({ type: KanbanActionType.SetActive, payload: { active: null } });

            if (over) {
                if (active.data.current?.type === "column" && over.data.current?.type === "column") {
                    moveColumn(active.id.toString(), over.id.toString());
                } else if (active.data.current?.type === "task") {
                    moveTask(active.id.toString(), over.id.toString());
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
            <div className="flex min-h-screen gap-2 overflow-x-auto overflow-y-hidden bg-background p-6">
                <SortableContext items={state.columns.map((item) => item.id)} strategy={horizontalListSortingStrategy}>
                    {state.columns.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            tasks={state.tasks.filter((task) => task.columnId === column.id)}
                        />
                    ))}
                </SortableContext>
            </div>

            <KanbanDragOverlay />
        </DndContext>
    );
}
