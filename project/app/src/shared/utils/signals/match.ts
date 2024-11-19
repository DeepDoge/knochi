import { Signal } from "@purifyjs/core";

export function match<T>(signal: Signal<T>) {
	return {
		if<U extends T>(condition: (value: T) => value is U) {
			return {
				then<Then>(thenDerive: (signal: Signal<Extract<T, U>>) => Then) {
					return {
						else<Else>(elseDerive: (signal: Signal<Exclude<T, U>>) => Else) {
							return signal.derive(condition).derive((isThen) => {
								if (isThen) {
									return thenDerive(signal as never);
								} else {
									return elseDerive(signal as never);
								}
							});
						},
					};
				},
			};
		},
	};
}
