export {};

declare global {
	interface StringConstructor {
		<T extends string | number | bigint | boolean | null | undefined>(value: T): `${T}`;
		/* 
			These are needed because typescript ignores the generic overload
			 when String function passed to a caller directly
		*/
		(value: string): `${string}`;
		(value: number): `${number}`;
		(value: bigint): `${bigint}`;
		(value: boolean): `${boolean}`;
	}
}
