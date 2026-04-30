export function getPriorityColor(priority: "low" | "medium" | "high") {
    switch (priority) {
        case "low":
            return "#22c55e";
        case "medium":
            return "#f59e0b";
        case "high":
            return "#ef4444";
        default:
            return "#fefefe";
    }
}
