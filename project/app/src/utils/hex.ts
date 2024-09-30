import { getAddress, isAddress, isHexString } from "ethers";
import { string } from "zod";

export const AddressHex = string().refine(isAddress, "Invalid EVM address").transform(getAddress);
export type AddressHex = (typeof AddressHex)["_type"];

export const Bytes32Hex = string().refine(
	(value): value is typeof isHexString extends (value: any, ...args: any[]) => value is infer U ? U : never =>
		isHexString(value, 32),
);
export type Bytes32Hex = (typeof Bytes32Hex)["_type"];
