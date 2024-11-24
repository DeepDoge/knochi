import { computed, Signal } from "@purifyjs/core";

export type SignalUnroll<T> = T extends Signal<infer U> ? SignalUnroll<U> : Signal.Computed<T>;

export function unroll<T>(signal: T): SignalUnroll<T>;
export function unroll(signal: Signal<unknown>) {
	return computed(() => {
		let value: unknown = signal;
		while (value instanceof Signal) {
			value = value.val;
		}
		return value;
	});
}
