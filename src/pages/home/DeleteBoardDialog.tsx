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
    boardName?: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteBoardDialog(props: Props) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t("delete.board.title", { name: props.boardName ?? "" })}
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    {t("delete.board.description", { name: props.boardName ?? "" })}
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
