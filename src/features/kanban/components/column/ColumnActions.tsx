import { EllipsisIcon, SquarePlusIcon, Trash2Icon } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClickAddTask: () => void;
    onClickDelete: () => void;
}

export default function ColumnActions(props: Props) {
    const handleAddTaskClick = () => {
        props.onClickAddTask();
        props.onOpenChange(false);
    };

    const handleDeleteTaskClick = () => {
        props.onClickDelete();
        props.onOpenChange(false);
    };

    return (
        <DropdownMenu open={props.open} onOpenChange={props.onOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="link">
                    <EllipsisIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAddTaskClick}>
                    <SquarePlusIcon />
                    Add task
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleDeleteTaskClick}>
                    <Trash2Icon />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
