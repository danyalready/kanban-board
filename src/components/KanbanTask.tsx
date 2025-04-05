import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Calendar, Flag, MessageCircleMore, Grip } from "lucide-react";

import { cn } from "@/utils/cn";
import { getPriorityColor } from "@/utils/getPriorityColor";
import type { Task } from "@/db/types";

import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Avatar } from "./ui/avatar";

interface Props {
    task: Task;
    isOverlay?: boolean;
    className?: string;
    gripClassName?: string;
}

export default function KanbanTask(props: Props) {
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

    const Element = props.isOverlay ? "div" : "a";

    return (
        <Element
            ref={setNodeRef}
            style={style}
            href={`?task=${props.task.id}`}
            className={cn(
                "flex min-w-72 select-none flex-col gap-3 rounded-lg bg-card p-3 shadow-sm ring-1 ring-inset ring-border",
                props.className,
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <Badge variant="outline" className="flex gap-1 capitalize">
                    <Flag
                        size={10}
                        color={getPriorityColor(props.task.priority)}
                        fill={getPriorityColor(props.task.priority)}
                    />
                    {props.task.priority}
                </Badge>

                <div
                    {...listeners}
                    {...attributes}
                    className={cn("cursor-grab p-1 text-gray-400", props.gripClassName)}
                >
                    <Grip size={16} />
                </div>
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
                        <span className="text-xs">{0}</span>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span className="text-xs">Today</span>
                    </div>
                </div>
            </div>
        </Element>
    );
}
