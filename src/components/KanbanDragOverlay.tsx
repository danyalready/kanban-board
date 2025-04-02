import { defaultDropAnimationSideEffects, DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";

import { Column, isColumn, isTask, Task } from "@/store/types";

import KanbanColumn from "./KanbanColumn";
import KanbanTask from "./KanbanTask";

interface Props {
    active: null | Task | Column;
}

export default function KanbanDragOverlay(props: Props) {
    return createPortal(
        <DragOverlay
            dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: { active: { visibility: "hidden" } },
                }),
            }}
        >
            {isColumn(props.active) && (
                <KanbanColumn column={props.active} className="rotate-2 shadow-xl" headerClassName="cursor-grabbing" />
            )}
            {isTask(props.active) && (
                <KanbanTask task={props.active} className="rotate-2 shadow-xl" gripClassName="cursor-grabbing" />
            )}
        </DragOverlay>,
        document.body,
    );
}
