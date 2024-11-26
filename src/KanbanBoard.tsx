import { DndContext } from "@dnd-kit/core";

import { KanbanColumn } from "./KanbanColumn";
import { useKanbanContext } from "./KanbanContext";
import { KanbanProvider } from "./KanbanProvider";

function KanbanColumns() {
    const { state } = useKanbanContext();

    function handleDragEnd() {}
    function handleAddItem() {}

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <button>Add ticket +</button>

            <div className="flex gap-5 px-4 py-3">
                {state.columns.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        name={column.title}
                        tasks={column.tasks}
                        handleAddItem={handleAddItem}
                    />
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
