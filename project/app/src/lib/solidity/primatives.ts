import { BigNumberish, getAddress, isAddress, isHexString, toBeHex } from "ethers";
import { string } from "zod";

type HEX = typeof HEX;
declare const HEX: unique symbol;
export type Hex = `0x${string}` & { [HEX]?: true };
export function Hex() {
	return string()
		.refine((value) => isHexString(value), `Value must be a valid hex string, prefixed with '0x'.`)
		.transform((value) => value as Hex);
}
export namespace Hex {
	export function from(value: BigNumberish) {
		return Hex().parse(toBeHex(value));
	}
}

type ADDRESS = typeof ADDRESS;
declare const ADDRESS: unique symbol;
export type Address = Hex & { [ADDRESS]?: true };
export function Address() {
	return string()
		.refine(isAddress, "Invalid EVM address")
		.transform(getAddress)
		.transform((address) => address as Address);
}
