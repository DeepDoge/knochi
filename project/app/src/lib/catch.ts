export type Result<T = unknown, TError extends ErrorConstructor = ErrorConstructor> =
	| {
			readonly data: T;
			readonly error?: undefined;
	  }
	| {
			readonly data?: undefined;
			readonly error: InstanceType<TError>;
	  };
export function Result<T, TError extends ErrorConstructor>(
	init:
		| { success: true; data: T; error?: undefined }
		| { success: false; data?: undefined; error: InstanceType<TError> },
): Result<T, TError> {
	if (init.success) {
		return { data: init.data };
	}
	return { error: init.error };
}

export function catchError<T, TError extends ErrorConstructor>(
	source: Promise<T>,
	errors: TError[],
): Promise<Result<T, TError>>;
export function catchError<T, TError extends ErrorConstructor>(source: () => T, errors: TError[]): Result<T, TError>;
export function catchError(
	source: (() => unknown) | Promise<unknown>,
	errors: ErrorConstructor[],
): Result | Promise<Result> {
	if (source instanceof Promise) {
		return source
			.then((data) => Result({ success: true, data }))
			.catch((throwed) => {
				const throwedError = throwed instanceof Error ? throwed : new Error(String(throwed));
				for (const error of errors) {
					if (throwedError instanceof error) {
						return Result({ success: false, error: throwedError });
					}
				}
				throw throwed;
			});
	}

	try {
		const data = source();
		return Result({ success: true, data });
	} catch (throwed) {
		const throwedError = throwed instanceof Error ? throwed : new Error(String(throwed));
		for (const error of errors) {
			if (throwedError instanceof error) {
				return Result({ success: false, error: throwedError });
			}
		}

		throw throwed;
	}
}
