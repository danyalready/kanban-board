import { useCallback } from "react";

import { KanbanActionType, type KanbanState } from "@/reducers/kanbanTypes";
import {
    createColumn as svcCreateColumn,
    updateColumn as svcUpdateColumn,
    deleteColumn as svcDeleteColumn,
} from "@/services/columnService";
import { COLUMN_POSITION_OFFSET } from "@/services/columnService";
import { getColumnsByBoard } from "@/services/columnService";
import {
    createTask as svcCreateTask,
    deleteTask as svcDeleteTask,
    getTasksByColumn as svcGetTasksByColumn,
    updateTask as svcUpdateTask,
    TASK_POSITION_OFFSET,
} from "@/services/taskService";
import { getCommentsByTask } from "@/services/commentService";
import type { Task } from "@/db/types";
import { calculateColumnPosition } from "@/model/column-ordering";
import { calculateTaskPosition, filterTasksByColumn } from "@/model/task-ordering";

import { useKanbanContext } from "./kanbanContext";

export function useKanbanActions() {
    const { dispatch, state } = useKanbanContext();

    const setActive = useCallback(
        (active: KanbanState["active"]) => {
            dispatch({ type: KanbanActionType.SetActive, payload: { active } });
        },
        [dispatch],
    );

    const setState = useCallback(
        (state: KanbanState) => {
            dispatch({ type: KanbanActionType.SetState, payload: { state } });
        },
        [dispatch],
    );

    // On-demand loaders
    const loadBoardData = useCallback(
        async (boardId: string) => {
            const columns = await getColumnsByBoard(boardId);
            dispatch({ type: KanbanActionType.SetColumns, payload: { columns } });

            // Load tasks for those columns
            const allTasks = (
                await Promise.all(columns.map((c) => svcGetTasksByColumn(c.id)))
            ).flat();
            dispatch({ type: KanbanActionType.SetTasks, payload: { tasks: allTasks } });

            // Load comments for those tasks
            const allComments = (
                await Promise.all(allTasks.map((t) => getCommentsByTask(t.id)))
            ).flat();
            dispatch({ type: KanbanActionType.SetComments, payload: { comments: allComments } });
        },
        [dispatch],
    );

    const clearBoardData = useCallback(() => {
        dispatch({ type: KanbanActionType.ClearBoardData });
    }, [dispatch]);

    const moveColumn = useCallback(
        async (columnId: string, targetIndex: number) => {
            const activeIndex = state.columns.findIndex((column) => column.id === columnId);
            const updatedPosition = calculateColumnPosition(
                state.columns,
                activeIndex,
                targetIndex,
            );

            // Optimistically reorder in UI first
            dispatch({
                type: KanbanActionType.UpdateColumn,
                payload: { columnId, data: { position: updatedPosition } },
            });

            const prevState = structuredClone(state);

            try {
                await svcUpdateColumn(columnId, { position: updatedPosition });
            } catch (error) {
                dispatch({ type: KanbanActionType.SetState, payload: { state: prevState } });
                console.error("error", error);
            }
        },
        [dispatch, state],
    );

    const moveTask = useCallback(
        async (
            params: {
                taskId: string;
                targetIndex: number;
                targetColumnId: string;
            },
            options?: { persist?: boolean },
        ) => {
            const { taskId, targetIndex, targetColumnId } = params;

            const targetColumnTasks = filterTasksByColumn(state.tasks, targetColumnId);
            const activeIndex = targetColumnTasks.findIndex((task) => task.id === taskId);
            const updatedPosition = calculateTaskPosition(
                targetColumnTasks,
                activeIndex,
                targetIndex,
            );

            // Always optimistically reorder in UI
            dispatch({
                type: KanbanActionType.UpdateTask,
                payload: { taskId, data: { columnId: targetColumnId, position: updatedPosition } },
            });

            // Skip persistence during drag-over
            if (options?.persist === false) return;

            const prevState = structuredClone(state);

            try {
                await svcUpdateTask(taskId, {
                    columnId: targetColumnId,
                    position: updatedPosition,
                });
            } catch (error) {
                dispatch({ type: KanbanActionType.SetState, payload: { state: prevState } });
                console.error("error", error);
            }
        },
        [dispatch, state],
    );

    const addTask = useCallback(
        async (columnId: string, title: string) => {
            const tasksInColumn = state.tasks.filter((t) => t.columnId === columnId);
            const maxPosition = tasksInColumn.length
                ? Math.max(...tasksInColumn.map((t) => t.position))
                : 0;
            const position = maxPosition + TASK_POSITION_OFFSET;

            const task = await svcCreateTask(columnId, title, position);

            dispatch({
                type: KanbanActionType.SetTasks,
                payload: { tasks: [...state.tasks, task] },
            });
        },
        [state.tasks, dispatch],
    );

    const updateTask = useCallback(
        async (
            taskId: string,
            data: Partial<{ title: string; description: string; priority: Task["priority"] }>,
        ) => {
            await svcUpdateTask(taskId, data);

            dispatch({ type: KanbanActionType.UpdateTask, payload: { taskId, data: data } });
        },
        [dispatch],
    );

    const deleteTask = useCallback(
        async (taskId: string) => {
            await svcDeleteTask(taskId);

            dispatch({ type: KanbanActionType.DeleteTask, payload: { taskId } });
        },
        [dispatch],
    );

    const addColumn = useCallback(
        async (boardId: string, name: string) => {
            const columnsInBoard = state.columns.filter((c) => c.boardId === boardId);
            const maxPosition = columnsInBoard.length
                ? Math.max(...columnsInBoard.map((c) => c.position))
                : 0;
            const position = maxPosition + COLUMN_POSITION_OFFSET;

            await svcCreateColumn(boardId, name, position);
        },
        [state.columns],
    );

    const updateColumn = useCallback(
        async (columnId: string, data: Partial<{ name: string; position: number }>) => {
            await svcUpdateColumn(columnId, data);

            dispatch({ type: KanbanActionType.UpdateColumn, payload: { columnId, data } });
        },
        [dispatch],
    );

    const deleteColumn = useCallback(
        async (columnId: string) => {
            await svcDeleteColumn(columnId);

            dispatch({ type: KanbanActionType.DeleteColumn, payload: { columnId } });
        },
        [dispatch],
    );

    return {
        setActive,
        setState,
        loadBoardData,
        clearBoardData,
        moveColumn,
        moveTask,
        addTask,
        updateTask,
        deleteTask,
        addColumn,
        updateColumn,
        deleteColumn,
    };
}
