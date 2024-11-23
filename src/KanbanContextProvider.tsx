import { PropsWithChildren } from 'react';
import { KanbanColumn, KanbanContext } from './KanbanContext';

export function KanbanContextProvider(props: PropsWithChildren<{ columns: KanbanColumn[] }>) {
    return <KanbanContext.Provider value={{ columns: props.columns }}>{props.children}</KanbanContext.Provider>;
}
