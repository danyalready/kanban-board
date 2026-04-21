import { PriorityHighIcon, PriorityLowIcon, PriorityMediumIcon } from "./icons";

type Priority = "low" | "medium" | "high";

export function PriorityIcon({
    priority,
    ...props
}: { priority: Priority } & React.SVGProps<SVGSVGElement>) {
    switch (priority) {
        case "low":
            return <PriorityLowIcon {...props} />;
        case "medium":
            return <PriorityMediumIcon {...props} />;
        case "high":
            return <PriorityHighIcon {...props} />;
    }
}
