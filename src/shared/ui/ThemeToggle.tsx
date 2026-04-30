import { MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/app/theme/useTheme";

import { Button } from "./button";

export default function ThemeToggle() {
    const { theme, toggle } = useTheme();

    return (
        <Button size="icon" variant="ghost" onClick={toggle}>
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
    );
}
