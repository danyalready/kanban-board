import type { Column } from "@/domain/kanban/types";

import { COLUMN_MIN_GAP, COLUMN_POSITION_OFFSET } from "./constants";

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
        return before.position + COLUMN_POSITION_OFFSET / 2;
    }

    if (after) {
        return after.position / 2;
    }

    return COLUMN_POSITION_OFFSET;
}

export function normalizeColumnPositions(columns: Column[]): Column[] {
    return columns.map((column, index) => ({
        ...column,
        position: (index + 1) * COLUMN_POSITION_OFFSET,
    }));
}

export function needsColumnPositionNormalization(columns: Column[]): boolean {
    for (let i = 0; i < columns.length; i++) {
        if (columns[i].position <= COLUMN_MIN_GAP) {
            return true;
        }

        if (i > 0 && columns[i].position - columns[i - 1].position <= COLUMN_MIN_GAP) {
            return true;
        }
    }

    return false;
}
