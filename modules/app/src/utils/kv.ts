export type KV = {
	get<T>(key: string, options: KV.GetOptions<T>): Promise<T>;
	delete(key: string): Promise<void>;
	unsafeSet(key: string, value: unknown): Promise<void>;
	unsafeGet(key: string): Promise<unknown>;
};

export namespace KV {
	export type GetOptions<T> = {
		default(): Promise<T>;
	};
}

export const kv = createKV("default");

export function createKV(kvName: string): KV {
	const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(kvName, 1);

		request.onupgradeneeded = () => {
			const db = request.result;
			db.createObjectStore("kv_store", { keyPath: "key" });
		};

		request.onerror = () => {
			reject(request.error);
		};

		request.onsuccess = () => {
			resolve(request.result);
		};
	});

	const self: KV = {
		async get<T>(key: string, options: KV.GetOptions<T>): Promise<T> {
			const value = await self.unsafeGet(key);
			if (value !== undefined) {
				return value as T;
			} else {
				const defaultValue = await options.default();
				await self.unsafeSet(key, defaultValue);
				return defaultValue;
			}
		},
		async delete(key: string): Promise<void> {
			const db = await dbPromise;
			const transaction = db.transaction(["kv_store"], "readwrite");
			const store = transaction.objectStore("kv_store");
			const request = store.delete(key);
			return new Promise<void>((resolve, reject) => {
				request.onerror = () => {
					reject(request.error);
				};
				request.onsuccess = () => {
					resolve();
				};
			});
		},
		async unsafeSet(key: string, value: unknown): Promise<void> {
			const db = await dbPromise;
			const transaction = db.transaction(["kv_store"], "readwrite");
			const store = transaction.objectStore("kv_store");
			const request = store.put({ key, value });
			return new Promise<void>((resolve, reject) => {
				request.onerror = () => {
					reject(request.error);
				};
				request.onsuccess = () => {
					resolve();
				};
			});
		},
		async unsafeGet(key: string): Promise<unknown> {
			const db = await dbPromise;
			const transaction = db.transaction(["kv_store"], "readonly");
			const store = transaction.objectStore("kv_store");
			const request = store.get(key);
			return new Promise<unknown>((resolve, reject) => {
				request.onerror = () => {
					reject(request.error);
				};
				request.onsuccess = () => {
					if (request.result) {
						resolve(request.result.value);
					} else {
						resolve(undefined);
					}
				};
			});
		},
	};

	return self;
}
