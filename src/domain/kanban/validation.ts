import type { Board, Column, Comment, Task, TaskPriority } from "@/domain/kanban/types";

const BOARD_NAME_MAX_LENGTH = 80;
const COLUMN_NAME_MAX_LENGTH = 80;
const TASK_TITLE_MAX_LENGTH = 120;
const TASK_DESCRIPTION_MAX_LENGTH = 10000;
const COMMENT_TEXT_MAX_LENGTH = 1000;
const VALID_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

interface TaskInput {
    title: string;
    description: string;
    priority: TaskPriority;
    position: number;
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

function validateRequiredText(value: string, field: string, maxLength: number) {
    if (typeof value !== "string") {
        throw new ValidationError(`${field} must be text.`);
    }

    const trimmed = value.trim();

    if (!trimmed) {
        throw new ValidationError(`${field} cannot be empty.`);
    }

    if (trimmed.length > maxLength) {
        throw new ValidationError(`${field} cannot be longer than ${maxLength} characters.`);
    }

    return trimmed;
}

function validateOptionalText(value: string, field: string, maxLength: number) {
    if (typeof value !== "string") {
        throw new ValidationError(`${field} must be text.`);
    }

    if (value.length > maxLength) {
        throw new ValidationError(`${field} cannot be longer than ${maxLength} characters.`);
    }

    return value;
}

function validateId(value: string, field: string) {
    return validateRequiredText(value, field, 120);
}

export function validateRecordId(value: string, field = "Record ID") {
    return validateId(value, field);
}

function validatePosition(value: number, field: string) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        throw new ValidationError(`${field} must be a non-negative number.`);
    }

    return value;
}

function validatePriority(value: TaskPriority) {
    if (!VALID_PRIORITIES.includes(value)) {
        throw new ValidationError("Priority must be low, medium, or high.");
    }

    return value;
}

export function getValidationMessage(error: unknown) {
    return error instanceof ValidationError ? error.message : null;
}

export function validateCreateBoardInput(name: string) {
    return validateRequiredText(name, "Board name", BOARD_NAME_MAX_LENGTH);
}

export function validateUpdateBoardInput(updates: Partial<Board>) {
    const result: Partial<Board> = {};

    if (updates.name !== undefined) {
        result.name = validateCreateBoardInput(updates.name);
    }

    return result;
}

export function validateCreateColumnInput(boardId: string, name: string, position: number) {
    return {
        boardId: validateId(boardId, "Board ID"),
        name: validateRequiredText(name, "Column name", COLUMN_NAME_MAX_LENGTH),
        position: validatePosition(position, "Column position"),
    };
}

export function validateUpdateColumnInput(updates: Partial<Column>) {
    const result: Partial<Column> = {};

    if (updates.name !== undefined) {
        result.name = validateRequiredText(updates.name, "Column name", COLUMN_NAME_MAX_LENGTH);
    }

    if (updates.position !== undefined) {
        result.position = validatePosition(updates.position, "Column position");
    }

    return result;
}

export function validateCreateTaskInput(columnId: string, data: TaskInput) {
    return {
        columnId: validateId(columnId, "Column ID"),
        data: {
            title: validateRequiredText(data.title, "Task title", TASK_TITLE_MAX_LENGTH),
            description: validateOptionalText(
                data.description,
                "Task description",
                TASK_DESCRIPTION_MAX_LENGTH,
            ),
            priority: validatePriority(data.priority),
            position: validatePosition(data.position, "Task position"),
        },
    };
}

export function validateUpdateTaskInput(data: Partial<Task>) {
    const result: Partial<Task> = {};

    if (data.columnId !== undefined) {
        result.columnId = validateId(data.columnId, "Column ID");
    }

    if (data.title !== undefined) {
        result.title = validateRequiredText(data.title, "Task title", TASK_TITLE_MAX_LENGTH);
    }

    if (data.description !== undefined) {
        result.description = validateOptionalText(
            data.description,
            "Task description",
            TASK_DESCRIPTION_MAX_LENGTH,
        );
    }

    if (data.priority !== undefined) {
        result.priority = validatePriority(data.priority);
    }

    if (data.position !== undefined) {
        result.position = validatePosition(data.position, "Task position");
    }

    return result;
}

export function validateCreateCommentInput(taskId: string, text: string) {
    return {
        taskId: validateId(taskId, "Task ID"),
        text: validateRequiredText(text, "Comment", COMMENT_TEXT_MAX_LENGTH),
    };
}

export function validateUpdateCommentInput(updates: Partial<Comment>) {
    const result: Partial<Comment> = {};

    if (updates.text !== undefined) {
        result.text = validateRequiredText(updates.text, "Comment", COMMENT_TEXT_MAX_LENGTH);
    }

    return result;
}
