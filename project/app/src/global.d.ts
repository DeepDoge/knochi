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

	interface HTMLElement {
		// If browser doesnt support it, popover just appears at the center, which is ok.
		anchorElement: HTMLElement | null;
	}
}
