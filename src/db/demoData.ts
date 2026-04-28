import { db } from "./db";
import type { Board, Column, Comment, Task } from "./types";

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
        name: "🚀 Product Launch",
        createdAt: now - 1000 * 60 * 60 * 24 * 6,
    };

    const columns: Column[] = [
        {
            id: backlogColumnId,
            boardId,
            name: "Backlog",
            position: POSITION_OFFSET,
            createdAt: now - 1000 * 60 * 60 * 24 * 6,
        },
        {
            id: progressColumnId,
            boardId,
            name: "In Progress",
            position: POSITION_OFFSET * 2,
            createdAt: now - 1000 * 60 * 60 * 24 * 5,
        },
        {
            id: reviewColumnId,
            boardId,
            name: "Review",
            position: POSITION_OFFSET * 3,
            createdAt: now - 1000 * 60 * 60 * 24 * 4,
        },
        {
            id: doneColumnId,
            boardId,
            name: "Done",
            position: POSITION_OFFSET * 4,
            createdAt: now - 1000 * 60 * 60 * 24 * 3,
        },
    ];

    const tasks: Task[] = [
        {
            id: "demo-task-research",
            columnId: backlogColumnId,
            title: "📝 Collect launch requirements",
            description:
                "<p>Gather the launch checklist, audience notes, and stakeholder expectations.</p>",
            priority: "high",
            position: POSITION_OFFSET,
            createdAt: now - 1000 * 60 * 60 * 24 * 5,
        },
        {
            id: "demo-task-pricing",
            columnId: backlogColumnId,
            title: "Finalize pricing copy",
            description: "<p>Prepare short pricing descriptions for the launch page.</p>",
            priority: "medium",
            position: POSITION_OFFSET * 2,
            createdAt: now - 1000 * 60 * 60 * 24 * 4,
        },
        {
            id: "demo-task-landing",
            columnId: progressColumnId,
            title: "Build launch landing page",
            description: "<p>Create the first version of the launch page and wire the CTA.</p>",
            priority: "high",
            position: POSITION_OFFSET,
            createdAt: now - 1000 * 60 * 60 * 24 * 3,
        },
        {
            id: "demo-task-email",
            columnId: progressColumnId,
            title: "Draft announcement email",
            description: "<p>Write the launch email and prepare subject line options.</p>",
            priority: "medium",
            position: POSITION_OFFSET * 2,
            createdAt: now - 1000 * 60 * 60 * 24 * 2,
        },
        {
            id: "demo-task-qa",
            columnId: reviewColumnId,
            title: "Run smoke tests",
            description:
                "<p>Check board creation, drag-and-drop, comments, and theme switching.</p>",
            priority: "high",
            position: POSITION_OFFSET,
            createdAt: now - 1000 * 60 * 60 * 24,
        },
        {
            id: "demo-task-brand",
            columnId: doneColumnId,
            title: "✅ Approve brand assets",
            description: "<p>Logo, color, and social preview assets are ready for launch.</p>",
            priority: "low",
            position: POSITION_OFFSET,
            createdAt: now - 1000 * 60 * 60 * 12,
        },
    ];

    const comments: Comment[] = [
        {
            id: "demo-comment-research-1",
            taskId: "demo-task-research",
            text: "Include feedback from sales and support before this moves forward.",
            createdAt: now - 1000 * 60 * 60 * 24 * 4,
        },
        {
            id: "demo-comment-landing-1",
            taskId: "demo-task-landing",
            text: "Hero copy is ready. Waiting on final screenshots.",
            createdAt: now - 1000 * 60 * 60 * 30,
        },
        {
            id: "demo-comment-qa-1",
            taskId: "demo-task-qa",
            text: "Remember to verify the empty-state behavior after deleting the demo board.",
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
