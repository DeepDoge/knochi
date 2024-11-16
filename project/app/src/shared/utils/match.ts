import { ref, Signal } from "@purifyjs/core";

export function match<T>(signal: Signal<T>) {
	return {
		if<U extends T>(condition: (value: T) => value is U) {
			return {
				then<Then>(thenDerive: (signal: Signal<Extract<T, U>>) => Then) {
					return {
						else<Else>(
							elseDerive: (signal: Signal<Exclude<T, U>>) => Else,
						): Signal<Then | Else> {
							return ref<Then | Else>(null!, (set) =>
								signal.derive(condition).follow((isThen) => {
									console.log(isThen);
									if (isThen) {
										return set(thenDerive(signal as never));
									} else {
										return set(elseDerive(signal as never));
									}
								}, true),
							);
						},
					};
				},
			};
		},
	};
}
