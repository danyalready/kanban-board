import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import type { Board } from "@/db/types";

interface Props {
    boards: Board[];
    onClickEdit: (board: Board) => void;
}

export default function BoardsList(props: Props) {
    return (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {props.boards.map((board) => (
                <li
                    key={board.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                >
                    <div className="min-w-0">
                        <Link className="font-medium hover:underline" to={`/${board.id}`}>
                            {board.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                            {new Date(board.createdAt).toLocaleString()}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => props.onClickEdit(board)}>
                            Edit
                        </Button>

                        <Button asChild>
                            <Link to={`/${board.id}`}>Open</Link>
                        </Button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
