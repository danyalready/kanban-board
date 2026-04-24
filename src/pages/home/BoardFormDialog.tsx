import { useForm, SubmitHandler } from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Inputs {
    boardName: string;
}

interface Props {
    open: boolean;
    initialValues?: Inputs;
    onSubmit: SubmitHandler<Inputs>;
    onOpenChange: (open: boolean) => void;
}

export default function BoardFormDialog(props: Props) {
    const { register, handleSubmit } = useForm<Inputs>({ values: props.initialValues });
    const isEditBoard = Boolean(props.initialValues);

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditBoard ? "✏️ Edit board" : "Create board"}</DialogTitle>
                </DialogHeader>
                <form className="space-y-2" onSubmit={handleSubmit(props.onSubmit)}>
                    <label className="text-sm">Board name</label>
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-1 ring-inset ring-border focus:ring-2"
                        placeholder="e.g. Personal"
                        required
                        {...register("boardName")}
                    />
                </form>
                <DialogFooter>
                    <Button type="submit">{isEditBoard ? "Save" : "Create"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
