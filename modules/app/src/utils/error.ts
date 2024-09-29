export function toBeError(value: unknown) {
	return value instanceof Error ? value : new Error(String(value));
}

export function ifNotError<TValue>(value: Error extends TValue ? TValue : never): {
	then<TReturns>(callback: (value: Exclude<TValue, Error>) => TReturns): TReturns | Extract<TValue, Error>;
};
export function ifNotError(value: unknown) {
	return {
		then(callback: (value: unknown) => unknown) {
			if (value instanceof Error) {
				return value;
			} else {
				return callback(value);
			}
		},
	};
}
