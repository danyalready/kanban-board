import { type PropsWithChildren, useEffect, useReducer } from "react";
import { liveQuery } from "dexie";

import { db } from "@/db/db";
import { kanbanReducer } from "@/reducers/kanbanReducer";
import { KanbanActionType } from "@/reducers/kanbanTypes";

import { KanbanContext } from "./kanbanContext";

export default function KanbanProvider(props: PropsWithChildren) {
    const [state, dispatch] = useReducer(kanbanReducer, {
        active: null,
        boards: [],
        columns: [],
        tasks: [],
        comments: [],
    });

    useEffect(() => {
        const sub = liveQuery(() => db.boards.toArray()).subscribe((rows) =>
            dispatch({ type: KanbanActionType.SetBoards, payload: { boards: rows } }),
        );

        return () => sub.unsubscribe();
    }, []);

    return (
        <KanbanContext.Provider value={{ state, dispatch }}>
            {props.children}
        </KanbanContext.Provider>
    );
}
