import KanbanProvider, { type Props as KanbanProviderProps } from "@/contexts/KanbanProvider";

import KanbanBoard, { type Props as KanbanBoardProps } from "./KanbanBoard";

interface Props extends KanbanProviderProps, KanbanBoardProps {
    onAddColumn: (column: unknown) => void;
    onEditColumn: (column: unknown) => void;
    onDeleteColumn: (column: unknown) => void;
    onAddTask: (task: unknown) => void;
    onEditTask: (task: unknown) => void;
    onDeleteTask: (task: unknown) => void;
}

export default function Kanban({ columns, tasks, ...props }: Props) {
    return (
        <KanbanProvider columns={columns} tasks={tasks}>
            <KanbanBoard {...props} />
        </KanbanProvider>
    );
}
