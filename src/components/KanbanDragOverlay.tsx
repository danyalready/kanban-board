import { defaultDropAnimationSideEffects, DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";

import { isColumn, isTask } from "@/reducers/kanbanTypes";
import { useKanbanContext } from "@/contexts/kanbanContext";
import type { Column } from "@/db/types";

import KanbanColumn from "./KanbanColumn";
import KanbanTask from "./KanbanTask";

export default function KanbanDragOverlay() {
    const { state } = useKanbanContext();

    const getColumnTasks = (columnId: Column["id"]) => state.tasks.filter((task) => task.columnId === columnId);

    const renderOverlayComponent = () => {
        if (isColumn(state.active)) {
            return (
                <KanbanColumn
                    column={state.active}
                    tasks={getColumnTasks(state.active.id)}
                    className="rotate-2 shadow-xl"
                    headerClassName="cursor-grabbing"
                />
            );
        }

        if (isTask(state.active)) {
            return (
                <KanbanTask
                    task={state.active}
                    isOverlay
                    className="rotate-2 shadow-xl"
                    gripClassName="cursor-grabbing"
                />
            );
        }

        return null;
    };

    return createPortal(
        <DragOverlay
            dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: { active: { visibility: "hidden" } },
                }),
            }}
        >
            {renderOverlayComponent()}
        </DragOverlay>,
        document.body,
    );
}
