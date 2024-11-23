import { DndContext } from "@dnd-kit/core";

import { KanbanColumn } from "./KanbanColumn";
import { KanbanContextProvider } from "./KanbanContextProvider";
import { useKanbanContext, type KanbanColumn as KanbanColumnType } from "./KanbanContext";

function KanbanColumns() {
    const { columns } = useKanbanContext();

    function handleDragEnd() {}
    function handleAddItem() {}

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-1">
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        name={column.name}
                        items={column.items}
                        handleAddItem={handleAddItem}
                    />
                ))}
            </div>
        </DndContext>
    );
}

export function KanbanBoard(props: { columns: KanbanColumnType[] }) {
    return (
        <KanbanContextProvider columns={props.columns}>
            <button className="add-column-button">+ Add Column</button>
            <KanbanColumns />
        </KanbanContextProvider>
    );
}
