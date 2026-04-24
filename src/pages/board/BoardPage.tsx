import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import Board from "@/components/Board";
import { useKanbanContext } from "@/contexts/kanbanContext";
import { useKanbanActions } from "@/contexts/useKanbanActions";
import type { KanbanState } from "@/reducers/kanbanTypes";
import type { Column, Task } from "@/db/types";

import CreateTaskFormDialog, { type Inputs as TaskFormInputs } from "./CreateTaskFormDialog";
import AddColumnFormDialog, { type Inputs as ColumnFormInputs } from "./AddColumnFormDialog";
import ViewEditTaskDialog from "./ViewEditTaskDialog";
import DeleteColumnDialog from "./DeleteColumnDialog";
import DeleteTaskDialog from "./DeleteTaskDialog";

export default function BoardPage() {
    const { boardId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { state } = useKanbanContext();
    const {
        addTask,
        addColumn,
        moveTask,
        updateTask,
        moveColumn,
        updateColumn,
        deleteColumn,
        deleteTask,
        setActive,
        setState,
        loadBoardData,
        clearBoardData,
    } = useKanbanActions();
    const [prevKanbanState, setPrevKanbanState] = useState<KanbanState>(state);
    const [isAddTaskFormOpenFor, setIsAddTaskOpenFor] = useState<null | string>(null);
    const [isAddColumnFormOpen, setIsAddColumnFormOpen] = useState(false);
    const [columnToDelete, setColumnToDelete] = useState<Column | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    const taskId = searchParams.get("task");
    const task = state.tasks.find((task) => task.id === taskId);

    const handleTaskDetailsModalClose = () => {
        searchParams.delete("task");
        setSearchParams(searchParams);
    };

    const handleAddTask = (inputs: TaskFormInputs) => {
        if (!isAddTaskFormOpenFor) return;

        addTask(isAddTaskFormOpenFor, inputs);
        setIsAddTaskOpenFor(null);
    };

    const handleAddColumn = (inputs: ColumnFormInputs) => {
        if (!boardId) return;

        addColumn(boardId, inputs.name);
        setIsAddColumnFormOpen(false);
    };

    const handleDeleteColumn = () => {
        if (!columnToDelete) return;

        deleteColumn(columnToDelete.id);
        setColumnToDelete(null);
    };

    const handleDeleteTask = () => {
        if (!taskToDelete) return;

        deleteTask(taskToDelete.id);
        setTaskToDelete(null);
    };

    useEffect(() => {
        if (boardId) loadBoardData(boardId);

        return () => clearBoardData();
    }, [boardId, loadBoardData, clearBoardData]);

    return (
        <div className="h-full">
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
                onClickAddColumn={() => setIsAddColumnFormOpen(true)}
                onClickDeleteColumn={setColumnToDelete}
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
                onDeleteTask={() => task && setTaskToDelete(task)}
            />

            <AddColumnFormDialog
                open={isAddColumnFormOpen}
                onOpenChange={setIsAddColumnFormOpen}
                onSubmit={handleAddColumn}
            />

            <DeleteColumnDialog
                columnName={columnToDelete?.name}
                open={Boolean(columnToDelete)}
                onOpenChange={() => setColumnToDelete(null)}
                onConfirm={handleDeleteColumn}
            />

            <DeleteTaskDialog
                taskName={taskToDelete?.title}
                open={Boolean(taskToDelete)}
                onOpenChange={() => setTaskToDelete(null)}
                onConfirm={handleDeleteTask}
            />
        </div>
    );
}
