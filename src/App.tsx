import { BrowserRouter, Route, Routes } from "react-router-dom";

import KanbanProvider from "./contexts/KanbanProvider";
import BoardPage from "./pages/board/BoardPage";
import HomePage from "./pages/home/HomePage";
import AppLayout from "./components/layout/AppLayout";
import { ThemeProvider } from "./contexts/ThemeProvider";

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
