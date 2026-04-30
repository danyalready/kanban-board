import { KanbanIcon, PlusIcon } from "lucide-react";

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/shared/ui/empty";
import { Button } from "@/shared/ui/button";
import { t } from "@/shared/i18n";

interface Props {
    onClickCreate: () => void;
}

export default function NoColumnsState(props: Props) {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <KanbanIcon />
                </EmptyMedia>
                <EmptyTitle>{t("board.empty.column.title")}</EmptyTitle>
                <EmptyDescription className="max-w-xs text-pretty">
                    {t("board.empty.column.description")}
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button variant="outline" onClick={props.onClickCreate}>
                    <PlusIcon />
                    {t("action.create")}
                </Button>
            </EmptyContent>
        </Empty>
    );
}
