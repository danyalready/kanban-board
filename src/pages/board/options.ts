import type { TaskPriority } from "@/domain/kanban/types";
import { t } from "@/shared/i18n";

export interface PriorityOption {
    label: string;
    value: TaskPriority;
}

export const PRIORITY_OPTIONS: PriorityOption[] = [
    { label: t("priority.low"), value: "low" },
    { label: t("priority.medium"), value: "medium" },
    { label: t("priority.high"), value: "high" },
];
