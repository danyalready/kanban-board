import { FolderKanbanIcon } from "lucide-react";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/empty";
import { t } from "@/shared/i18n";

export default function NoBoardsState() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <FolderKanbanIcon />
                </EmptyMedia>
                <EmptyTitle>{t("board.empty.board.title")}</EmptyTitle>
                <EmptyDescription className="max-w-xs text-pretty">
                    {t("board.empty.board.description")}
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
