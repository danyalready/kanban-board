import { useEffect } from "react";
import { useParams } from "react-router-dom";

import KanbanBoard from "@/components/KanbanBoard";
import { useKanbanActions } from "@/contexts/useKanbanActions";

export default function BoardPage() {
    const { boardId } = useParams();
    const { loadBoardData, clearBoardData } = useKanbanActions();

    useEffect(() => {
        if (boardId) loadBoardData(boardId);

        return () => clearBoardData();
    }, [boardId, loadBoardData, clearBoardData]);

    return <KanbanBoard boardId={boardId} />;
}
