import { KanbanIcon } from "lucide-react";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/empty";

export default function NoBoardsState() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <KanbanIcon />
                </EmptyMedia>
                <EmptyTitle>No boards found</EmptyTitle>
                <EmptyDescription className="max-w-xs text-pretty">
                    You don’t have any boards. Create one to get started.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
