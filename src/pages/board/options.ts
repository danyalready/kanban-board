import type { TaskPriority } from "@/domain/kanban/types";

export interface PriorityOption {
    label: string;
    value: TaskPriority;
}

export const PRIORITY_OPTIONS: PriorityOption[] = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
];
