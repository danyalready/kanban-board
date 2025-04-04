const DB_NAME = "kanbanDB";
const DB_VERSION = 1;

let db: IDBDatabase;

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
