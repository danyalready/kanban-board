import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import KanbanBoard from "@/components/KanbanBoard";
import { useKanbanActions } from "@/contexts/useKanbanActions";
import KanbanTaskDetailsModal from "@/components/KanbanTaskDetailsModal";
import { useKanbanContext } from "@/contexts/kanbanContext";

export default function BoardPage() {
    const { boardId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const { state } = useKanbanContext();
    const { loadBoardData, clearBoardData } = useKanbanActions();

    const taskId = searchParams.get("task");

    const handleTaskDetailsModalClose = () => {
        searchParams.delete("task");
        setSearchParams(searchParams);
    };

    useEffect(() => {
        if (boardId) loadBoardData(boardId);

        return () => clearBoardData();
    }, [boardId, loadBoardData, clearBoardData]);

    return (
        <div>
            <KanbanBoard boardId={boardId} />

            <KanbanTaskDetailsModal
                task={state.tasks.find((task) => task.id === taskId) || null}
                onClose={handleTaskDetailsModalClose}
            />
        </div>
    );
}
