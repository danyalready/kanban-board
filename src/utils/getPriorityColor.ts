export function getPriorityColor(priority: "low" | "medium" | "high") {
    switch (priority) {
        case "low":
            return "#f1c06f";
        case "medium":
            return "#0e9ceb";
        case "high":
            return "#fa1877";
        default:
            return "#fefefe";
    }
}
