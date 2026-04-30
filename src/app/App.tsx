import { BrowserRouter, Route, Routes } from "react-router-dom";

import BoardPage from "@/pages/board/BoardPage";
import HomePage from "@/pages/home/HomePage";

import AppLayout from "./AppLayout";
import ThemeProvider from "./theme/ThemeProvider";
import KanbanProvider from "./kanban/KanbanProvider";

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <KanbanProvider>
                    <Routes>
                        <Route element={<AppLayout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/:boardId" element={<BoardPage />} />
                        </Route>
                    </Routes>
                </KanbanProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
