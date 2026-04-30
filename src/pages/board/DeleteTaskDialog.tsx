import { Button } from "@/shared/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/shared/ui/dialog";

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
                    <DialogTitle>Delete “{props.taskName}”?</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    This will permanently delete the “{props.taskName}” task and all comments within
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
