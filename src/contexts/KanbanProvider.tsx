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

    useEffect(() => {
        const subscription = liveQuery(async () => {
            const [boards, columns, tasks, comments] = await Promise.all([
                db.boards.toArray(),
                db.columns.toArray(),
                db.tasks.toArray(),
                db.comments.toArray(),
            ]);

            return { boards, columns, tasks, comments };
        }).subscribe(({ boards, columns, tasks, comments }) => {
            dispatch({
                type: KanbanActionType.SetState,
                payload: { state: { active: null, boards, columns, tasks, comments } },
            });
        });

        return () => subscription.unsubscribe();
    }, []);

    return <KanbanContext.Provider value={{ state, dispatch }}>{props.children}</KanbanContext.Provider>;
}
