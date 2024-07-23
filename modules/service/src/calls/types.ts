import { literal, object, string, union, unknown } from "zod";

export type RequestMessageData = (typeof RequestMessageData)["_type"];
export const RequestMessageData = object({
	type: literal("call:request"),
	module: string(),
	name: string(),
	args: unknown().array(),
});

export type ResponseMessageData = (typeof ResponseMessageData)["_type"];
export const ResponseMessageData = union([
	object({ type: literal("success"), result: unknown() }),
	object({ type: literal("error"), error: string() }),
]);
