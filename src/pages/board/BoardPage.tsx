import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import Board from "@/components/Board";
import { useKanbanActions } from "@/contexts/useKanbanActions";
import TaskFormDialog from "@/components/TaskFormDialog";
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
            <Board boardId={boardId} />

            <TaskFormDialog
                task={state.tasks.find((task) => task.id === taskId) || null}
                onClose={handleTaskDetailsModalClose}
            />
        </div>
    );
}
