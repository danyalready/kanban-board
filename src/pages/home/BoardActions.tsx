import { useState } from "react";
import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { t } from "@/shared/i18n";

interface Props {
    onClickEdit: () => void;
    onClickDelete: () => void;
}

export default function BoardActions(props: Props) {
    const [open, setOpen] = useState(false);

    const handleClickEdit = () => {
        setOpen(false);
        props.onClickEdit();
    };

    const handleClickDelete = () => {
        setOpen(false);
        props.onClickDelete();
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="link">
                    <EllipsisIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleClickEdit}>
                    <PencilIcon />
                    {t("action.edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleClickDelete}>
                    <Trash2Icon />
                    {t("action.delete")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
