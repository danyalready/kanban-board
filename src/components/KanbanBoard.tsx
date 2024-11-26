import { DndContext, type DragEndEvent } from "@dnd-kit/core";

import { useKanbanContext } from "@/kanbanContext";

import { KanbanColumn } from "./KanbanColumn";
import { KanbanProvider } from "./KanbanProvider";

function KanbanColumns() {
    const { state, dispatch } = useKanbanContext();

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over) {
            const sourceColumn = state.columns.find((column) =>
                column.tasks.map((task) => task.id).includes(active.id.toString()),
            );

            if (sourceColumn && sourceColumn.id !== over.id.toString()) {
                dispatch({
                    type: "MOVE_TASK",
                    payload: {
                        sourceColumnId: sourceColumn.id,
                        targetColumnId: over.id.toString(),
                        taskId: active.id.toString(),
                    },
                });
            }
        }
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-5 px-4 py-3">
                {state.columns.map((column) => (
                    <KanbanColumn key={column.id} column={column} />
                ))}
            </div>
        </DndContext>
    );
}

export function KanbanBoard() {
    return (
        <KanbanProvider>
            <KanbanColumns />
        </KanbanProvider>
    );
}
