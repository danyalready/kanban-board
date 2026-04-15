import { useCallback, useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
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
import { filterTasksByColumn } from "@/model/task-ordering";

import Column from "./column/Column";
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
import DragOverlay from "./DragOverlay";

export default function Board(props: { boardId?: string }) {
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
                const targetTask = state.tasks.find((task) => task.id === overId)!;
                const targetColumnTasks = filterTasksByColumn(state.tasks, targetTask.columnId);
                const targetTaskIndex = targetColumnTasks.findIndex((task) => task.id === overId)!;

                moveTask({
                    taskId,
                    targetIndex: targetTaskIndex,
                    targetColumnId: targetTask.columnId,
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
            const activeCurrent = active.data.current;
            const overCurrent = over?.data.current;

            if (activeCurrent?.type !== "task" || !overCurrent) return;

            const isOverTask = overCurrent.type === "task";
            const isOverColumn = overCurrent.type === "column";
            const isMovingToAnotherColumn =
                activeCurrent.sortable.containerId !== overCurrent.sortable.containerId;

            if (isOverTask && isMovingToAnotherColumn) {
                const targetColumnTasks = filterTasksByColumn(state.tasks, overCurrent!.columnId);
                const targetIndex = targetColumnTasks.findIndex((task) => task.id === over.id);

                moveTask(
                    {
                        taskId: active.id.toString(),
                        targetIndex,
                        targetColumnId: overCurrent.task.columnId,
                    },
                    { persist: false },
                );
            } else if (isOverColumn) {
                moveTask(
                    {
                        taskId: active.id.toString(),
                        targetIndex: -1,
                        targetColumnId: over.id.toString(),
                    },
                    { persist: false },
                );
            }
        },
        [moveTask, state.tasks],
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
                                <Column
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
                        <Button variant="outline">
                            <PlusIcon /> Add column
                        </Button>
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

            <DragOverlay />
        </DndContext>
    );
}
