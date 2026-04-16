import { useEffect, useState } from "react";

import type { Task } from "@/db/types";
import { useDebounce } from "@/hooks/useDebounce";
import { useKanbanActions } from "@/contexts/useKanbanActions";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import RichTextEditor from "../../components/RichTextEditor";

interface Props {
    task: null | Task;
    onClose: () => void;
}

export default function TaskFormDialog(props: Props) {
    const [description, setDescription] = useState(props.task?.description || "");
    const debouncedDescription = useDebounce(description);
    const { updateTask } = useKanbanActions();

    useEffect(() => {
        if (!props.task || debouncedDescription === props.task.description) return;

        updateTask(props.task.id, { description: debouncedDescription });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedDescription, updateTask]);

    useEffect(() => {
        if (!props.task) return;

        setDescription(props.task.description);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.task?.id]);

    return (
        <Dialog open={Boolean(props.task)} onOpenChange={props.onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{props.task?.title}</DialogTitle>
                </DialogHeader>

                <section>
                    <h3>Description</h3>
                    <div dangerouslySetInnerHTML={{ __html: `<div>${description}</div>` }}></div>
                    {/* <RichTextEditor value={description} onChange={setDescription} /> */}
                </section>

                <section>
                    <h3>Comments</h3>
                </section>
            </DialogContent>
        </Dialog>
    );
}
