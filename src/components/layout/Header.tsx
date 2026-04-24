import { useNavigate, useParams, useLocation } from "react-router-dom";

import ThemeToggle from "../ThemeToggle";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { boardId } = useParams();

    const isHome = location.pathname === "/";

    return (
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-3">
                {!isHome && (
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm opacity-70 hover:opacity-100"
                    >
                        ← Boards
                    </button>
                )}

                <span className="font-medium">{isHome ? "Boards" : boardId || "Loading..."}</span>
            </div>

            <div className="flex items-center gap-3">
                <ThemeToggle />
            </div>
        </header>
    );
}
