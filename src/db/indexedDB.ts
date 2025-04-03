import type { Column, Task } from "./types";

const DB_NAME = "kanbanDB";
const DB_VERSION = 1;

let db: IDBDatabase;

// Open IndexedDB
export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains("columns")) {
                const columnStore = db.createObjectStore("columns", { keyPath: "id" });
                columnStore.createIndex("order", "order", { unique: false });
            }

            if (!db.objectStoreNames.contains("tasks")) {
                const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
                taskStore.createIndex("columnId", "columnId", { unique: false });
                taskStore.createIndex("order", "order", { unique: false });
            }
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onerror = () => reject(request.error);
    });
};

// ********** COLUMNS CRUD **********

// Create Column
export const addColumn = (column: Column): Promise<void> => {
    return new Promise((resolve, reject) => {
        openDB()
            .then((db) => {
                const transaction = db.transaction(["columns"], "readwrite");
                const store = transaction.objectStore("columns");
                const request = store.add(column);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
            .catch(reject);
    });
};

// Read All Columns
export const getColumns = (): Promise<Column[]> => {
    return new Promise((resolve, reject) => {
        openDB()
            .then((db) => {
                const transaction = db.transaction(["columns"], "readonly");
                const store = transaction.objectStore("columns");
                const request = store.getAll();

                request.onsuccess = () => resolve(request.result as Column[]);
                request.onerror = () => reject(request.error);
            })
            .catch(reject);
    });
};

// Update Column
export const updateColumn = (column: Column): Promise<void> => {
    return new Promise((resolve, reject) => {
        openDB()
            .then((db) => {
                const transaction = db.transaction(["columns"], "readwrite");
                const store = transaction.objectStore("columns");
                const request = store.put(column);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
            .catch(reject);
    });
};

// Delete Column
export const deleteColumn = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        openDB()
            .then((db) => {
                const transaction = db.transaction(["columns"], "readwrite");
                const store = transaction.objectStore("columns");
                const request = store.delete(id);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
            .catch(reject);
    });
};

// ********** TASKS CRUD **********

// Create Task
export const addTask = (task: Task): Promise<void> => {
    return new Promise((resolve, reject) => {
        openDB()
            .then((db) => {
                const transaction = db.transaction(["tasks"], "readwrite");
                const store = transaction.objectStore("tasks");
                const request = store.add(task);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
            .catch(reject);
    });
};

// Read Tasks by Column
export const getTasksByColumn = (columnId: string): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
        openDB()
            .then((db) => {
                const transaction = db.transaction(["tasks"], "readonly");
                const store = transaction.objectStore("tasks");
                const index = store.index("columnId");
                const request = index.getAll(columnId);

                request.onsuccess = () => resolve(request.result as Task[]);
                request.onerror = () => reject(request.error);
            })
            .catch(reject);
    });
};

// Update Task
export const updateTask = (task: Task): Promise<void> => {
    return new Promise((resolve, reject) => {
        openDB()
            .then((db) => {
                const transaction = db.transaction(["tasks"], "readwrite");
                const store = transaction.objectStore("tasks");
                const request = store.put(task);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
            .catch(reject);
    });
};

// Delete Task
export const deleteTask = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        openDB()
            .then((db) => {
                const transaction = db.transaction(["tasks"], "readwrite");
                const store = transaction.objectStore("tasks");
                const request = store.delete(id);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
            .catch(reject);
    });
};
