import { openDB } from "./indexedDB";
import type { Task } from "./types";

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

export const getTasks = (): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
        openDB()
            .then((db) => {
                const transaction = db.transaction(["tasks"], "readonly");
                const store = transaction.objectStore("tasks");
                const index = store.index("columnId");
                const request = index.getAll();

                request.onsuccess = () => resolve(request.result as Task[]);
                request.onerror = () => reject(request.error);
            })
            .catch(reject);
    });
};

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
