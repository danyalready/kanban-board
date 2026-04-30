import { Outlet, useParams } from "react-router-dom";

import Header from "@/features/kanban/components/Header";

import { useKanban } from "./kanban/useKanban";

export default function AppLayout() {
    const { boardId } = useParams();
    const { state } = useKanban();

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
