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

import { type KanbanState } from "@/reducers/kanbanTypes";
import { useKanbanContext } from "@/contexts/kanbanContext";
import { useKanbanActions } from "@/contexts/useKanbanActions";

import KanbanColumn from "./KanbanColumn";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import KanbanDragOverlay from "./KanbanDragOverlay";

export default function KanbanBoard(props: { boardId?: string }) {
    const { state } = useKanbanContext();
    const {
        moveColumn: moveColumnAction,
        moveTask: moveTaskAction,
        setActive,
        setState,
        addColumn,
    } = useKanbanActions();
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");
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
                        setActive(current.column);
                        break;
                    case "task":
                        setActive(current.task);
                        break;
                    default:
                        console.warn(`Type ${current.type} is not defined.`);
                }
            }
        },
        [setActive],
    );

    const moveColumn = useCallback(
        (activeId: string, overId: string) => {
            const inBoard = state.columns.filter((c) => !props.boardId || c.boardId === props.boardId);
            const targetIndex = inBoard.findIndex((column) => column.id === overId);
            moveColumnAction(activeId, targetIndex);
        },
        [moveColumnAction, state.columns, props.boardId],
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

                moveTaskAction({
                    targetIndex: targetTaskIndex,
                    targetColumnId: targetColumn.id,
                    taskId: activeId,
                    sourceColumnId,
                });
            }
        },
        [moveTaskAction, state.columns, state.tasks],
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

                            moveTaskAction({
                                targetColumnId: targetColumn.id,
                                targetIndex: over.data.current?.sortable.index,
                                taskId: active.id.toString(),
                                sourceColumnId: activeTask ? activeTask.columnId : targetColumn.id,
                            });
                        }
                    }

                    break;
                }
                case "column": {
                    const activeTask = state.tasks.find((t) => t.id === active.id);

                    moveTaskAction({
                        targetColumnId: over.id.toString(),
                        targetIndex: -1,
                        taskId: active.id.toString(),
                        sourceColumnId: activeTask ? activeTask.columnId : over.id.toString(),
                    });

                    break;
                }
                default: {
                    console.warn(`Type ${over.data.current?.type} is not defined.`);
                }
            }
        },
        [moveTaskAction, state.columns, state.tasks],
    );

    const handleDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            setActive(null);

            if (over) {
                if (active.data.current?.type === "column" && over.data.current?.type === "column") {
                    moveColumn(active.id.toString(), over.id.toString());
                } else if (active.data.current?.type === "task") {
                    moveTask(active.id.toString(), over.id.toString());
                }
            }
        },
        [setActive, moveColumn, moveTask],
    );

    const handleAddColumn = async () => {
        if (!props.boardId) return;

        await addColumn(props.boardId, newColumnName.trim());

        setNewColumnName("");
        setIsAddColumnOpen(false);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragCancel={() => setState(clonedKanbanState)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex min-h-screen gap-2 overflow-x-auto overflow-y-hidden bg-background p-6">
                <SortableContext
                    items={state.columns
                        .filter((c) => !props.boardId || c.boardId === props.boardId)
                        .map((item) => item.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    {state.columns
                        .filter((c) => !props.boardId || c.boardId === props.boardId)
                        .sort((a, b) => a.position - b.position)
                        .map((column) => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                tasks={state.tasks.filter((task) => task.columnId === column.id)}
                            />
                        ))}
                </SortableContext>
                <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">Add column</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New column</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <label className="text-sm">Name</label>
                            <input
                                className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-1 ring-inset ring-border focus:ring-2"
                                placeholder="e.g. To do"
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button disabled={!props.boardId || !newColumnName.trim()} onClick={handleAddColumn}>
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <KanbanDragOverlay />
        </DndContext>
    );
}
