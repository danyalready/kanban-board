import { PropsWithChildren, useReducer } from "react";

import { kanbanReducer, type KanbanState } from "@/kanbanReducer";

import { KanbanContext } from "../kanbanContext";

const initialState: KanbanState = {
    columns: [
        {
            id: "column-1",
            title: "To Do",
            tasks: [
                { id: "task-1", title: "🥦 Go to grocery" },
                { id: "task-2", title: "🦮 Walk the dog" },
            ],
        },
        { id: "column-2", title: "In Progress", tasks: [{ id: "task-3", title: "Exercise" }] },
        {
            id: "column-3",
            title: "✅ Compleated",
            tasks: [
                { id: "task-4", title: "Play guitar 🎸" },
                { id: "task-5", title: "💊 Take the pills" },
                { id: "task-6", title: "Water the plants 🪴" },
            ],
        },
    ],
};

export function KanbanProvider(props: PropsWithChildren) {
    const [state, dispatch] = useReducer(kanbanReducer, initialState); // TODO: get the initial data from the local storage.

    return <KanbanContext.Provider value={{ state, dispatch }}>{props.children}</KanbanContext.Provider>;
}
