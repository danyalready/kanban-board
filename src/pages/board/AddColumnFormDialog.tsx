import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { t } from "@/shared/i18n";

export interface Inputs {
    name: string;
}

interface Props {
    open: boolean;
    onSubmit: SubmitHandler<Inputs>;
    onOpenChange: (open: boolean) => void;
}

export default function AddColumnFormDialog(props: Props) {
    const { register, handleSubmit, reset } = useForm<Inputs>({ values: { name: "" } });

    useEffect(() => {
        reset({ name: "" });
    }, [props.open, reset]);

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("column.form.newTitle")}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(props.onSubmit)}>
                    <div className="mb-4">
                        <Label htmlFor="name" aria-required>
                            {t("column.form.name")}
                        </Label>
                        <Input
                            id="name"
                            {...register("name", {
                                required: true,
                                validate: (value) => value.trim().length > 0,
                            })}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => props.onOpenChange(false)}
                        >
                            {t("action.cancel")}
                        </Button>
                        <Button type="submit">{t("action.create")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
