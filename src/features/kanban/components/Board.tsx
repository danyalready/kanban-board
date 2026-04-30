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
import { PlusIcon } from "lucide-react";

import { filterTasksByColumn } from "@/domain/kanban/taskOrdering";
import type { Column as ColumnT, Comment, Task as TaskT } from "@/domain/kanban/types";
import { Button } from "@/shared/ui/button";
import { t } from "@/shared/i18n";

import Column from "./column/Column";
import DragOverlay from "./DragOverlay";

interface Props {
    columns: ColumnT[];
    tasks: TaskT[];
    comments: Comment[];
    onSetActive: (item: ColumnT | TaskT) => void;
    onMoveTask: (
        params: { taskId: string; targetColumnId: string; targetIndex: number },
        persist?: boolean,
    ) => void;
    onMoveColumn: (id: string, targetIndex: number) => void;
    onDragStart: () => void;
    onDragCancel: () => void;
    onDragEnd: () => void;
    onColumnChange: (columndId: string, data: Partial<{ name: string; position: number }>) => void;
    onClickAddTaskTo: (columnId: string) => void;
    onClickAddColumn: () => void;
    onClickDeleteColumn: (column: ColumnT) => void;
}

export default function Board(props: Props) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const setActiveItem = (event: DragStartEvent) => {
        const { current } = event.active.data;

        if (current) {
            if (current.type === "column") props.onSetActive(current.column);
            if (current.type === "task") props.onSetActive(current.task);
        }
    };

    const handleColumnMove = (activeId: string, overId: string) => {
        const targetIndex = props.columns.findIndex((column) => column.id === overId);

        props.onMoveColumn(activeId, targetIndex);
    };

    const handleTaskMove = (taskId: string, overId: string) => {
        const targetColumn = props.columns.find((column) => column.id === overId);

        // `over` is a column only if the column is empty
        if (targetColumn) {
            props.onMoveTask({ taskId: taskId, targetColumnId: overId, targetIndex: -1 });

            // `over` is a task
        } else {
            const targetTask = props.tasks.find((task) => task.id === overId)!;
            const targetColumnTasks = filterTasksByColumn(props.tasks, targetTask.columnId);
            const targetTaskIndex = targetColumnTasks.findIndex((task) => task.id === overId)!;

            props.onMoveTask({
                taskId: taskId,
                targetColumnId: targetTask.columnId,
                targetIndex: targetTaskIndex,
            });
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        props.onDragStart();
        setActiveItem(event);
    };

    // NOTE: used only for tasks while moving them between columns
    const handleDragOver = ({ active, over }: DragOverEvent) => {
        const activeCurrent = active.data.current;
        const overCurrent = over?.data.current;

        if (activeCurrent?.type !== "task" || !overCurrent) return;

        const isOverTask = overCurrent.type === "task";
        const isOverColumn = overCurrent.type === "column";
        const isMovingToAnotherColumn =
            activeCurrent.sortable.containerId !== overCurrent.sortable.containerId;

        if (isOverTask && isMovingToAnotherColumn) {
            const targetColumnTasks = filterTasksByColumn(props.tasks, overCurrent!.columnId);
            const targetIndex = targetColumnTasks.findIndex((task) => task.id === over.id);

            props.onMoveTask(
                {
                    taskId: active.id.toString(),
                    targetIndex,
                    targetColumnId: overCurrent.task.columnId,
                },
                false,
            );
        } else if (isOverColumn) {
            props.onMoveTask(
                {
                    taskId: active.id.toString(),
                    targetIndex: -1,
                    targetColumnId: over.id.toString(),
                },
                false,
            );
        }
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        props.onDragEnd();

        if (!over) return;

        const isColumn = active.data.current?.type === "column";
        const isTask = active.data.current?.type === "task";

        if (isColumn) handleColumnMove(active.id.toString(), over.id.toString());
        else if (isTask) handleTaskMove(active.id.toString(), over.id.toString());
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragCancel={props.onDragCancel}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-2 overflow-x-auto overflow-y-hidden bg-background p-6">
                <SortableContext items={props.columns} strategy={horizontalListSortingStrategy}>
                    {props.columns.map((column) => (
                        <Column
                            key={column.id}
                            column={column}
                            tasks={props.tasks.filter((task) => task.columnId === column.id)}
                            comments={props.comments}
                            onColumnNameChange={(name) => props.onColumnChange(column.id, { name })}
                            onClickAddTask={() => props.onClickAddTaskTo(column.id)}
                            onClickDelete={() => props.onClickDeleteColumn(column)}
                        />
                    ))}
                </SortableContext>

                <Button variant="outline" size="lg" onClick={props.onClickAddColumn}>
                    <PlusIcon /> {t("column.form.newTitle")}
                </Button>
            </div>

            <DragOverlay />
        </DndContext>
    );
}
