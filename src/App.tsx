import { useEffect, useState } from "react";

import type { Column, Task } from "@/db/types";
import Kanban from "@/components/Kanban";

export default function App() {
    const [columns, setColumns] = useState<Column[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        setColumns([]);
        setTasks([]);
    }, []);

    return (
        <Kanban
            columns={columns}
            tasks={tasks}
            onAddColumn={() => {}}
            onEditColumn={() => {}}
            onDeleteColumn={() => {}}
            onAddTask={() => {}}
            onEditTask={() => {}}
            onDeleteTask={() => {}}
            onClickTask={() => {}}
            onMoveColumn={() => {}}
            onMoveTask={() => {}}
        />
    );
}
