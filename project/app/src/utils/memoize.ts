export function memoize<TParams extends unknown[], TReturns>(
	fn: (...args: TParams) => TReturns,
	key: (...args: TParams) => unknown = (...args) => JSON.stringify(args, (_, value) => String(value)),
) {
	const caches = new Map<unknown, TReturns>();
	return (...args: TParams): TReturns => {
		const cacheKey = key(...args);
		const cache = caches.get(cacheKey);
		if (cache) {
			return cache;
		}

		const result = fn(...args);
		caches.set(cacheKey, result);
		return result;
	};
}

export function memoizeUntilSettled<TParams extends unknown[], TReturns extends Promise<unknown>>(
	key: (...args: TParams) => unknown,
	fn: (...args: TParams) => TReturns,
) {
	const caches = new Map<unknown, TReturns>();
	return (...args: TParams): TReturns => {
		const cacheKey = key(...args);
		const cache = caches.get(cacheKey);
		if (cache) {
			return cache;
		}

		const result = fn(...args);
		caches.set(cacheKey, result);
		result.then(() => caches.delete(cacheKey));
		return result;
	};
}
