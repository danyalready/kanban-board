import type { Task } from "@/db/types";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

interface Props {
    task: null | Task;
    onClose: () => void;
}

export default function KanbanTaskDetailsModal(props: Props) {
    return (
        <Dialog open={Boolean(props.task)} onOpenChange={props.onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{props.task?.title}</DialogTitle>
                </DialogHeader>
                <DialogDescription>{props.task?.description}</DialogDescription>
                <DialogFooter></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
