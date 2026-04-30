import { useLocation, Link } from "react-router-dom";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import type { Board } from "@/domain/kanban/types";
import ThemeToggle from "@/shared/ui/ThemeToggle";
import { t } from "@/shared/i18n";

interface Props {
    board?: Board;
}

export default function Header(props: Props) {
    const location = useLocation();

    const isHome = location.pathname === "/";

    return (
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            {isHome ? (
                                <BreadcrumbPage>{t("board.boards")}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link to="/">{t("board.boards")}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>

                        {!isHome && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {props.board?.name || t("kanban.loading")}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-3">
                <ThemeToggle />
            </div>
        </header>
    );
}
