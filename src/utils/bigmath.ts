export namespace BigMath {
	export function abs(x: bigint) {
		return x < 0n ? -x : x
	}

	export function sign(x: bigint) {
		return x === 0n ? 0n : x < 0n ? -1n : 1n
	}

	export function pow(base: bigint, exponent: bigint) {
		return base ** exponent
	}

	export function min(value: bigint, ...values: bigint[]) {
		for (const v of values) if (v < value) value = v
		return value
	}

	export function max(value: bigint, ...values: bigint[]) {
		for (const v of values) if (v > value) value = v
		return value
	}
}
