import { getAddress, isAddress, isHexString } from "ethers";
import { string, ZodType, ZodTypeDef } from "zod";

type HEX = typeof HEX;
declare const HEX: unique symbol;
export type Hex<TLength extends `${bigint}`> = `0x${string}` & { [HEX]?: TLength };

export function Hex(): ZodType<Hex<`${bigint}`>, ZodTypeDef, string>;
export function Hex<TLength extends `${bigint}`>(
	bytes: TLength,
): ZodType<Hex<TLength>, ZodTypeDef, string>;
export function Hex(length?: `${bigint}`) {
	let builder = string();

	if (length != null) {
		builder = builder.length(2 + Number(length) * 2);
	}

	return builder.refine(
		(value) => isHexString(value),
		`Value must be a valid hex string, prefixed with '0x'.`,
	);
}

type ADDRESS = typeof ADDRESS;
declare const ADDRESS: unique symbol;
export type Address = Hex<"20"> & { [ADDRESS]?: true };
export function Address() {
	return string()
		.refine(isAddress, "Invalid EVM address")
		.transform(getAddress)
		.transform((address) => address as Address);
}
