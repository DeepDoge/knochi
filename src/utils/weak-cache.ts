export function createWeakCacheMap<T extends object>() {
	const caches = new Map<string, WeakRef<T>>()
	const finalizer = new FinalizationRegistry((key: string) => caches.delete(key))
	function setCache(key: string, value: T) {
		const cache = getCache(key)
		if (cache) {
			if (cache === value) return
			finalizer.unregister(cache)
		}
		caches.set(key, new WeakRef(value))
		finalizer.register(value, key, value)
	}
	function getCache(key: string) {
		return caches.get(key)?.deref()
	}

	return { setCache, getCache }
}
