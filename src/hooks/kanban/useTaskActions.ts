import { useCallback } from "react";
import { toast } from "sonner";

import {
    type CreateTaskInput,
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
import {
    getValidationMessage,
    validateCreateTaskInput,
    validateUpdateTaskInput,
} from "@/model/validation";

type CreateTaskActionInput = Omit<CreateTaskInput, "position">;

export function useTaskActions() {
    const { dispatch, state } = useKanbanContext();

    const addTask = useCallback(
        async (columnId: string, data: CreateTaskActionInput) => {
            const tasksInColumn = filterTasksByColumn(state.tasks, columnId);
            const maxPosition = tasksInColumn.length
                ? Math.max(...tasksInColumn.map((t) => t.position))
                : 0;
            const position = maxPosition + TASK_POSITION_OFFSET;
            let validInput: ReturnType<typeof validateCreateTaskInput>;

            try {
                validInput = validateCreateTaskInput(columnId, { ...data, position });
            } catch (error) {
                toast.error(getValidationMessage(error) ?? "Invalid task data.", {
                    position: "top-center",
                });
                return;
            }

            try {
                const task = await svcCreateTask(validInput.columnId, validInput.data);

                dispatch({
                    type: KanbanActionType.SetTasks,
                    payload: { tasks: [...state.tasks, task] },
                });

                toast.success("Task has been created 🎉", { position: "top-center" });
            } catch (error) {
                toast.error(getValidationMessage(error) ?? "Something went wrong.", {
                    position: "top-center",
                });
            }
        },
        [state.tasks, dispatch],
    );

    const updateTask = useCallback(
        async (taskId: string, data: Partial<CreateTaskInput>) => {
            let validData: ReturnType<typeof validateUpdateTaskInput>;

            try {
                validData = validateUpdateTaskInput(data);
            } catch (error) {
                toast.error(getValidationMessage(error) ?? "Invalid task data.", {
                    position: "top-center",
                });
                return;
            }

            if (Object.keys(validData).length === 0) return;

            try {
                await svcUpdateTask(taskId, validData);

                dispatch({
                    type: KanbanActionType.UpdateTask,
                    payload: { taskId, data: validData },
                });
            } catch (error) {
                toast.error(getValidationMessage(error) ?? "Something went wrong.", {
                    position: "top-center",
                });
            }
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
            let validMoveData: ReturnType<typeof validateUpdateTaskInput>;

            try {
                validMoveData = validateUpdateTaskInput({
                    columnId: targetColumnId,
                    position: updatedPosition,
                });
            } catch (error) {
                toast.error(getValidationMessage(error) ?? "Invalid task position.", {
                    position: "top-center",
                });
                return;
            }

            // Always optimistically reorder in UI
            dispatch({
                type: KanbanActionType.UpdateTask,
                payload: { taskId, data: validMoveData },
            });

            // Skip persistence during drag-over
            if (persist === false) return;

            const prevState = structuredClone(state);

            try {
                await svcUpdateTask(taskId, validMoveData);

                const nextTasks = state.tasks.map((task) =>
                    task.id === taskId ? { ...task, ...validMoveData } : task,
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
