import { PropsWithChildren, useReducer } from "react";

import { kanbanReducer, type KanbanState } from "@/kanbanReducer";

import { KanbanContext } from "../kanbanContext";

const initialState: KanbanState = {
    columns: [
        {
            id: "column-1",
            title: "To Do",
            tasks: [
                { id: "go-grocery", title: "🥦 Go to grocery" },
                { id: "walk-dog", title: "🦮 Walk the dog" },
            ],
        },
        { id: "column-2", title: "In Progress", tasks: [{ id: "exercise", title: "Exercise" }] },
        {
            id: "column-3",
            title: "✅ Compleated",
            tasks: [
                { id: "guitar", title: "Play guitar 🎸" },
                { id: "pills", title: "💊 Take the pills" },
                { id: "plants", title: "Water the plants 🪴" },
            ],
        },
    ],
};

export function KanbanProvider(props: PropsWithChildren) {
    const [state, dispatch] = useReducer(kanbanReducer, initialState); // TODO: get the initial data from the local storage.

    return <KanbanContext.Provider value={{ state, dispatch }}>{props.children}</KanbanContext.Provider>;
}
