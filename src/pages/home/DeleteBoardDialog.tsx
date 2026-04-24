import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

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
                    <DialogTitle>Delete “{props.boardName}”?</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    This will permanently delete the “{props.boardName}” board and all data within
                    it. This action cannot be undone.
                </DialogDescription>
                <DialogFooter>
                    <Button size="sm" variant="secondary" onClick={() => props.onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button size="sm" variant="destructive" onClick={props.onConfirm}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
