import { Outlet, useParams } from "react-router-dom";

import Header from "./components/Header";
import { useKanbanContext } from "./contexts/kanbanContext";

export default function AppLayout() {
    const { boardId } = useParams();
    const { state } = useKanbanContext();

    const board = state.boards.find((board) => board.id === boardId);

    return (
        <div className="flex h-screen flex-col">
            <Header board={board} />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
