import { Outlet } from "react-router-dom";

import Header from "./Header";

export default function AppLayout() {
    return (
        <div className="flex h-screen flex-col">
            <Header />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
