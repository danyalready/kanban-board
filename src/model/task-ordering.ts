import type { Task } from "@/db/types";
import { TASK_MIN_GAP, TASK_POSITION_OFFSET } from "@/services/taskService";

export function calculateTaskPosition(
    tasks: Task[],
    activeIndex: number,
    targetIndex: number,
): number {
    const isForwardMove = activeIndex < targetIndex;

    const before = isForwardMove ? tasks[targetIndex] : tasks[targetIndex - 1];
    const after = isForwardMove ? tasks[targetIndex + 1] : tasks[targetIndex];

    if (before && after) {
        return (before.position + after.position) / 2;
    }

    if (before) {
        return before.position + TASK_POSITION_OFFSET / 2;
    }

    if (after) {
        return after.position / 2;
    }

    return tasks[tasks.length - 1]
        ? tasks[tasks.length - 1].position + TASK_POSITION_OFFSET
        : TASK_POSITION_OFFSET;
}

export function filterTasksByColumn(tasks: Task[], columnId: string) {
    const columnTasks = tasks.filter((t) => t.columnId === columnId);
    const sortedColumnTasks = columnTasks.sort((a, b) => a.position - b.position);

    return sortedColumnTasks;
}

export function normalizeTaskPositions(tasks: Task[]): Task[] {
    return tasks.map((t, i) => ({
        ...t,
        position: (i + 1) * TASK_POSITION_OFFSET,
    }));
}

export function needsTaskPositionNormalization(tasks: Task[]): boolean {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].position <= TASK_MIN_GAP) {
            return true;
        }

        if (i > 0 && tasks[i].position - tasks[i - 1].position <= TASK_MIN_GAP) {
            return true;
        }
    }

    return false;
}
