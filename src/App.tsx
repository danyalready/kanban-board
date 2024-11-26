import { KanbanBoard } from "./KanbanBoard";

const initialColumns = [
    {
        id: "column-1",
        name: "To Do",
        items: [
            { id: "item-1", name: "Go to shopping", description: "Task 1" },
            { id: "item-2", name: "Go to post office", description: "Task 2" },
        ],
    },
    {
        id: "column-2",
        name: "In Progress",
        items: [{ id: "item-3", name: "", description: "Task 3" }],
    },
    {
        id: "column-3",
        name: "Done",
        items: [],
    },
];

function App() {
    return (
        <div>
            <KanbanBoard columns={initialColumns} />
        </div>
    );
}

export default App;
