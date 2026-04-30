import { type PropsWithChildren, useEffect, useReducer } from "react";
import { liveQuery } from "dexie";

import { db } from "@/shared/lib/db";
import { seedDemoBoardIfNeeded } from "@/data/demoData";
import { kanbanReducer } from "@/app/kanban/reducer";
import { KanbanActionType } from "@/app/kanban/types";
import { KanbanContext } from "@/app/kanban/kanbanContext";

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
