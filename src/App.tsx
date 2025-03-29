import { KanbanBoard } from "./components/KanbanBoard";
import { KanbanProvider } from "./contexts/KanbanProvider";

function App() {
    return (
        <KanbanProvider>
            <KanbanBoard />
        </KanbanProvider>
    );
}

export default App;
