import { createContext, useContext, type Dispatch } from "react";
import { type KanbanAction, type KanbanState } from "./KanbanProvider";

type KanbanContextProps = {
    state: KanbanState;
    dispatch: Dispatch<KanbanAction>;
};

export const KanbanContext = createContext<KanbanContextProps | undefined>(undefined);

export const useKanbanContext = (): KanbanContextProps => {
    const context = useContext(KanbanContext);

    if (!context) {
        throw new Error("useKanbanContext must be used within a KanbanProvider");
    }

    return context;
};
