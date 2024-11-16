import { computed, Signal } from "@purifyjs/core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unroll<T extends Signal<Signal<any>>>(signal: T) {
	type Unroll<T> = T extends Signal<infer U> ? Unroll<U> : T;
	return computed<Unroll<T>>(() => {
		let value: unknown = signal;
		while (value instanceof Signal) {
			value = value.val;
		}
		return value as never;
	});
}
