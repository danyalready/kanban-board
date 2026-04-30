# React Kanban Board

A local-first Kanban board built with React, TypeScript, Vite, Dexie, dnd-kit, Radix UI, and Tailwind CSS.

## Features

-   Create, rename, and delete boards
-   Create, rename, reorder, and delete columns
-   Create, edit, move, prioritize, and delete tasks
-   Drag tasks within a column or across columns
-   Drag columns horizontally
-   Add, edit, and delete task comments
-   Rich-text task descriptions
-   Light and dark theme toggle
-   Local persistence with IndexedDB through Dexie
-   Sparse position ordering with automatic position normalization
-   One-time demo board seed for first-time users

## Tech Stack

-   React 18
-   TypeScript
-   Vite
-   React Router
-   Dexie / IndexedDB
-   dnd-kit
-   Shadcn UI / Radix UI
-   Tailwind CSS
-   React Quill
-   Sonner

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

Format the codebase:

```bash
npm run format
```

## Project Structure

```text
src/
  app/               Application shell, providers, global state, and routing layout
  data/              Seed data and app-level data initialization
  domain/kanban/     Kanban domain types, ordering, constants, validation, and services
  features/kanban/   Board rendering components and Kanban action hooks
  pages/             Route-level home and board screens
  shared/            Shared hooks, IndexedDB setup, UI primitives, and utilities
```

Key folders:

-   `src/app/kanban/` owns the reducer-backed Kanban context.
-   `src/app/theme/` owns theme context and persistence.
-   `src/domain/kanban/services/` contains IndexedDB persistence services for boards, columns, tasks, and comments.
-   `src/features/kanban/` contains user-facing Kanban behavior: board UI, drag overlays, tasks, and action hooks.
-   `src/shared/lib/db.ts` defines the Dexie database tables.

## Data Model

The app stores all data locally in IndexedDB:

-   `boards`
-   `columns`
-   `tasks`
-   `comments`

Columns and tasks use numeric sparse positions for drag-and-drop ordering. When positions become too dense, the app normalizes them back to predictable gaps.

On the first run in a clean browser profile, the app creates a demo board with sample columns, tasks, and comments. If the user deletes all boards later, the demo board is not recreated automatically.

## Notes

The app is client-only and does not require a backend. Clearing browser site data will remove stored boards, columns, tasks, and comments.
