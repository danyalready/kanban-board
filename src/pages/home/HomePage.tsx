import { useState } from "react";

import { Button } from "@/shared/ui/button";
import { useBoardActions } from "@/features/kanban/hooks/useBoardActions";
import type { Board } from "@/domain/kanban/types";
import { useKanban } from "@/app/kanban/useKanban";
import { t } from "@/shared/i18n";

import BoardFormDialog, { type Inputs } from "./BoardFormDialog";
import BoardsList from "./BoardsList";
import DeleteBoardDialog from "./DeleteBoardDialog";
import NoBoardsState from "./NoBoardsState";

export default function HomePage() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);
    const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

    const { state } = useKanban();
    const { addBoard, updateBoard, deleteBoard } = useBoardActions();

    const handleCreate = (inputs: Inputs) => {
        addBoard(inputs.boardName);
        setIsAddOpen(false);
    };

    const handleEdit = (inputs: Inputs) => {
        if (!boardToEdit) return;

        updateBoard(boardToEdit.id, { name: inputs.boardName });

        setBoardToEdit(null);
    };

    const handleDelete = () => {
        if (!boardToDelete) return;

        deleteBoard(boardToDelete.id);
        setBoardToDelete(null);
    };

    return (
        <div className="mx-auto max-w-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold">{t("board.boards")}</h1>
                <Button onClick={() => setIsAddOpen(true)}>{t("action.createBoard")}</Button>
            </div>

            {state.boards.length ? (
                <BoardsList
                    boards={state.boards.sort((a, b) => b.createdAt - a.createdAt)}
                    onClickEdit={setBoardToEdit}
                    onClickDelete={setBoardToDelete}
                />
            ) : (
                <NoBoardsState />
            )}

            <BoardFormDialog open={isAddOpen} onSubmit={handleCreate} onOpenChange={setIsAddOpen} />

            <BoardFormDialog
                open={Boolean(boardToEdit)}
                initialValues={{ boardName: boardToEdit?.name || "" }}
                onOpenChange={() => setBoardToEdit(null)}
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
