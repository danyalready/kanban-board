import { defaultDropAnimationSideEffects, DragOverlay as DndDragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";

import { isColumn, isTask } from "@/reducers/kanbanTypes";
import { useKanbanContext } from "@/contexts/kanbanContext";
import { filterTasksByColumn } from "@/model/task-ordering";

import Column from "./column/Column";
import Task from "./Task";

export default function DragOverlay() {
    const { state } = useKanbanContext();

    const renderOverlayComponent = () => {
        if (isColumn(state.active)) {
            const columnTasks = filterTasksByColumn(state.tasks, state.active.id);

            return (
                <Column
                    column={state.active}
                    tasks={columnTasks}
                    className="rotate-2 shadow-xl"
                    headerClassName="cursor-grabbing"
                    onColumnNameChange={() => {}}
                    onClickAddTask={() => {}}
                />
            );
        }

        if (isTask(state.active)) {
            return (
                <Task
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
        <DndDragOverlay
            dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: { active: { visibility: "hidden" } },
                }),
            }}
        >
            {renderOverlayComponent()}
        </DndDragOverlay>,
        document.body,
    );
}
