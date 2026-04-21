import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import Board from "@/components/Board";
import { useKanbanContext } from "@/contexts/kanbanContext";
import { useKanbanActions } from "@/contexts/useKanbanActions";
import type { KanbanState } from "@/reducers/kanbanTypes";

import TaskFormDialog from "./task-form-dialog/TaskFormDialog";
import CreateTaskFormDialog from "./CreateTaskFormDialog";

export default function BoardPage() {
    const { boardId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { state } = useKanbanContext();
    const {
        moveColumn,
        moveTask,
        setActive,
        setState,
        updateColumn,
        loadBoardData,
        clearBoardData,
    } = useKanbanActions();
    const [prevKanbanState, setPrevKanbanState] = useState<KanbanState>(state);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

    const taskId = searchParams.get("task");
    const task = state.tasks.find((task) => task.id === taskId);

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
            <Board
                columns={state.columns.sort((a, b) => a.position - b.position)}
                tasks={state.tasks.sort((a, b) => a.position - b.position)}
                onSetActive={setActive}
                onMoveColumn={moveColumn}
                onMoveTask={moveTask}
                onDragStart={() => setPrevKanbanState(state)}
                onDragCancel={() => setState(prevKanbanState)}
                onDragEnd={() => setActive(null)}
                onColumnChange={updateColumn}
                onClickAddTask={() => setIsTaskFormOpen(true)}
            />

            <TaskFormDialog
                open={!!taskId}
                initialValues={{
                    title: task?.title || "",
                    description: task?.description || "",
                    priority: task?.priority || "low",
                }}
                isEdit
                onOpenChange={handleTaskDetailsModalClose}
            />

            <CreateTaskFormDialog
                open={isTaskFormOpen}
                onOpenChange={setIsTaskFormOpen}
                onSubmit={(inputs) => console.log(inputs)}
            />
        </div>
    );
}
