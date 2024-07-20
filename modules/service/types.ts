import { getAddress, isAddress, isHexString } from "ethers";
import { string } from "zod";

export const Address = string().refine(isAddress, "Invalid EVM address").transform(getAddress);
export type Address = (typeof Address)["_output"];

export const Bytes32 = string().refine(
	(value): value is typeof isHexString extends (value: any, ...args: any[]) => value is infer U ? U : never =>
		isHexString(value, 32),
);
export type Bytes32 = (typeof Bytes32)["_output"];
