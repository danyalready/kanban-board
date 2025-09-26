import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Ellipsis, SquarePlus, Trash2, Pencil } from "lucide-react";

import { cn } from "@/utils/cn";
import type { Column, Task } from "@/db/types";
import { useKanbanActions } from "@/contexts/useKanbanActions";

import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import KanbanTask from "./KanbanTask";

interface Props {
    column: Column;
    tasks: Task[];
    className?: string;
    headerClassName?: string;
}

export default function KanbanColumn(props: Props) {
    const { updateColumn, deleteColumn, addTask } = useKanbanActions();

    const handleRename = async () => {
        const next = prompt("Rename column", props.column.name);
        if (next && next.trim() && next !== props.column.name) {
            await updateColumn(props.column.id, { name: next.trim() });
        }
    };

    const handleDelete = async () => {
        if (confirm("Delete this column and its tasks?")) {
            await deleteColumn(props.column.id);
        }
    };

    const handleAddTask = async () => {
        const title = prompt("New task title");
        if (title && title.trim()) {
            await addTask(props.column.id, title.trim());
        }
    };

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
        <div className="min-h-full min-w-80" ref={setNodeRef}>
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
                    className={cn("flex cursor-grab items-center justify-between px-4", props.headerClassName)}
                >
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold">{props.column.name}</h2>
                        <Badge variant="outline">{props.tasks.length}</Badge>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="link">
                                <Ellipsis />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleRename}>
                                <Pencil />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleAddTask}>
                                <SquarePlus />
                                Add task
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                                <Trash2 />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <SortableContext items={props.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex min-h-12 flex-col gap-1 px-1">
                        {props.tasks.map((task) => (
                            <KanbanTask key={task.id} task={task} />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
