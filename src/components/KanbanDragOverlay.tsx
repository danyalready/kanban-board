import { defaultDropAnimationSideEffects, DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";

import { isColumn, isTask } from "@/reducers/kanbanTypes";
import { useKanbanContext } from "@/contexts/kanbanContext";
import type { Column, Task } from "@/db/types";

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
                    tasksCount={0}
                    className="rotate-2 shadow-xl"
                    headerClassName="cursor-grabbing"
                >
                    <div className="flex min-h-12 flex-col gap-1 px-1">
                        {getColumnTasks(state.active.id).map((item) => (
                            <KanbanTask key={item.id} isOverlay task={item} />
                        ))}
                    </div>
                </KanbanColumn>
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
