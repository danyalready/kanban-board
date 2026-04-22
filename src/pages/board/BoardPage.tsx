import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import Board from "@/components/Board";
import { useKanbanContext } from "@/contexts/kanbanContext";
import { useKanbanActions } from "@/contexts/useKanbanActions";
import type { KanbanState } from "@/reducers/kanbanTypes";

import CreateTaskFormDialog, { type Inputs } from "./CreateTaskFormDialog";
import ViewEditTaskDialog from "./ViewEditTaskDialog";

export default function BoardPage() {
    const { boardId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { state } = useKanbanContext();
    const {
        addTask,
        updateTask,
        moveColumn,
        moveTask,
        setActive,
        setState,
        updateColumn,
        loadBoardData,
        clearBoardData,
    } = useKanbanActions();
    const [prevKanbanState, setPrevKanbanState] = useState<KanbanState>(state);
    const [isAddTaskFormOpenFor, setIsAddTaskOpenFor] = useState<null | string>(null);

    const taskId = searchParams.get("task");
    const task = state.tasks.find((task) => task.id === taskId);

    const handleTaskDetailsModalClose = () => {
        searchParams.delete("task");
        setSearchParams(searchParams);
    };

    const handleAddTask = (inputs: Inputs) => {
        if (!isAddTaskFormOpenFor) return;

        addTask(isAddTaskFormOpenFor, inputs);
        setIsAddTaskOpenFor(null);
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
                onClickAddTaskTo={(columnId) => setIsAddTaskOpenFor(columnId)}
            />

            <CreateTaskFormDialog
                open={Boolean(isAddTaskFormOpenFor)}
                onOpenChange={() => setIsAddTaskOpenFor(null)}
                onSubmit={handleAddTask}
            />

            <ViewEditTaskDialog
                open={Boolean(task)}
                task={task}
                onOpenChange={handleTaskDetailsModalClose}
                onTaskChange={updateTask}
            />
        </div>
    );
}
