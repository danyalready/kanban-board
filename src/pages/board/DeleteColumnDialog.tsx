import { Button } from "@/shared/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/shared/ui/dialog";
import { t } from "@/shared/i18n";

interface Props {
    open: boolean;
    columnName?: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteColumnDialog(props: Props) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t("delete.column.title", { name: props.columnName ?? "" })}
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    {t("delete.column.description", { name: props.columnName ?? "" })}
                </DialogDescription>
                <DialogFooter>
                    <Button size="sm" variant="secondary" onClick={() => props.onOpenChange(false)}>
                        {t("action.cancel")}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={props.onConfirm}>
                        {t("action.delete")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
