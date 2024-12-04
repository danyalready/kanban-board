import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Ellipsis, Plus } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";

import { type Column } from "@/kanbanReducer";
import { cn } from "@/lib/utils";

import { KanbanTask } from "./KanbanTask";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useKanbanContext } from "@/kanbanContext";

interface ColumnProps {
    column: Column;
    className?: string;
}

export function KanbanColumn(props: ColumnProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props.column.id,
        data: {
            type: "column",
            column: props.column,
        },
    });
    const { state } = useKanbanContext();

    const style = {
        opacity: isDragging ? 0 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const tasks = state.tasks.filter((item) => item.columnId === props.column.id);

    return (
        <SortableContext items={props.column.tasks} strategy={verticalListSortingStrategy}>
            <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
                <div
                    className={cn(
                        "flex flex-col gap-3 rounded-xl bg-secondary pt-3 shadow-sm ring-1 ring-inset ring-border",
                        props.className,
                    )}
                >
                    <div className="flex items-center justify-between px-4">
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

                    <div className="flex flex-col gap-1.5 px-1">
                        {tasks.map((item) => (
                            <KanbanTask key={item.id} task={item} />
                        ))}
                    </div>

                    <div>
                        <Button variant="link">
                            <Plus />
                            Add Task
                        </Button>
                    </div>
                </div>
            </div>
        </SortableContext>
    );
}
