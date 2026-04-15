import { BrowserRouter, Route, Routes } from "react-router-dom";

import KanbanProvider from "./contexts/KanbanProvider";
import BoardPage from "./pages/board/BoardPage";
import HomePage from "./pages/home/HomePage";

export default function App() {
    return (
        <BrowserRouter>
            <KanbanProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/:boardId" element={<BoardPage />} />
                </Routes>
            </KanbanProvider>
        </BrowserRouter>
    );
}
