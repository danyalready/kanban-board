import { useForm, SubmitHandler } from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
                    <div className="mb-4">
                        <Label htmlFor="title" required>
                            Board name
                        </Label>
                        <Input id="title" {...register("boardName", { required: true })} />
                    </div>

                    <DialogFooter>
                        <Button type="submit">{isEditBoard ? "Save" : "Create"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
