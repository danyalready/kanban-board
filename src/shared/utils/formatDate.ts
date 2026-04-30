export function formatDate(input: string | number | Date) {
    const date = new Date(input);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Today / Yesterday
    const isSameDay =
        now.getFullYear() === date.getFullYear() &&
        now.getMonth() === date.getMonth() &&
        now.getDate() === date.getDate();

    if (isSameDay) return "Today";

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
        yesterday.getFullYear() === date.getFullYear() &&
        yesterday.getMonth() === date.getMonth() &&
        yesterday.getDate() === date.getDate();

    if (isYesterday) return "Yesterday";

    // < 7 days
    if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }

    // >= 7 days → normal date
    return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
    }).format(date);
}
