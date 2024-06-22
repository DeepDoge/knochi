export namespace Utils {
	export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
		? I
		: never;
	export type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;

	export type Push<T extends any[], V> = [...T, V];

	export type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
		? []
		: Push<TuplifyUnion<Exclude<T, L>>, L>;

	export type Join<T extends any[], D extends string> = T extends []
		? ""
		: T extends [infer F extends string]
			? `${F}`
			: T extends [infer F extends string, ...infer R]
				? `${F}${D}${Join<R, D>}`
				: string;

	export type ToString<T> = `${T extends string | number | bigint | boolean | null | undefined ? T : never}`;

	export type Invert<T extends Record<PropertyKey, PropertyKey>> = {
		[K in keyof T as T[K]]: K;
	};

	export type Pretty<T> = {
		[K in keyof T]: T[K];
	};

	export type IsBijective<
		TMap extends Record<PropertyKey, PropertyKey>,
		inverted = Invert<TMap>,
		result = {
			[K in keyof inverted]: Utils.TuplifyUnion<inverted[K]>["length"] extends 1
				? true
				: `Both of ${Utils.Join<Utils.TuplifyUnion<`'${ToString<inverted[K]>}'`>, " and ">} map to '${ToString<K>}'. Please remove or modify one of them.`;
		}[keyof inverted],
	> = Extract<result, string> extends never ? true : false | Extract<result, string>;
}
