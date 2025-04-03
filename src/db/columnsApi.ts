import { openDB } from "./indexedDB";
import type { Column } from "./types";

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
