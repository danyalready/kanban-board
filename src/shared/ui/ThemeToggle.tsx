import { MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/app/theme/useTheme";
import { t } from "@/shared/i18n";

import { Button } from "./button";

export default function ThemeToggle() {
    const { theme, toggle } = useTheme();

    return (
        <Button size="icon" variant="ghost" onClick={toggle} aria-label={t("theme.toggle")}>
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
    );
}
