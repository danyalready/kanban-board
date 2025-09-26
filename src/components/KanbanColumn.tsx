import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

interface Props {
    column: Column;
    tasks: Task[];
    className?: string;
    headerClassName?: string;
}

export default function KanbanColumn(props: Props) {
    const { updateColumn, deleteColumn, addTask } = useKanbanActions();

    const [renameValue, setRenameValue] = useState(props.column.name);
    const [taskTitle, setTaskTitle] = useState("");

    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    const items = useMemo(() => props.tasks.map((task) => task.id), [props.tasks]);

    const openRename = () => {
        setRenameValue(props.column.name);
        setIsOpenMenu(false);
        setIsRenameOpen(true);
    };

    const confirmRename = async () => {
        const next = renameValue.trim();
        if (next && next !== props.column.name) {
            await updateColumn(props.column.id, { name: next });
        }
        setIsRenameOpen(false);
    };

    const handleDelete = async () => {
        if (confirm("Delete this column and its tasks?")) {
            await deleteColumn(props.column.id);
        }
    };

    const openAddTask = () => {
        setTaskTitle("");
        setIsOpenMenu(false);
        setIsAddTaskOpen(true);
    };

    const confirmAddTask = async () => {
        const title = taskTitle.trim();
        if (title) {
            await addTask(props.column.id, title);
        }
        setIsAddTaskOpen(false);
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
        <>
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

                        <DropdownMenu open={isOpenMenu} onOpenChange={setIsOpenMenu}>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="link">
                                    <Ellipsis />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={openRename}>
                                    <Pencil />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={openAddTask}>
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

                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        <div className="flex min-h-12 flex-col gap-1 px-1">
                            {props.tasks.map((task) => (
                                <KanbanTask key={task.id} task={task} />
                            ))}
                        </div>
                    </SortableContext>
                </div>
            </div>

            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename column</DialogTitle>
                    </DialogHeader>
                    <DialogDescription></DialogDescription>
                    <div className="space-y-2">
                        <label className="text-sm">Name</label>
                        <input
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-1 ring-inset ring-border focus:ring-2"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={!renameValue.trim()} onClick={confirmRename}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New task</DialogTitle>
                    </DialogHeader>
                    <DialogDescription></DialogDescription>
                    <div className="space-y-2">
                        <label className="text-sm">Title</label>
                        <input
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-1 ring-inset ring-border focus:ring-2"
                            placeholder="e.g. Fix bug"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={!taskTitle.trim()} onClick={confirmAddTask}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
