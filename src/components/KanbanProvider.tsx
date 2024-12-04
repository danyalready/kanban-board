import { PropsWithChildren, useReducer } from "react";

import { kanbanReducer, type KanbanState } from "@/kanbanReducer";

import { KanbanContext } from "../kanbanContext";

const initialState: KanbanState = {
    columns: [
        {
            id: "column-1",
            title: "To Do",
            tasks: ["go-grocery", "walk-dog"],
        },
        {
            id: "column-2",
            title: "In Progress",
            tasks: ["exercise"],
        },
        {
            id: "column-3",
            title: "✅ Compleated",
            tasks: ["guitar", "pills", "plants"],
        },
    ],
    tasks: [
        {
            id: "go-grocery",
            columnId: "column-1",
            title: "🥦 Go to grocery",
            priority: "medium",
            comments: ["We also need some chopsticks"],
        },
        { id: "walk-dog", columnId: "column-1", title: "🦮 Walk the dog", priority: "high", comments: [] },
        { id: "exercise", columnId: "column-2", title: "Exercise", priority: "low", comments: [] },
        {
            id: "guitar",
            columnId: "column-3",
            title: "Play guitar 🎸",
            priority: "low",
            comments: ["The cyberpunk songs are something!"],
        },
        { id: "pills", columnId: "column-3", title: "💊 Take the pills", priority: "low", comments: [] },
        { id: "plants", columnId: "column-3", title: "Water the plants 🪴", priority: "medium", comments: [] },
    ],
};

export function KanbanProvider(props: PropsWithChildren) {
    const [state, dispatch] = useReducer(kanbanReducer, initialState); // TODO: get the initial data from the local storage.

    return <KanbanContext.Provider value={{ state, dispatch }}>{props.children}</KanbanContext.Provider>;
}
