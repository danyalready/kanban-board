import { createPortal } from "react-dom";
import { defaultDropAnimationSideEffects, DragOverlay as DndDragOverlay } from "@dnd-kit/core";

import { isColumn, isTask } from "@/app/kanban/types";
import { useKanban } from "@/app/kanban/useKanban";
import { filterTasksByColumn } from "@/domain/kanban/taskOrdering";
import { countCommentsByTaskId } from "@/domain/kanban/comments";

import Task from "./Task";
import Column from "./column/Column";

export default function DragOverlay() {
    const { state } = useKanban();

    const renderOverlayComponent = () => {
        if (isColumn(state.active)) {
            const columnTasks = filterTasksByColumn(state.tasks, state.active.id);

            return (
                <Column
                    column={state.active}
                    tasks={columnTasks}
                    comments={state.comments}
                    className="rotate-2 shadow-xl"
                    headerClassName="cursor-grabbing"
                    onColumnNameChange={() => {}}
                    onClickAddTask={() => {}}
                    onClickDelete={() => {}}
                />
            );
        }

        if (isTask(state.active)) {
            return (
                <Task
                    task={state.active}
                    commentsCount={countCommentsByTaskId(state.active.id, state.comments)}
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
