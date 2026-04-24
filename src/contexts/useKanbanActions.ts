import { useCallback } from "react";
import { toast } from "sonner";

import { KanbanActionType, type KanbanState } from "@/reducers/kanbanTypes";

import { getColumnsByBoard } from "@/services/columnService";
import {
    createTask as svcCreateTask,
    deleteTask as svcDeleteTask,
    getTasksByColumn as svcGetTasksByColumn,
    updateTask as svcUpdateTask,
    TASK_POSITION_OFFSET,
} from "@/services/taskService";
import { getCommentsByTask } from "@/services/commentService";
import type { Task, TaskPriority } from "@/db/types";
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

    const moveTask = useCallback(
        async (
            params: {
                taskId: string;
                targetIndex: number;
                targetColumnId: string;
            },
            persist?: boolean,
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
            if (persist === false) return;

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
        async (
            columnId: string,
            {
                title,
                description,
                priority,
            }: { title: string; description: string; priority: TaskPriority },
        ) => {
            const tasksInColumn = state.tasks.filter((t) => t.columnId === columnId);
            const maxPosition = tasksInColumn.length
                ? Math.max(...tasksInColumn.map((t) => t.position))
                : 0;
            const position = maxPosition + TASK_POSITION_OFFSET;

            try {
                const task = await svcCreateTask(columnId, {
                    title,
                    description,
                    priority,
                    position,
                });

                dispatch({
                    type: KanbanActionType.SetTasks,
                    payload: { tasks: [...state.tasks, task] },
                });

                toast.success("Task has been created 🎉", { position: "top-center" });
            } catch {
                toast.error("Something went wrong.", { position: "top-center" });
            }
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
            try {
                await svcDeleteTask(taskId);

                dispatch({ type: KanbanActionType.DeleteTask, payload: { taskId } });

                toast.success("Task has been deleted.", { position: "top-center" });
            } catch (error) {
                console.error(error);
                toast.error("Something went wrong.", { position: "top-center" });
            }
        },
        [dispatch],
    );

    return {
        setActive,
        setState,
        loadBoardData,
        clearBoardData,
        moveTask,
        addTask,
        updateTask,
        deleteTask,
    };
}
