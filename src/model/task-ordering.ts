import type { Task } from "@/db/types";
import { TASK_MIN_GAP, TASK_POSITION_OFFSET } from "@/services/taskService";

export function calculateTaskPosition(tasks: Task[], targetIndex: number): number {
    const before = tasks[targetIndex - 1];
    const after = tasks[targetIndex];

    if (before && after) {
        return (before.position + after.position) / 2;
    }

    if (before) {
        return before.position + TASK_POSITION_OFFSET;
    }

    if (after) {
        return after.position / 2;
    }

    return TASK_POSITION_OFFSET;
}

export function filterTasksByColumn(tasks: Task[], columnId: string) {
    return tasks.filter((t) => t.columnId === columnId).sort((a, b) => a.position - b.position);
}

export function reindex(tasks: Task[]): Task[] {
    return tasks.map((t, i) => ({
        ...t,
        position: (i + 1) * TASK_POSITION_OFFSET,
    }));
}

export function needsReindex(tasks: Task[]): boolean {
    for (let i = 1; i < tasks.length; i++) {
        if (tasks[i].position - tasks[i - 1].position <= TASK_MIN_GAP) {
            return true;
        }
    }

    return false;
}
