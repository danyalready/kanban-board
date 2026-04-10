import { useCallback, useMemo, useState } from "react";
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
import {
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { type KanbanState } from "@/reducers/kanbanTypes";
import { useKanbanContext } from "@/contexts/kanbanContext";
import { useKanbanActions } from "@/contexts/useKanbanActions";

import KanbanColumn from "./KanbanColumn";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import KanbanDragOverlay from "./KanbanDragOverlay";

export default function KanbanBoard(props: { boardId?: string }) {
    const { state } = useKanbanContext();
    const { moveColumn, moveTask, setActive, setState, addColumn } = useKanbanActions();
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");
    const [prevKanbanState, setPrevKanbanState] = useState<KanbanState>(state);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const items = useMemo(() => state.columns.map((item) => item.id), [state.columns]);

    const setActiveItem = useCallback(
        (event: DragStartEvent) => {
            const { current } = event.active.data;

            if (current) {
                if (current.type === "column") setActive(current.column);
                if (current.type === "task") setActive(current.task);
            }
        },
        [setActive],
    );

    const handleColumnMove = useCallback(
        (activeId: string, overId: string) => {
            const targetIndex = state.columns.findIndex((column) => column.id === overId);

            moveColumn(activeId, targetIndex);
        },
        [moveColumn, state.columns],
    );

    const handleTaskMove = useCallback(
        (taskId: string, overId: string) => {
            const targetColumn = state.columns.find((column) => column.id === overId);

            // `over` is a column only if the column is empty
            if (targetColumn) {
                moveTask({
                    taskId,
                    targetIndex: -1,
                    targetColumnId: overId,
                });

                // `over` is a task
            } else {
                const targetTaskIndex = state.tasks.findIndex((task) => task.id === overId)!;

                moveTask({
                    taskId,
                    targetIndex: targetTaskIndex,
                    targetColumnId: state.tasks[targetTaskIndex].columnId,
                });
            }
        },
        [moveTask, state.columns, state.tasks],
    );

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            setPrevKanbanState(state);
            setActiveItem(event);
        },
        [setActiveItem, state],
    );

    // NOTE: used only for tasks while moving them between columns
    const handleDragOver = useCallback(
        ({ active, over }: DragOverEvent) => {
            if (active.data.current?.type !== "task" || !over) return;

            switch (over.data.current?.type) {
                case "task": {
                    if (
                        active.data.current?.sortable.containerId !==
                        over.data.current?.sortable.containerId
                    ) {
                        const overTask = state.tasks.find((task) => task.id === over.id);
                        const targetColumn = overTask
                            ? state.columns.find((column) => column.id === overTask.columnId)
                            : state.columns.find((column) => column.id === over.id);

                        if (targetColumn) {
                            const activeTask = state.tasks.find((t) => t.id === active.id);
                            const tasksInTargetColumn = state.tasks
                                .filter((task) => task.columnId === targetColumn.id)
                                .sort((a, b) => a.position - b.position);

                            let targetIndex = over.data.current?.sortable.index ?? 0;
                            if (activeTask && overTask && activeTask.columnId === targetColumn.id) {
                                const activeIndex = tasksInTargetColumn.findIndex(
                                    (t) => t.id === activeTask.id,
                                );
                                const overIndex = tasksInTargetColumn.findIndex(
                                    (t) => t.id === overTask.id,
                                );
                                if (activeIndex < overIndex) targetIndex = overIndex + 1;
                            }

                            moveTask(
                                {
                                    targetColumnId: targetColumn.id,
                                    targetIndex,
                                    taskId: active.id.toString(),
                                },
                                { persist: false },
                            );
                        }
                    }

                    break;
                }
                case "column":
                    moveTask(
                        {
                            taskId: active.id.toString(),
                            targetIndex: -1,
                            targetColumnId: over.id.toString(),
                        },
                        { persist: false },
                    );
                    break;
                default:
                    console.warn(`Type ${over.data.current?.type} is not defined.`);
            }
        },
        [moveTask, state.columns, state.tasks],
    );

    const handleDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            setActive(null);

            if (!over) return;

            const isColumn = active.data.current?.type === "column";
            const isTask = active.data.current?.type === "task";

            if (isColumn) handleColumnMove(active.id.toString(), over.id.toString());
            else if (isTask) handleTaskMove(active.id.toString(), over.id.toString());
        },
        [setActive, handleColumnMove, handleTaskMove],
    );

    const handleAddColumn = async () => {
        if (!props.boardId) return;

        await addColumn(props.boardId, newColumnName.trim());

        setNewColumnName("");
        setIsAddColumnOpen(false);
    };

    const isBoardLoaded = props.boardId
        ? state.columns.some((c) => c.boardId === props.boardId) || state.columns.length === 0
        : true;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragCancel={() => setState(prevKanbanState)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex min-h-screen gap-2 overflow-x-auto overflow-y-hidden bg-background p-6">
                <SortableContext items={items} strategy={horizontalListSortingStrategy}>
                    {!isBoardLoaded ? (
                        <div className="px-4 py-2 text-muted-foreground">Loading…</div>
                    ) : (
                        state.columns
                            .sort((a, b) => a.position - b.position)
                            .map((column) => (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    tasks={state.tasks
                                        .filter((task) => task.columnId === column.id)
                                        .sort((a, b) => a.position - b.position)}
                                />
                            ))
                    )}
                </SortableContext>
                <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">Add column</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New column</DialogTitle>
                        </DialogHeader>
                        <DialogDescription></DialogDescription>
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
                            <Button
                                disabled={!props.boardId || !newColumnName.trim()}
                                onClick={handleAddColumn}
                            >
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
