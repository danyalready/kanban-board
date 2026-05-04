import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { useKanban } from "@/app/kanban/useKanban";
import { useKanbanActions } from "@/features/kanban/hooks/useKanbanActions";
import { useColumnActions } from "@/features/kanban/hooks/useColumnActions";
import { useTaskActions } from "@/features/kanban/hooks/useTaskActions";
import { useCommentActions } from "@/features/kanban/hooks/useCommentActions";
import type { KanbanState } from "@/app/kanban/types";
import type { Column, Task } from "@/domain/kanban/types";
import Board from "@/features/kanban/components/Board";

import CreateTaskFormDialog, { type Inputs as TaskFormInputs } from "./CreateTaskFormDialog";
import AddColumnFormDialog, { type Inputs as ColumnFormInputs } from "./AddColumnFormDialog";
import ViewEditTaskDialog from "./ViewEditTaskDialog";
import DeleteColumnDialog from "./DeleteColumnDialog";
import DeleteTaskDialog from "./DeleteTaskDialog";
import NoColumnsState from "./NoColumnsState";

export default function BoardPage() {
    const { boardId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { state } = useKanban();
    const { setActive, setState, loadBoardData, clearBoardData } = useKanbanActions();
    const { addColumn, updateColumn, moveColumn, deleteColumn } = useColumnActions();
    const { addTask, moveTask, updateTask, deleteTask } = useTaskActions();
    const { addComment, updateComment, deleteComment } = useCommentActions();
    const [prevKanbanState, setPrevKanbanState] = useState<KanbanState>(state);
    const [isAddTaskFormOpenFor, setIsAddTaskOpenFor] = useState<null | string>(null);
    const [isAddColumnFormOpen, setIsAddColumnFormOpen] = useState(false);
    const [columnToDelete, setColumnToDelete] = useState<Column | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    const taskId = searchParams.get("task");
    const task = state.tasks.find((task) => task.id === taskId);
    const comments = task
        ? state.comments
              .filter((comment) => comment.taskId === task.id)
              .sort((a, b) => a.createdAt - b.createdAt)
        : [];

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
            {state.columns.length ? (
                <Board
                    columns={state.columns.sort((a, b) => a.position - b.position)}
                    tasks={state.tasks.sort((a, b) => a.position - b.position)}
                    comments={state.comments}
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
            ) : (
                <NoColumnsState onClickCreate={() => setIsAddColumnFormOpen(true)} />
            )}

            <CreateTaskFormDialog
                open={Boolean(isAddTaskFormOpenFor)}
                onOpenChange={() => setIsAddTaskOpenFor(null)}
                onSubmit={handleAddTask}
            />

            <ViewEditTaskDialog
                open={Boolean(task)}
                task={task}
                comments={comments.sort((a, b) => b.createdAt - a.createdAt)}
                onOpenChange={handleTaskDetailsModalClose}
                onTaskChange={updateTask}
                onAddComment={addComment}
                onCommentChange={updateComment}
                onDeleteComment={deleteComment}
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
