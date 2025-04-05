import { PropsWithChildren, useReducer } from "react";

import { kanbanReducer } from "@/store/kanbanReducer";
import type { Column, Task } from "@/db/types";

import { KanbanContext } from "./kanbanContext";

// const initialState: KanbanState = {
//     active: null,
//     columns: [
//         {
//             id: "column-1",
//             title: "To Do",
//             order: 1,
//         },
//         {
//             id: "column-2",
//             title: "In Progress",
//             order: 2,
//         },
//         {
//             id: "column-3",
//             title: "✅ Compleated",
//             order: 3,
//         },
//     ],
//     tasks: [
//         {
//             id: "go-grocery",
//             columnId: "column-1",
//             order: 1,
//             title: "🥦 Go to grocery",
//             priority: "medium",
//             comments: ["We also need some chopsticks"],
//         },
//         { id: "walk-dog", columnId: "column-1", order: 2, title: "🦮 Walk the dog", priority: "high", comments: [] },
//         { id: "exercise", columnId: "column-2", order: 1, title: "Exercise", priority: "low", comments: [] },
//         {
//             id: "guitar",
//             columnId: "column-3",
//             order: 1,
//             title: "Play guitar 🎸",
//             priority: "low",
//             comments: ["The cyberpunk songs are something!"],
//         },
//         { id: "pills", columnId: "column-2", order: 2, title: "💊 Take the pills", priority: "low", comments: [] },
//         {
//             id: "plants",
//             columnId: "column-2",
//             order: 3,
//             title: "Water the plants 🪴",
//             priority: "medium",
//             comments: [],
//         },
//     ],
// };

export interface Props {
    columns: Column[];
    tasks: Task[];
}

export default function KanbanProvider(props: PropsWithChildren<Props>) {
    const [state, dispatch] = useReducer(kanbanReducer, {
        active: null,
        columns: props.columns,
        tasks: props.tasks,
    });

    return <KanbanContext.Provider value={{ state, dispatch }}>{props.children}</KanbanContext.Provider>;
}
