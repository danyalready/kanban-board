import { useContext } from "react";

import { KanbanContext, type KanbanContextProps } from "./kanbanContext";

export const useKanban = (): KanbanContextProps => {
    const context = useContext(KanbanContext);

    if (!context) {
        throw new Error("useKanbanContext must be used within a KanbanProvider");
    }

    return context;
};
