import { createContext, type Dispatch } from "react";

import type { KanbanAction, KanbanState } from "@/app/kanban/types";

export type KanbanContextProps = {
    state: KanbanState;
    dispatch: Dispatch<KanbanAction>;
};

export const KanbanContext = createContext<KanbanContextProps | undefined>(undefined);
