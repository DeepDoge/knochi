import { ref, Signal } from "@purifyjs/core";

export function awaited<T, const U = null>(promise: Promise<T>, until?: U): Signal<T | U>;
export function awaited(promise: Promise<unknown>, until: unknown = null): Signal<unknown> {
	return ref(until, (set) => {
		promise.then(set);
	}).derive((value) => value);
}
