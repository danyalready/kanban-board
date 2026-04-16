import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddColumnFormDialog(props: Props) {
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New column</DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <div className="space-y-2">
                <label className="text-sm">Name</label>
                <input
                    className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-1 ring-inset ring-border focus:ring-2"
                    placeholder="e.g. To do"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button
                    disabled={!props.boardId || !newColumnName.trim()}
                    onClick={handleAddColumn}
                >
                    Create
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>;
}
