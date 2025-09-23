import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import type { Board } from "@/db/types";
import { createBoard, updateBoard } from "@/services/boardService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useKanbanContext } from "@/contexts/kanbanContext";

export default function HomePage() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [editingBoard, setEditingBoard] = useState<Board | null>(null);

    const { state } = useKanbanContext();

    const canSubmit = useMemo(() => nameInput.trim().length > 0, [nameInput]);

    const handleCreate = async () => {
        if (!canSubmit) return;
        await createBoard(nameInput.trim());
        setNameInput("");
        setIsAddOpen(false);
    };

    const handleStartEdit = (board: Board) => {
        setEditingBoard(board);
        setNameInput(board.name);
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        if (!editingBoard || !canSubmit) return;
        await updateBoard(editingBoard.id, { name: nameInput.trim() });
        setIsEditOpen(false);
        setEditingBoard(null);
        setNameInput("");
    };

    return (
        <div className="mx-auto max-w-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Boards</h1>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>Create board</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New board</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <label className="text-sm">Name</label>
                            <input
                                className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-1 ring-inset ring-border focus:ring-2"
                                placeholder="e.g. Personal"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button disabled={!canSubmit} onClick={handleCreate}>
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {state.boards.map((b) => (
                    <li key={b.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="min-w-0">
                            <Link className="font-medium hover:underline" to={`/${b.id}`}>
                                {b.name}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                                {new Date(b.createdAt).toLocaleString()}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => handleStartEdit(b)}>
                                Edit
                            </Button>
                            <Link to={`/${b.id}`}>
                                <Button>Open</Button>
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit board</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <label className="text-sm">Name</label>
                        <input
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-1 ring-inset ring-border focus:ring-2"
                            placeholder="Board name"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button disabled={!canSubmit} onClick={handleEdit}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
