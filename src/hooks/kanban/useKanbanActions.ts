import { useCallback } from "react";

import { KanbanActionType, type KanbanState } from "@/reducers/kanbanTypes";
import { getColumnsByBoard } from "@/services/columnService";
import { getTasksByColumn } from "@/services/taskService";
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
            const columns = await getColumnsByBoard(boardId);
            dispatch({ type: KanbanActionType.SetColumns, payload: { columns } });

            // Load tasks for those columns
            const allTasks = (await Promise.all(columns.map((c) => getTasksByColumn(c.id)))).flat();
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
