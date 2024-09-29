import { Utils } from "./types";

interface Constructor<T = unknown> {
	new (...args: any): T;
}

type ConstructorFromUnion<T, IN extends unknown[] = Utils.TuplifyUnion<T>, OUT extends Constructor[] = []> =
	IN extends [infer Current, ...infer Tail] ? ConstructorFromUnion<never, Tail, [...OUT, Constructor<Current>]>
	:	OUT[number];

export function instancesOf<TValue, TConstructor extends ConstructorFromUnion<TValue>>(
	value: TValue,
	...constructors: TConstructor[]
): value is Extract<TValue, InstanceType<TConstructor>>;
export function instancesOf(value: unknown, ...constructors: Constructor[]) {
	return constructors.some((constructor) => value instanceof constructor);
}
