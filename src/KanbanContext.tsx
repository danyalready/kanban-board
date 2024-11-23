import { createContext, useContext } from 'react';

export interface KanbanItem {
    id: string;
    content: string;
}

export interface KanbanColumn {
    id: string;
    name: string;
    items: KanbanItem[];
}

export const KanbanContext = createContext<{ columns: KanbanColumn[] }>({ columns: [] });

export function useKanbanContext() {
    const context = useContext(KanbanContext);

    if (!context) {
        throw new Error('useKanbanContext must be used within a KanbanContextProvider');
    }

    return context;
}
