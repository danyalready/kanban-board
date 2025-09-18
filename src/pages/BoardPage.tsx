import { useParams } from "react-router-dom";
import KanbanBoard from "@/components/KanbanBoard";

export default function BoardPage() {
    const { boardId } = useParams();

    return <KanbanBoard boardId={boardId ?? ""} />;
}
