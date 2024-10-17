import { getAddress, isAddress, isHexString } from "ethers";
import { bigint, string } from "zod";

type ADDRESS = typeof ADDRESS;
declare const ADDRESS: unique symbol;
export type Address = BytesHex<20> & { [ADDRESS]: "0x" };
export const Address = () =>
	string()
		.refine(isAddress, "Invalid EVM address")
		.transform(getAddress)
		.transform((address) => address as Address);

type BYTES = typeof BYTES;
declare const BYTES: unique symbol;
export type BytesHex<TByteLength extends number = number> = `0x${string}` & { [BYTES]: TByteLength };
export const BytesHex = <TByteLength extends number = number>(length?: TByteLength) =>
	string()
		.refine(
			(value) => isHexString(value, Number(length) * 2),
			`Value must be a valid hex string of ${length} bytes, prefixed with '0x' and exactly ${Number(length) * 2} hex characters long.`,
		)
		.transform((value) => value as BytesHex<TByteLength>);

type UINT = typeof UINT;
declare const UINT: unique symbol;
export type Uint<TBitLength extends BitLength> = bigint & {
	[UINT]: TBitLength;
};
export const Uint = <TBitLength extends BitLength>(bitLength: TBitLength) =>
	bigint()
		.min(0n)
		.max(2n ** BigInt(bitLength) - 1n)
		.refine((value) => value >= 0n, "Value must be a positive unsigned integer")
		.transform((value) => value as Uint<TBitLength>);

export type BitLength =
	| "8"
	| "16"
	| "24"
	| "32"
	| "40"
	| "48"
	| "56"
	| "64"
	| "72"
	| "80"
	| "88"
	| "96"
	| "104"
	| "112"
	| "120"
	| "128"
	| "136"
	| "144"
	| "152"
	| "160"
	| "168"
	| "176"
	| "184"
	| "192"
	| "200"
	| "208"
	| "216"
	| "224"
	| "232"
	| "240"
	| "248"
	| "256";
