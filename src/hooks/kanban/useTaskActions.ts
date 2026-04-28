import { useCallback } from "react";
import { toast } from "sonner";

import {
    createTask as svcCreateTask,
    deleteTask as svcDeleteTask,
    normalizeTaskPositions as svcNormalizeTaskPositions,
    updateTask as svcUpdateTask,
    TASK_POSITION_OFFSET,
} from "@/services/taskService";
import {
    calculateTaskPosition,
    filterTasksByColumn,
    needsTaskPositionNormalization,
} from "@/model/task-ordering";
import { useKanbanContext } from "@/contexts/kanbanContext";
import { KanbanActionType } from "@/reducers/kanbanTypes";
import type { Task, TaskPriority } from "@/db/types";

export function useTaskActions() {
    const { dispatch, state } = useKanbanContext();

    const addTask = useCallback(
        async (
            columnId: string,
            {
                title,
                description,
                priority,
            }: { title: string; description: string; priority: TaskPriority },
        ) => {
            const trimmedTitle = title.trim();

            if (!trimmedTitle) return;

            const tasksInColumn = state.tasks.filter((t) => t.columnId === columnId);
            const maxPosition = tasksInColumn.length
                ? Math.max(...tasksInColumn.map((t) => t.position))
                : 0;
            const position = maxPosition + TASK_POSITION_OFFSET;

            try {
                const task = await svcCreateTask(columnId, {
                    title: trimmedTitle,
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

                const nextTasks = state.tasks.map((task) =>
                    task.id === taskId
                        ? { ...task, columnId: targetColumnId, position: updatedPosition }
                        : task,
                );
                const nextTargetColumnTasks = filterTasksByColumn(nextTasks, targetColumnId);

                if (needsTaskPositionNormalization(nextTargetColumnTasks)) {
                    const normalizedTasks = await svcNormalizeTaskPositions(targetColumnId);
                    const normalizedTaskMap = new Map(
                        normalizedTasks.map((task) => [task.id, task]),
                    );

                    dispatch({
                        type: KanbanActionType.SetTasks,
                        payload: {
                            tasks: state.tasks.map(
                                (task) => normalizedTaskMap.get(task.id) ?? task,
                            ),
                        },
                    });
                }
            } catch (error) {
                dispatch({ type: KanbanActionType.SetState, payload: { state: prevState } });
                console.error("error", error);
            }
        },
        [dispatch, state],
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

    return { addTask, updateTask, moveTask, deleteTask };
}
