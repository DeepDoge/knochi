import { computed, Signal } from "@purifyjs/core";

export type SignalUnroll<T> = T extends Signal<infer U> ? SignalUnroll<U> : T;

export function unroll<T>(signal: T): SignalUnroll<T>;
export function unroll(value: unknown) {
	return computed(() => {
		while (value instanceof Signal) {
			value = value.val;
		}
		return value;
	});
}
