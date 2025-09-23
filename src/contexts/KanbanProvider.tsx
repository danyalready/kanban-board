import { useEffect, PropsWithChildren, useReducer } from "react";
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

    // Live-sync only boards; other entities are loaded on demand
    useEffect(() => {
        const subscription = liveQuery(async () => {
            const boards = await db.boards.toArray();

            return { boards };
        }).subscribe(({ boards }) => {
            dispatch({ type: KanbanActionType.SetBoards, payload: { boards } });
        });

        return () => subscription.unsubscribe();
    }, []);

    return <KanbanContext.Provider value={{ state, dispatch }}>{props.children}</KanbanContext.Provider>;
}
