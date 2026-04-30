import { useState } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/shared/utils/cn";
import type { Column, Comment, Task as TaskT } from "@/domain/kanban/types";
import { countCommentsByTaskId } from "@/domain/kanban/comments";

import Task from "../Task";
import ColumnActions from "./ColumnActions";
import ColumnEditableTitle from "./ColumnEditableTitle";

interface Props {
    column: Column;
    tasks: TaskT[];
    comments: Comment[];
    className?: string;
    headerClassName?: string;
    onColumnNameChange: (value: string) => void;
    onClickAddTask: () => void;
    onClickDelete: () => void;
}

export default function Column(props: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props.column.id,
        data: {
            type: "column",
            column: props.column,
        },
    });

    const style = {
        opacity: isDragging ? 0 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div className="min-h-full w-80 flex-shrink-0" ref={setNodeRef}>
            <div
                style={style}
                className={cn(
                    "flex select-none flex-col gap-3 rounded-xl bg-secondary py-1 shadow-sm ring-1 ring-inset ring-border",
                    props.className,
                )}
            >
                <div
                    {...listeners}
                    {...attributes}
                    className={cn(
                        "flex cursor-grab items-center justify-between px-4 pt-2",
                        props.headerClassName,
                    )}
                >
                    <ColumnEditableTitle
                        title={props.column.name}
                        count={props.tasks.length}
                        onChange={props.onColumnNameChange}
                    />

                    <ColumnActions
                        open={isMenuOpen}
                        onOpenChange={setIsMenuOpen}
                        onClickAddTask={props.onClickAddTask}
                        onClickDelete={props.onClickDelete}
                    />
                </div>

                <SortableContext items={props.tasks} strategy={verticalListSortingStrategy}>
                    <div className="flex min-h-12 flex-col gap-1 px-1">
                        {props.tasks.map((task) => (
                            <Task
                                key={task.id}
                                task={task}
                                commentsCount={countCommentsByTaskId(task.id, props.comments)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
