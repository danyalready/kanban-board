import { Link } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { CalendarIcon, MessageCircleMoreIcon, GripIcon } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { getPriorityColor } from "@/shared/utils/getPriorityColor";
import { formatDate } from "@/shared/utils/formatDate";
import type { Task } from "@/domain/kanban/types";

import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Avatar } from "@/shared/ui/avatar";
import { PriorityIcon } from "@/shared/ui/priority-icon/PriorityIcon";

interface Props {
    task: Task;
    commentsCount: number;
    isOverlay?: boolean;
    className?: string;
    gripClassName?: string;
}

export default function Task(props: Props) {
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

    const Element = props.isOverlay ? "div" : Link;

    return (
        <Element
            ref={setNodeRef}
            style={style}
            to={`?task=${props.task.id}`}
            className={cn(
                "flex min-w-72 select-none flex-col gap-3 rounded-lg bg-card p-3 shadow-sm ring-1 ring-inset ring-border",
                props.className,
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <Badge variant="outline" className="flex gap-1 capitalize">
                    <PriorityIcon
                        priority={props.task.priority}
                        className="size-4"
                        color={getPriorityColor(props.task.priority)}
                    />
                    {props.task.priority}
                </Badge>

                <div
                    {...listeners}
                    {...attributes}
                    className={cn("cursor-grab p-1 text-gray-400", props.gripClassName)}
                >
                    <GripIcon size={16} />
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
                        <MessageCircleMoreIcon size={12} />
                        <span className="text-xs">{props.commentsCount}</span>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex items-center gap-1">
                        <CalendarIcon size={12} />
                        <span className="text-xs">{formatDate(props.task.createdAt)}</span>
                    </div>
                </div>
            </div>
        </Element>
    );
}
