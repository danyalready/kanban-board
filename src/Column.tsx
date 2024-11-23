import { useDroppable } from '@dnd-kit/core';
import { PropsWithChildren } from 'react';

interface ColumnProps {
    name: string;
}

function Column({ children }: PropsWithChildren<ColumnProps>) {
    const { isOver, setNodeRef } = useDroppable({
        id: 'droppable',
    });
    const style = {
        color: isOver ? 'green' : undefined,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children}
        </div>
    );
}

export default Column;
