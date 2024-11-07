export {};

declare global {
	interface StringConstructor {
		<T extends string | number | bigint | boolean>(value: T): `${T}`;
		/* 
			These are needed because typescript ignores the generic overload
			 when String function passed to a caller directly
		*/
		(value: number): `${number}`;
		(value: bigint): `${bigint}`;
		(value: boolean): `${boolean}`;
	}
}
