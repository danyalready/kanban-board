import { useKanbanContext } from "./kanbanContext";
import { KanbanActionType, type KanbanState } from "@/reducers/kanbanTypes";

export function useKanbanActions() {
    const { dispatch } = useKanbanContext();

    const setActive = (active: KanbanState["active"]) => {
        dispatch({ type: KanbanActionType.SetActive, payload: { active } });
    };

    const setState = (state: KanbanState) => {
        dispatch({ type: KanbanActionType.SetState, payload: { state } });
    };

    const moveColumn = (columnId: string, targetIndex: number) => {
        dispatch({ type: KanbanActionType.MoveColumn, payload: { columnId, targetIndex } });
    };

    const moveTask = (args: {
        taskId: string;
        targetIndex: number;
        sourceColumnId: string;
        targetColumnId: string;
    }) => {
        dispatch({ type: KanbanActionType.MoveTask, payload: args });
    };

    return { setActive, setState, moveColumn, moveTask };
}
