import { Signal } from "purified-js";

// TODO: changes on purified-js required

export function createKvSignal<T>(params: {
	key: string;
	initial: T;
	transformers: {
		input: (value: T) => string;
		output: (value: string) => T;
	};
}): {
	signal: Signal<T>;
	set(value: T): void;
} {
	const signal = new Signal.State(null, (set) => {});

	return {
		signal,
		set(value) {
			localStorage.setItem(params.key, params.transformers.input(value));
		},
	};
}
