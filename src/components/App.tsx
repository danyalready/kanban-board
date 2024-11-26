import { KanbanBoard } from "./KanbanBoard";
import { KanbanProvider } from "./KanbanProvider";

function App() {
    return (
        <KanbanProvider>
            <KanbanBoard />
        </KanbanProvider>
    );
}

export default App;
