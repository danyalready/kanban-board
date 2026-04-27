import { useCallback } from "react";

import { needsColumnPositionNormalization } from "@/model/column-ordering";
import { filterTasksByColumn, needsTaskPositionNormalization } from "@/model/task-ordering";
import { KanbanActionType, type KanbanState } from "@/reducers/kanbanTypes";
import { getColumnsByBoard, normalizeColumnsPositions } from "@/services/columnService";
import { getTasksByColumn, normalizeTaskPositions } from "@/services/taskService";
import { getCommentsByTask } from "@/services/commentService";
import { useKanbanContext } from "@/contexts/kanbanContext";

export function useKanbanActions() {
    const { dispatch } = useKanbanContext();

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
            let columns = await getColumnsByBoard(boardId);

            if (needsColumnPositionNormalization(columns)) {
                columns = await normalizeColumnsPositions(boardId);
            }

            dispatch({ type: KanbanActionType.SetColumns, payload: { columns } });

            // Load tasks for those columns
            let allTasks = (await Promise.all(columns.map((c) => getTasksByColumn(c.id)))).flat();
            const columnsToNormalize = columns.filter((column) =>
                needsTaskPositionNormalization(filterTasksByColumn(allTasks, column.id)),
            );

            if (columnsToNormalize.length) {
                const normalizedTasks = (
                    await Promise.all(
                        columnsToNormalize.map((column) => normalizeTaskPositions(column.id)),
                    )
                ).flat();
                const normalizedTaskMap = new Map(normalizedTasks.map((task) => [task.id, task]));

                allTasks = allTasks.map((task) => normalizedTaskMap.get(task.id) ?? task);
            }

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

    return {
        setActive,
        setState,
        loadBoardData,
        clearBoardData,
    };
}
