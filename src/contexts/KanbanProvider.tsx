import { type PropsWithChildren, useEffect, useReducer } from "react";
import { liveQuery } from "dexie";

import { db } from "@/db/db";
import { seedDemoBoardIfNeeded } from "@/db/demoData";
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
        let sub: { unsubscribe: () => void } | undefined;
        let cancelled = false;

        seedDemoBoardIfNeeded()
            .catch((error) => {
                console.error("Failed to seed demo board", error);
            })
            .finally(() => {
                if (cancelled) return;

                sub = liveQuery(() => db.boards.toArray()).subscribe((rows) =>
                    dispatch({ type: KanbanActionType.SetBoards, payload: { boards: rows } }),
                );
            });

        return () => {
            cancelled = true;
            sub?.unsubscribe();
        };
    }, []);

    return (
        <KanbanContext.Provider value={{ state, dispatch }}>
            {props.children}
        </KanbanContext.Provider>
    );
}
