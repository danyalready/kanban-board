import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { createBoard, updateBoard } from "@/services/boardService";
import { useKanbanContext } from "@/contexts/kanbanContext";
import { useKanbanActions } from "@/contexts/useKanbanActions";
import type { Board } from "@/db/types";

import BoardFormDialog from "./BoardFormDialog";
import BoardsList from "./BoardsList";
import DeleteBoardDialog from "./DeleteBoardDialog";

export default function HomePage() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [editingBoard, setEditingBoard] = useState<Board | null>(null);
    const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

    const { state } = useKanbanContext();
    const { deleteBoard } = useKanbanActions();

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

    const handleDelete = () => {
        if (!boardToDelete) return;

        deleteBoard(boardToDelete.id);
        setBoardToDelete(null);
    };

    return (
        <div className="mx-auto max-w-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Boards</h1>
                <Button onClick={() => setIsAddOpen(true)}>Create board</Button>
            </div>

            <BoardsList
                boards={state.boards}
                onClickEdit={handleStartEdit}
                onClickDelete={setBoardToDelete}
            />

            <BoardFormDialog open={isAddOpen} onSubmit={handleCreate} onOpenChange={setIsAddOpen} />

            <BoardFormDialog
                open={isEditOpen}
                initialValues={{ boardName: nameInput }}
                onOpenChange={setIsEditOpen}
                onSubmit={handleEdit}
            />

            <DeleteBoardDialog
                open={Boolean(boardToDelete)}
                boardName={boardToDelete?.name}
                onOpenChange={() => setBoardToDelete(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
