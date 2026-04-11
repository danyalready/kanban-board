import { useMemo, useState } from "react";

import type { Board } from "@/db/types";
import { createBoard, updateBoard } from "@/services/boardService";
import { Button } from "@/components/ui/button";
import { useKanbanContext } from "@/contexts/kanbanContext";

import BoardFormDialog from "./BoardFormDialog";
import BoardsList from "./BoardsList";

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
                <Button onClick={() => setIsAddOpen(true)}>Create board</Button>
            </div>

            <BoardsList boards={state.boards} onClickEdit={handleStartEdit} />

            {/* Dialogs */}
            <BoardFormDialog open={isAddOpen} onSubmit={handleCreate} onOpenChange={setIsAddOpen} />
            <BoardFormDialog
                open={isEditOpen}
                initialValues={{ boardName: nameInput }}
                onOpenChange={setIsEditOpen}
                onSubmit={handleEdit}
            />
        </div>
    );
}
