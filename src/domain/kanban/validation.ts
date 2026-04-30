import type { Board, Column, Comment, Task, TaskPriority } from "@/domain/kanban/types";
import { t, type I18nKey } from "@/shared/i18n";

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
    constructor(
        public key: I18nKey,
        public values?: Record<string, string | number>,
    ) {
        super(t(key, values));
        this.name = "ValidationError";
    }
}

function fieldName(fieldKey: I18nKey) {
    return t(fieldKey);
}

function validateRequiredText(value: string, fieldKey: I18nKey, maxLength: number) {
    if (typeof value !== "string") {
        throw new ValidationError("validation.mustBeText", { field: fieldName(fieldKey) });
    }

    const trimmed = value.trim();

    if (!trimmed) {
        throw new ValidationError("validation.required", { field: fieldName(fieldKey) });
    }

    if (trimmed.length > maxLength) {
        throw new ValidationError("validation.maxLength", {
            field: fieldName(fieldKey),
            maxLength,
        });
    }

    return trimmed;
}

function validateOptionalText(value: string, fieldKey: I18nKey, maxLength: number) {
    if (typeof value !== "string") {
        throw new ValidationError("validation.mustBeText", { field: fieldName(fieldKey) });
    }

    if (value.length > maxLength) {
        throw new ValidationError("validation.maxLength", {
            field: fieldName(fieldKey),
            maxLength,
        });
    }

    return value;
}

function validateId(value: string, fieldKey: I18nKey) {
    return validateRequiredText(value, fieldKey, 120);
}

export function validateRecordId(value: string, fieldKey: I18nKey = "field.recordId") {
    return validateId(value, fieldKey);
}

function validatePosition(value: number, fieldKey: I18nKey) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        throw new ValidationError("validation.mustBeNonNegativeNumber", {
            field: fieldName(fieldKey),
        });
    }

    return value;
}

function validatePriority(value: TaskPriority) {
    if (!VALID_PRIORITIES.includes(value)) {
        throw new ValidationError("validation.priority");
    }

    return value;
}

export function getValidationMessage(error: unknown) {
    return error instanceof ValidationError ? t(error.key, error.values) : null;
}

export function validateCreateBoardInput(name: string) {
    return validateRequiredText(name, "field.boardName", BOARD_NAME_MAX_LENGTH);
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
        boardId: validateId(boardId, "field.boardId"),
        name: validateRequiredText(name, "field.columnName", COLUMN_NAME_MAX_LENGTH),
        position: validatePosition(position, "field.columnPosition"),
    };
}

export function validateUpdateColumnInput(updates: Partial<Column>) {
    const result: Partial<Column> = {};

    if (updates.name !== undefined) {
        result.name = validateRequiredText(
            updates.name,
            "field.columnName",
            COLUMN_NAME_MAX_LENGTH,
        );
    }

    if (updates.position !== undefined) {
        result.position = validatePosition(updates.position, "field.columnPosition");
    }

    return result;
}

export function validateCreateTaskInput(columnId: string, data: TaskInput) {
    return {
        columnId: validateId(columnId, "field.columnId"),
        data: {
            title: validateRequiredText(data.title, "field.taskTitle", TASK_TITLE_MAX_LENGTH),
            description: validateOptionalText(
                data.description,
                "field.taskDescription",
                TASK_DESCRIPTION_MAX_LENGTH,
            ),
            priority: validatePriority(data.priority),
            position: validatePosition(data.position, "field.taskPosition"),
        },
    };
}

export function validateUpdateTaskInput(data: Partial<Task>) {
    const result: Partial<Task> = {};

    if (data.columnId !== undefined) {
        result.columnId = validateId(data.columnId, "field.columnId");
    }

    if (data.title !== undefined) {
        result.title = validateRequiredText(data.title, "field.taskTitle", TASK_TITLE_MAX_LENGTH);
    }

    if (data.description !== undefined) {
        result.description = validateOptionalText(
            data.description,
            "field.taskDescription",
            TASK_DESCRIPTION_MAX_LENGTH,
        );
    }

    if (data.priority !== undefined) {
        result.priority = validatePriority(data.priority);
    }

    if (data.position !== undefined) {
        result.position = validatePosition(data.position, "field.taskPosition");
    }

    return result;
}

export function validateCreateCommentInput(taskId: string, text: string) {
    return {
        taskId: validateId(taskId, "field.taskId"),
        text: validateRequiredText(text, "field.comment", COMMENT_TEXT_MAX_LENGTH),
    };
}

export function validateUpdateCommentInput(updates: Partial<Comment>) {
    const result: Partial<Comment> = {};

    if (updates.text !== undefined) {
        result.text = validateRequiredText(updates.text, "field.comment", COMMENT_TEXT_MAX_LENGTH);
    }

    return result;
}
