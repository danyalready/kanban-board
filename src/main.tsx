import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/shared/ui/sonner";

import "./index.css";
import App from "./app/App";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
        <Toaster />
    </StrictMode>,
);
