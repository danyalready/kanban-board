import { Outlet, useParams, Navigate, useMatch } from "react-router-dom";

import Header from "@/features/kanban/components/Header";
import { Board } from "@/domain/kanban/types";

import { useKanban } from "./kanban/useKanban";

export default function AppLayout() {
    const { boardId } = useParams();
    const isBoardRoute = useMatch("/:boardId");

    const { state } = useKanban();

    if (isBoardRoute) {
        const board = state.boards.find((b) => b.id === boardId);

        const isLoaded = state.boards.length > 0;

        if (isLoaded && !board) return <Navigate to="/" replace />;

        if (!board) return null;

        return <Layout board={board} />;
    }

    return <Layout />;
}

function Layout({ board }: { board?: Board }) {
    return (
        <div className="flex h-screen flex-col">
            <Header board={board} />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
