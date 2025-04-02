import { useMemo } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Ellipsis, Plus } from "lucide-react";

import type { Column, Task } from "@/store/types";
import { cn } from "@/utils/cn";
import { useKanbanContext } from "@/contexts/kanbanContext";

import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import KanbanTask from "./KanbanTask";

interface Props {
    column: Column;
    className?: string;
    headerClassName?: string;
}

export default function KanbanColumn(props: Props) {
    const { state } = useKanbanContext();
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

    const columnTasks: Task[] = useMemo(
        () =>
            props.column.tasks
                .map((taskId) => state.tasks.find((task) => task.id === taskId))
                .filter((task): task is Task => task !== undefined),
        [props.column.tasks, state.tasks],
    );

    return (
        <div className="min-h-full min-w-80" ref={setNodeRef}>
            <div
                style={style}
                className={cn(
                    "flex select-none flex-col gap-3 rounded-xl bg-secondary pt-3 shadow-sm ring-1 ring-inset ring-border",
                    props.className,
                )}
            >
                <div
                    {...listeners}
                    {...attributes}
                    className={cn("flex cursor-grab items-center justify-between px-4", props.headerClassName)}
                >
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold">{props.column.title}</h2>
                        <span className="text-sm font-light text-gray-500">{props.column.tasks.length}</span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="link">
                                <Ellipsis />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <SortableContext items={props.column.tasks} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-1.5 px-1">
                        {columnTasks.map((item) => (
                            <KanbanTask key={item.id} task={item} />
                        ))}
                    </div>
                </SortableContext>

                <div>
                    <Button variant="link">
                        <Plus />
                        Add Task
                    </Button>
                </div>
            </div>
        </div>
    );
}
