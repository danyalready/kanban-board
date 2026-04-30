import { CreateTaskInput } from "@/services/taskService";

export function validateCreateTaskInput(data: CreateTaskInput): CreateTaskInput | null {
    const trimmed = data.title.trim();
    if (!trimmed) return null;

    return { ...data, title: trimmed };
}

export function validateUpdateTaskInput(data: Partial<CreateTaskInput>) {
    const result = { ...data };

    if (result.title !== undefined) {
        const trimmed = result.title.trim();

        if (!trimmed) return null;

        result.title = trimmed;
    }

    return result;
}
