import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { type Task } from "@/kanbanReducer";
import { Badge } from "./ui/badge";
import { Calendar, Flag, MessageCircleMore } from "lucide-react";
import { Separator } from "./ui/separator";
import { Avatar } from "./ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface KanbanTaskProps {
    task: Task;
}

export function KanbanTask(props: KanbanTaskProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.task.id });

    const style = {
        opacity: isDragging ? 0 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex flex-col gap-3 rounded-md bg-card p-3 shadow-sm ring-1 ring-inset ring-border"
        >
            <div className="flex gap-3">
                <Badge variant="outline" className="flex gap-1">
                    <Flag size={10} fill="black" /> Normal
                </Badge>
            </div>
            <div className="flex items-start justify-between">
                <h3 className="font-medium">{props.task.title}</h3>
            </div>
            <div>{props.task.description}</div>

            <Separator orientation="horizontal" />

            <div className="flex items-center justify-between gap-2">
                <Avatar className="size-6">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>DO</AvatarFallback>
                </Avatar>

                <div className="flex h-full gap-2">
                    <div className="flex items-center gap-1">
                        <MessageCircleMore size={10} />
                        <span className="text-xs">2</span>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span className="text-xs">Today</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
