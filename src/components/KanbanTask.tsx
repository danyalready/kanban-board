import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Calendar, Flag, MessageCircleMore } from "lucide-react";

import { type Task } from "@/kanbanReducer";
import { cn } from "@/lib/utils";

import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Avatar } from "./ui/avatar";

interface KanbanTaskProps {
    task: Task;
    className?: string;
}

export function KanbanTask(props: KanbanTaskProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props.task.id,
        data: {
            type: "task",
            task: props.task,
        },
    });

    const style = {
        opacity: isDragging ? 0 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const priorityColor =
        props.task.priority === "low" ? "#f1c06f" : props.task.priority === "medium" ? "#0e9ceb" : "#fa1877";

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "flex flex-col gap-3 rounded-md bg-card p-3 shadow-sm ring-1 ring-inset ring-border",
                props.className,
            )}
        >
            <div className="flex gap-3">
                <Badge variant="outline" className="flex gap-1 capitalize">
                    <Flag size={10} color={priorityColor} fill={priorityColor} />
                    {props.task.priority}
                </Badge>
            </div>
            <div className="flex items-start justify-between">
                <h3 className="font-medium">{props.task.title}</h3>
            </div>

            <Separator orientation="horizontal" />

            <div className="flex items-center justify-between gap-2">
                <Avatar className="size-6">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>DO</AvatarFallback>
                </Avatar>

                <div className="flex h-5 gap-2">
                    <div className="flex items-center gap-1">
                        <MessageCircleMore size={12} />
                        <span className="text-xs">{props.task.comments.length}</span>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span className="text-xs">Today</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
