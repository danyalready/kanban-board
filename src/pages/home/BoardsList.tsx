import { Link } from "react-router-dom";

import type { Board } from "@/db/types";

import BoardActions from "./BoardActions";

interface Props {
    boards: Board[];
    onClickEdit: (board: Board) => void;
    onClickDelete: (board: Board) => void;
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
                    <BoardActions
                        onClickEdit={() => props.onClickEdit(board)}
                        onClickDelete={() => props.onClickDelete(board)}
                    />
                </li>
            ))}
        </ul>
    );
}
