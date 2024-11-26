import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Ellipsis, Plus } from "lucide-react";

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

interface ColumnProps {
    column: Column;
    className?: string;
}

export function KanbanColumn(props: ColumnProps) {
    const { setNodeRef } = useDroppable({ id: props.column.id });

    return (
        <SortableContext id={props.column.id} items={props.column.tasks}>
            <div className="w-[320px]">
                <div
                    ref={setNodeRef}
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

                        <div className="flex">
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
                    </div>

                    <div className="flex flex-col gap-1.5 px-1">
                        {props.column.tasks.map((task) => (
                            <KanbanTask key={task.id} task={task} />
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
