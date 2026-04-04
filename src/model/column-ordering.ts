import type { Column } from "@/db/types";
import { COLUMN_POSITION_OFFSET } from "@/services/columnService";

export function calculateColumnPosition(
    columns: Column[],
    activeIndex: number,
    targetIndex: number,
): number {
    const isForwardMove = activeIndex < targetIndex;

    const before = isForwardMove ? columns[targetIndex] : columns[targetIndex - 1];
    const after = isForwardMove ? columns[targetIndex + 1] : columns[targetIndex];

    if (before && after) {
        return (before.position + after.position) / 2;
    }

    if (before) {
        return before.position + COLUMN_POSITION_OFFSET;
    }

    if (after) {
        return after.position / 2;
    }

    return COLUMN_POSITION_OFFSET;
}
