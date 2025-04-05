import Dexie, { type Table } from "dexie";

import type { Board, Column, Task, Comment } from "./types";

class KanbanDB extends Dexie {
    boards!: Table<Board, string>;
    columns!: Table<Column, string>;
    tasks!: Table<Task, string>;
    comments!: Table<Comment, string>;

    constructor() {
        super("KanbanDB");
        this.version(1).stores({
            boards: "++id, name, createdAt",
            columns: "++id, boardId, name, position",
            tasks: "++id, columnId, title, description, priority, createdAt, position",
            comments: "++id, taskId, text, createdAt",
        });
    }
}

export const db = new KanbanDB();
