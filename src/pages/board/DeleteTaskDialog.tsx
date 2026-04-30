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
    taskName?: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteTaskDialog(props: Props) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t("delete.task.title", { name: props.taskName ?? "" })}
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    {t("delete.task.description", { name: props.taskName ?? "" })}
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
