import { db } from "@/shared/lib/db";
import type { Board, Column, Comment, Task } from "@/domain/kanban/types";
import { t } from "@/shared/i18n";

const DEMO_SEED_KEY = "kanban-demo-board-seeded";
const POSITION_OFFSET = 1e4;

export async function seedDemoBoardIfNeeded() {
    if (localStorage.getItem(DEMO_SEED_KEY)) return;

    const boardsCount = await db.boards.count();

    if (boardsCount > 0) {
        localStorage.setItem(DEMO_SEED_KEY, "true");
        return;
    }

    const now = Date.now();
    const boardId = "demo-board";
    const backlogColumnId = "demo-column-backlog";
    const progressColumnId = "demo-column-progress";
    const reviewColumnId = "demo-column-review";
    const doneColumnId = "demo-column-done";

    const board: Board = {
        id: boardId,
        name: t("demo.board.name"),
        createdAt: now - 1000 * 60 * 60 * 24 * 6,
    };

    const columns: Column[] = [
        {
            id: backlogColumnId,
            boardId,
            name: t("demo.column.backlog"),
            position: POSITION_OFFSET,
            createdAt: now - 1000 * 60 * 60 * 24 * 6,
        },
        {
            id: progressColumnId,
            boardId,
            name: t("demo.column.inProgress"),
            position: POSITION_OFFSET * 2,
            createdAt: now - 1000 * 60 * 60 * 24 * 5,
        },
        {
            id: reviewColumnId,
            boardId,
            name: t("demo.column.review"),
            position: POSITION_OFFSET * 3,
            createdAt: now - 1000 * 60 * 60 * 24 * 4,
        },
        {
            id: doneColumnId,
            boardId,
            name: t("demo.column.done"),
            position: POSITION_OFFSET * 4,
            createdAt: now - 1000 * 60 * 60 * 24 * 3,
        },
    ];

    const tasks: Task[] = [
        {
            id: "demo-task-research",
            columnId: backlogColumnId,
            title: t("demo.task.research.title"),
            description: t("demo.task.research.description"),
            priority: "high",
            position: POSITION_OFFSET,
            createdAt: now - 1000 * 60 * 60 * 24 * 5,
        },
        {
            id: "demo-task-pricing",
            columnId: backlogColumnId,
            title: t("demo.task.pricing.title"),
            description: t("demo.task.pricing.description"),
            priority: "medium",
            position: POSITION_OFFSET * 2,
            createdAt: now - 1000 * 60 * 60 * 24 * 4,
        },
        {
            id: "demo-task-landing",
            columnId: progressColumnId,
            title: t("demo.task.landing.title"),
            description: t("demo.task.landing.description"),
            priority: "high",
            position: POSITION_OFFSET,
            createdAt: now - 1000 * 60 * 60 * 24 * 3,
        },
        {
            id: "demo-task-email",
            columnId: progressColumnId,
            title: t("demo.task.email.title"),
            description: t("demo.task.email.description"),
            priority: "medium",
            position: POSITION_OFFSET * 2,
            createdAt: now - 1000 * 60 * 60 * 24 * 2,
        },
        {
            id: "demo-task-qa",
            columnId: reviewColumnId,
            title: t("demo.task.qa.title"),
            description: t("demo.task.qa.description"),
            priority: "high",
            position: POSITION_OFFSET,
            createdAt: now - 1000 * 60 * 60 * 24,
        },
        {
            id: "demo-task-brand",
            columnId: doneColumnId,
            title: t("demo.task.brand.title"),
            description: t("demo.task.brand.description"),
            priority: "low",
            position: POSITION_OFFSET,
            createdAt: now - 1000 * 60 * 60 * 12,
        },
    ];

    const comments: Comment[] = [
        {
            id: "demo-comment-research-1",
            taskId: "demo-task-research",
            text: t("demo.comment.research"),
            createdAt: now - 1000 * 60 * 60 * 24 * 4,
        },
        {
            id: "demo-comment-landing-1",
            taskId: "demo-task-landing",
            text: t("demo.comment.landing"),
            createdAt: now - 1000 * 60 * 60 * 30,
        },
        {
            id: "demo-comment-qa-1",
            taskId: "demo-task-qa",
            text: t("demo.comment.qa"),
            createdAt: now - 1000 * 60 * 60 * 8,
        },
    ];

    await db.transaction("rw", db.boards, db.columns, db.tasks, db.comments, async () => {
        await db.boards.add(board);
        await db.columns.bulkAdd(columns);
        await db.tasks.bulkAdd(tasks);
        await db.comments.bulkAdd(comments);
    });

    localStorage.setItem(DEMO_SEED_KEY, "true");
}
