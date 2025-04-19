import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import type { Board, Column, Comment, Task } from "./db/types";
import KanbanProvider from "./contexts/KanbanProvider";
import BoardPage from "./pages/BoardPage";

export default function App() {
    const [boards, setBoards] = useState<Board[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        setBoards([]);
        setColumns([]);
        setTasks([]);
        setComments([]);
    }, []);

    return (
        <BrowserRouter>
            <KanbanProvider boards={boards} columns={columns} tasks={tasks} comments={comments}>
                <Routes>
                    <Route path="/:boardId" element={<BoardPage />} />
                </Routes>
            </KanbanProvider>
        </BrowserRouter>
    );
}
