import { EllipsisIcon, SquarePlusIcon, Trash2Icon } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClickAddTask: () => void;
    onClickDelete: () => void;
}

export default function ColumnActions(props: Props) {
    return (
        <DropdownMenu open={props.open} onOpenChange={props.onOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="link">
                    <EllipsisIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={props.onClickAddTask}>
                    <SquarePlusIcon />
                    Add task
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={props.onClickDelete}>
                    <Trash2Icon />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
